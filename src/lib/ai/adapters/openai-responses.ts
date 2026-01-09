import { BaseAdapter } from './base';
import { AIRequest, AIStreamChunk, AIMessage, AIError, ResponsesAPIRequest, MCPTool, MCPToolCall, MCPApprovalRequest } from '../types';
import { parseOpenAIError } from '../errors';
import { db } from '@/lib/db';
import { getActiveMCPServers } from '@/lib/data/operations/mcpServers';
import { arrayBufferToBase64 } from '@/lib/utils/base64';

export class OpenAIResponsesAdapter extends BaseAdapter {
  name = 'OpenAI Responses API';
  supportsStreaming = true;

  private async *processResponseStream(reader: ReadableStreamDefaultReader<Uint8Array>): AsyncGenerator<AIStreamChunk> {
    const decoder = new TextDecoder();
    let buffer = '';

    // Track MCP tool calls
    const toolCalls = new Map<string, MCPToolCall>();
    const approvalRequests = new Map<string, MCPApprovalRequest>();
    // Track MCP tool-list items so we can surface clear failures
    const mcpListItems = new Map<string, { serverLabel?: string }>();

    // Response id
    let responseId = ''; // Track response ID for chaining
    // Accumulate reasoning across multiple summary parts (by summary_index)
    const reasoningParts: Map<number, string> = new Map();
    // Helper to get full reasoning text joined by blank lines in index order
    const getJoinedReasoning = () => {
      const indices = Array.from(reasoningParts.keys()).sort((a, b) => a - b);
      return indices.map(i => reasoningParts.get(i) || '').filter(s => s.length > 0).join('\n\n');
    };

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') {
            yield {
              content: '',
              isComplete: true,
              usage: {
                promptTokens: 0,
                completionTokens: 0,
                totalTokens: 0
              }
            };
            return;
          }

          try {
            const parsed = JSON.parse(data);

            // Capture response ID
            if (parsed.type === 'response.created' && parsed.response?.id) {
              responseId = parsed.response.id;
            }

            // Handle different event types
            if (parsed.type === 'response.output_text.delta') {
              if (parsed.delta) {
                yield {
                  content: parsed.delta,
                  isComplete: false,
                  eventType: 'text'
                };
              }
            } else if (parsed.type === 'response.mcp_call.in_progress') {
              const itemId = parsed.item_id;
              if (itemId && !toolCalls.has(itemId)) {
                toolCalls.set(itemId, {
                  id: itemId,
                  name: '',
                  arguments: '',
                  serverLabel: '',
                  status: 'pending'
                });
              }
            } else if (parsed.type === 'response.reasoning_summary_part.added') {
              // Initialize a new reasoning part section
              const idx: number | undefined = parsed.summary_index;
              if (typeof idx === 'number' && !reasoningParts.has(idx)) {
                reasoningParts.set(idx, '');
              }
            } else if (parsed.type === 'response.reasoning_summary_text.delta') {
              // Handle reasoning text delta per summary_index
              if (parsed.delta) {
                const idx: number | undefined = parsed.summary_index;
                if (typeof idx === 'number') {
                  const current = reasoningParts.get(idx) || '';
                  reasoningParts.set(idx, current + parsed.delta);
                } else {
                  // Fallback: treat as single-part reasoning
                  const current = reasoningParts.get(0) || '';
                  reasoningParts.set(0, current + parsed.delta);
                }
                yield {
                  content: '',
                  isComplete: false,
                  reasoningDelta: parsed.delta,
                  eventType: 'reasoning_delta'
                };
              }
            } else if (parsed.type === 'response.reasoning_summary_text.done') {
              // Handle complete reasoning text for a part; emit aggregated summary
              const idx: number | undefined = parsed.summary_index;
              if (typeof idx === 'number' && typeof parsed.text === 'string') {
                reasoningParts.set(idx, parsed.text);
              } else if (typeof parsed.text === 'string') {
                // Fallback single-part
                reasoningParts.set(0, parsed.text);
              }
              const aggregated = getJoinedReasoning();
              yield {
                content: '',
                isComplete: false,
                reasoningSummary: aggregated,
                eventType: 'reasoning_complete'
              };
            } else if (parsed.type === 'response.output_item.added' || parsed.type === 'response.output_item.done') {
              const item = parsed.item;
              if (item?.type === 'reasoning') {
                // Handle reasoning item
                yield {
                  content: '',
                  isComplete: false,
                  eventType: 'reasoning'
                };
              } else if (item?.type === 'mcp_call') {
                // Determine status based on whether we have output or error
                let status: MCPToolCall['status'] = 'executing';
                if (parsed.type === 'response.output_item.done' && (item.output || item.error)) {
                  status = item.error ? 'failed' : 'completed';
                }

                const toolCall: MCPToolCall = {
                  id: item.id,
                  name: item.name,
                  arguments: item.arguments || '',
                  serverLabel: item.server_label,
                  status,
                  result: item.output,
                  error: item.error
                };
                toolCalls.set(item.id, toolCall);

                yield {
                  content: '',
                  isComplete: false,
                  toolCall,
                  eventType: 'tool_call'
                };
              } else if (item?.type === 'mcp_approval_request') {
                const approvalRequest: MCPApprovalRequest = {
                  id: item.id,
                  name: item.name,
                  arguments: item.arguments || '',
                  serverLabel: item.server_label
                };
                approvalRequests.set(item.id, approvalRequest);

                yield {
                  content: '',
                  isComplete: false,
                  approvalRequest,
                  eventType: 'approval_request',
                  responseId
                };
              } else if (item?.type === 'mcp_list_tools') {
                // Remember server label to generate a clear error message on failure
                if (item.id) {
                  mcpListItems.set(item.id, { serverLabel: item.server_label });
                }
              }
            } else if (parsed.type === 'response.mcp_call.completed') {
              const itemId = parsed.item_id;
              const toolCall = toolCalls.get(itemId);
              if (toolCall) {
                toolCall.status = 'completed';
                yield {
                  content: '',
                  isComplete: false,
                  toolCall,
                  eventType: 'tool_result'
                };
              }
            } else if (parsed.type === 'response.mcp_list_tools.failed') {
              // Surface a user-friendly error when listing tools fails for an MCP server
              const itemId: string | undefined = parsed.item_id;
              const info = itemId ? mcpListItems.get(itemId) : undefined;
              const label = info?.serverLabel || 'MCP server';
              const message = `Failed to load MCP tools from '${label}'. The server did not provide a tool list. Check the server URL and status under Settings → MCP Servers.`;
              yield {
                content: `Error: ${message}`,
                isComplete: false,
                error: {
                  code: 'network_error',
                  message,
                  provider: 'OpenAI',
                  isRetryable: false
                }
              };
            } else if (parsed.type === 'response.mcp_call_arguments.delta') {
              const itemId = parsed.item_id;
              const toolCall = toolCalls.get(itemId);
              if (toolCall && parsed.delta) {
                toolCall.arguments = parsed.delta;
              }
            } else if (parsed.type === 'response.mcp_call_arguments.done') {
              const itemId = parsed.item_id;
              const toolCall = toolCalls.get(itemId);
              if (toolCall && parsed.arguments) {
                toolCall.arguments = parsed.arguments;
              }
            } else if (parsed.type === 'error') {
              // Top-level error in the stream (often accompanies MCP failures)
              const errMsg: string = parsed.error?.message || 'Unknown error from MCP/Responses';
              yield {
                content: `Error: MCP error: ${errMsg}`,
                isComplete: false,
                error: {
                  code: parsed.error?.code === 'http_error' ? 'network_error' : 'unknown',
                  message: errMsg,
                  provider: 'OpenAI',
                  isRetryable: false,
                  originalError: parsed.error
                }
              };
            } else if (parsed.type === 'response.failed') {
              // Response terminated with failure; bubble it up clearly
              const errMsg: string = parsed.response?.error?.message || 'Response failed';
              yield {
                content: `Error: MCP error: ${errMsg}`,
                isComplete: false,
                error: {
                  code: 'server_error',
                  message: errMsg,
                  provider: 'OpenAI',
                  isRetryable: false,
                  originalError: parsed.response?.error
                }
              };
            } else if (parsed.type === 'response.completed') {
              const usage = parsed.response?.usage;
              yield {
                content: '',
                isComplete: true,
                usage: usage ? {
                  promptTokens: usage.input_tokens || 0,
                  completionTokens: usage.output_tokens || 0,
                  totalTokens: usage.total_tokens || 0
                } : undefined
              };
            }

            // Legacy format support
            if (parsed.output) {
              for (const output of parsed.output) {
                if (output.type === 'message' && output.content) {
                  for (const content of output.content) {
                    if (content.type === 'output_text' && content.text) {
                      yield {
                        content: content.text,
                        isComplete: false,
                        eventType: 'text'
                      };
                    }
                  }
                }
              }
            }
          } catch (e) {
            // Skip invalid JSON
          }
        }
      }
    }
  }

  private async getMCPTools(): Promise<MCPTool[]> {
    const activeServers = await getActiveMCPServers();
    // Filter out servers with invalid URLs (empty or placeholder values)
    return activeServers
      .filter(server =>
        server.serverUrl &&
        server.serverUrl.trim() !== ''
      )
      .map(server => ({
        type: 'mcp' as const,
        server_label: server.serverLabel,
        server_url: server.serverUrl,
        require_approval: server.requireApproval,
        // Only add allowed_tools if the array is not empty
        ...(server.allowedTools && server.allowedTools.length > 0 ? {
          allowed_tools: server.allowedTools
        } : {}),
        // Add authorization if token is present
        ...(server.authorizationToken ? {
          authorization: server.authorizationToken.startsWith('Bearer ')
            ? server.authorizationToken
            : `Bearer ${server.authorizationToken}`
        } : {})
      }));
  }

  private async formatInput(request: ResponsesAPIRequest): Promise<any> {
    const messages = [];

    // Format messages for Responses API
    for (const msg of request.messages) {
      if (typeof msg.content === 'string') {
        messages.push({
          role: msg.role,
          content: msg.content
        });
      } else {
        // Handle multimodal content
        const formattedContent = [];
        for (const part of msg.content) {
          if (part.type === 'text') {
            formattedContent.push({
              type: 'input_text',
              text: part.text
            });
          } else if (part.type === 'image') {
            formattedContent.push({
              type: 'input_image',
              image_url: part.image.startsWith('data:') ? part.image : `data:image/jpeg;base64,${part.image}`
            });
          }
        }
        messages.push({
          role: msg.role,
          content: formattedContent
        });
      }
    }

    // Add image attachments if present
    if (request.attachmentIds && request.attachmentIds.length > 0) {
      const attachments = await db.imageAttachments
        .where('id')
        .anyOf(request.attachmentIds)
        .toArray();

      for (const attachment of attachments) {
        if (attachment.data) {
          const lastMessage = messages[messages.length - 1];
          if (lastMessage) {
            // Convert Blob to base64
            const buffer = await attachment.data.arrayBuffer();
            const base64 = arrayBufferToBase64(buffer);
            const dataUrl = `data:${attachment.mimeType};base64,${base64}`;

            if (typeof lastMessage.content === 'string') {
              lastMessage.content = [
                { type: 'input_text', text: lastMessage.content },
                { type: 'input_image', image_url: dataUrl }
              ];
            } else if (Array.isArray(lastMessage.content)) {
              lastMessage.content.push({
                type: 'input_image',
                image_url: dataUrl
              });
            }
          }
        }
      }
    }

    // For Responses API, we can use either string input or messages array
    // If there's only one user message, use string format
    if (messages.length === 1 && messages[0]) {
      const firstMessage = messages[0];
      if (firstMessage.role === 'user' && typeof firstMessage.content === 'string') {
        return firstMessage.content;
      }
    }

    return messages;
  }

  async *stream(request: AIRequest): AsyncGenerator<AIStreamChunk> {
    const responsesRequest = request as ResponsesAPIRequest;
    const url = `${request.baseUrl || 'https://api.openai.com/v1'}/responses`;

    // Handle approval response flow
    if (request.previousResponseId && request.input) {
      // This is an approval response - use different body structure
      const body: any = {
        model: request.model,
        previous_response_id: request.previousResponseId,
        input: request.input,
        stream: true,
        store: true // Store responses because we're using the continuation stream
      };

      // Add instructions (system prompt) if provided
      if (request.systemPrompt || responsesRequest.instructions) {
        body.instructions = request.systemPrompt || responsesRequest.instructions;
      }

      // Add MCP tools to ensure servers are enabled during approval continuation
      const mcpTools = await this.getMCPTools();
      const allTools = [...(responsesRequest.tools || []), ...mcpTools];
      if (allTools.length > 0) {
        body.tools = allTools;
      }

      // Add reasoning effort for o-series and gpt-5 models
      if (request.modelParams?.reasoningEffort &&
        (request.model.startsWith('o') || request.model.includes('gpt-5'))) {
        body.reasoning = {
          effort: request.modelParams.reasoningEffort,
          summary: 'auto'
        };
      }

      // Apply any custom body params (e.g., connector auth, metadata)
      if (request.customBodyParams) {
        Object.assign(body, request.customBodyParams);
      }

      // Skip the formatInput for approval responses
      // Proceed directly to the request
      const headers = this.getHeaders(request, true);
      headers['Authorization'] = `Bearer ${request.apiKey}`;

      try {
        const response = await fetch(url, {
          method: 'POST',
          headers,
          body: JSON.stringify(body),
          signal: request.signal
        });

        if (!response.ok) {
          const error = await response.json().catch(() => ({ error: { message: response.statusText } }));
          throw { response: { status: response.status, data: error } };
        }

        // Process the continuation stream using the existing logic
        const reader = response.body?.getReader();
        if (!reader) throw new Error('No response body');

        // Process the stream (this will be the same as the normal flow)
        yield* this.processResponseStream(reader);
        return;
      } catch (error: any) {
        if (error.name === 'AbortError' || error.message?.includes('aborted')) {
          yield { content: '', isComplete: true };
          return;
        }
        const aiError = this.formatError(error);
        yield { content: '', isComplete: true, error: aiError };
        return;
      }
    }

    // Normal flow - format input as before
    const input = await this.formatInput(responsesRequest);

    const body: any = {
      model: request.model,
      input,
      stream: true,
      store: true // Store responses because we're using the continuation stream
    };

    // Add instructions (system prompt)
    if (request.systemPrompt || responsesRequest.instructions) {
      body.instructions = request.systemPrompt || responsesRequest.instructions;
    }

    // Add MCP tools to the request
    const mcpTools = await this.getMCPTools();

    // Combine MCP tools with any other tools specified
    const allTools = [...(responsesRequest.tools || []), ...mcpTools];
    if (allTools.length > 0) {
      body.tools = allTools;
    }

    // Apply model parameters
    if (request.modelParams) {
      if (request.modelParams.temperature !== undefined) {
        body.temperature = request.modelParams.temperature;
      }
      if (request.modelParams.maxTokens !== undefined) {
        body.max_output_tokens = request.modelParams.maxTokens;
      }
      if (request.modelParams.topP !== undefined) {
        body.top_p = request.modelParams.topP;
      }

      // Add reasoning effort for o-series and gpt-5 models
      if (request.modelParams.reasoningEffort &&
        (request.model.startsWith('o') || request.model.includes('gpt-5'))) {
        body.reasoning = {
          effort: request.modelParams.reasoningEffort,
          summary: 'auto'
        };
      }
    }

    // No additional text format options required for Responses API

    // Apply custom body params
    if (request.customBodyParams) {
      Object.assign(body, request.customBodyParams);
    }

    const headers = this.getHeaders(request, true);
    headers['Authorization'] = `Bearer ${request.apiKey}`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
        signal: request.signal
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: { message: response.statusText } }));
        throw { response: { status: response.status, data: error } };
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response body');

      yield* this.processResponseStream(reader);
    } catch (error: any) {
      // Check if this is an abort error - if so, just complete the stream without error
      if (error.name === 'AbortError' || error.message?.includes('aborted') || error.message?.includes('BodyStreamBuffer')) {
        yield { content: '', isComplete: true };
        return;
      }

      const aiError = this.formatError(error);
      yield { content: '', isComplete: true, error: aiError };
    }
  }

  async complete(request: AIRequest): Promise<AIMessage> {
    const responsesRequest = request as ResponsesAPIRequest;
    const url = `${request.baseUrl || 'https://api.openai.com/v1'}/responses`;

    const input = await this.formatInput(responsesRequest);

    const body: any = {
      model: request.model,
      input,
      stream: false
    };

    // Add instructions (system prompt)
    if (request.systemPrompt || responsesRequest.instructions) {
      body.instructions = request.systemPrompt || responsesRequest.instructions;
    }

    // Add MCP tools to the request
    const mcpTools = await this.getMCPTools();

    // Combine MCP tools with any other tools specified
    const allTools = [...(responsesRequest.tools || []), ...mcpTools];
    if (allTools.length > 0) {
      body.tools = allTools;
    }

    // Apply model parameters
    if (request.modelParams) {
      if (request.modelParams.temperature !== undefined) {
        body.temperature = request.modelParams.temperature;
      }
      if (request.modelParams.maxTokens !== undefined) {
        body.max_output_tokens = request.modelParams.maxTokens;
      }
      if (request.modelParams.topP !== undefined) {
        body.top_p = request.modelParams.topP;
      }

      // Add reasoning effort for o-series and gpt-5 models
      if (request.modelParams.reasoningEffort &&
        (request.model.startsWith('o') || request.model.includes('gpt-5'))) {
        body.reasoning = {
          effort: request.modelParams.reasoningEffort,
          summary: 'auto'
        };
      }
    }

    // No additional text format options required for Responses API

    // Don't store responses
    body.store = false;

    // Apply custom body params
    if (request.customBodyParams) {
      Object.assign(body, request.customBodyParams);
    }

    const headers = this.getHeaders(request, false);
    headers['Authorization'] = `Bearer ${request.apiKey}`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
        signal: request.signal
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: { message: response.statusText } }));
        throw { response: { status: response.status, data: error } };
      }

      const data = await response.json();

      // Extract text from Responses API format
      let content = '';
      if (data.output_text) {
        content = data.output_text;
      } else if (data.output) {
        for (const output of data.output) {
          if (output.type === 'message' && output.content) {
            for (const contentItem of output.content) {
              if (contentItem.type === 'output_text' && contentItem.text) {
                content += contentItem.text;
              }
            }
          }
        }
      }

      return {
        role: 'assistant',
        content,
        id: data.id // Store response ID for conversation continuity
      };
    } catch (error) {
      throw this.formatError(error);
    }
  }

  formatError(error: any): AIError {
    return parseOpenAIError(error, 'OpenAI');
  }
}
