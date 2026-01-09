import { BaseAdapter } from './base';
import { AIRequest, AIStreamChunk, AIMessage, AIError, MCPTool, MCPToolCall, MCPApprovalRequest } from '../types';
import { parseAnthropicError } from '../errors';
import { db } from '@/lib/db';
import { getActiveMCPServers } from '@/lib/data/operations/mcpServers';
import { arrayBufferToBase64 } from '@/lib/utils/base64';

export class AnthropicMessagesAdapter extends BaseAdapter {
  name = 'Anthropic Messages';
  supportsStreaming = true;

  private async getMCPServers(): Promise<any[]> {
    const activeServers = await getActiveMCPServers();
    // Filter out servers with invalid URLs (empty or placeholder values)
    return activeServers
      .filter(server =>
        server.serverUrl &&
        server.serverUrl.trim() !== ''
      )
      .map(server => ({
        type: 'url' as const,
        url: server.serverUrl,
        name: server.serverLabel,
        // Add tool configuration if allowed tools are specified
        ...(server.allowedTools && server.allowedTools.length > 0 ? {
          tool_configuration: {
            enabled: true,
            allowed_tools: server.allowedTools
          }
        } : {}),
        // Add authorization token if configured
        ...(server.authorizationToken ? {
          authorization_token: server.authorizationToken.replace('Bearer ', '')
        } : server.customHeaders?.['Authorization'] ? {
          authorization_token: server.customHeaders['Authorization'].replace('Bearer ', '')
        } : {})
      }));
  }

  private async formatMessages(request: AIRequest): Promise<any[]> {
    const messages = [];

    // Format messages for Anthropic API
    for (const msg of request.messages) {
      // Skip system messages as they're handled separately
      if (msg.role === 'system') continue;

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
              type: 'text',
              text: part.text
            });
          } else if (part.type === 'image') {
            // Anthropic expects specific image format
            const imageData = part.image.startsWith('data:')
              ? part.image.split(',')[1]
              : part.image;

            const mediaType = part.image.startsWith('data:image/png') ? 'image/png' : 'image/jpeg';

            formattedContent.push({
              type: 'image',
              source: {
                type: 'base64',
                media_type: mediaType,
                data: imageData
              }
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
            const mediaType = attachment.mimeType || 'image/jpeg';

            if (typeof lastMessage.content === 'string') {
              lastMessage.content = [
                { type: 'text', text: lastMessage.content },
                {
                  type: 'image',
                  source: {
                    type: 'base64',
                    media_type: mediaType,
                    data: base64
                  }
                }
              ];
            } else if (Array.isArray(lastMessage.content)) {
              lastMessage.content.push({
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: mediaType,
                  data: base64
                }
              });
            }
          }
        }
      }
    }

    return messages;
  }

  private getSystemPrompt(request: AIRequest): string | undefined {
    // Check for system prompt in request or messages
    if (request.systemPrompt) {
      return request.systemPrompt;
    }

    const systemMessage = request.messages.find(m => m.role === 'system');
    if (systemMessage && typeof systemMessage.content === 'string') {
      return systemMessage.content;
    }

    return undefined;
  }

  async *stream(request: AIRequest): AsyncGenerator<AIStreamChunk> {
    const url = `${request.baseUrl || 'https://api.anthropic.com/v1'}/messages`;
    const messages = await this.formatMessages(request);
    const systemPrompt = this.getSystemPrompt(request);

    // Get MCP servers if any are active
    const mcpServers = await this.getMCPServers();

    const body: any = {
      model: request.model,
      messages,
      stream: true,
      max_tokens: request.modelParams?.maxTokens || 4096
    };

    // Add MCP servers to the request if any are active
    if (mcpServers.length > 0) {
      body.mcp_servers = mcpServers;
    }

    if (systemPrompt) {
      body.system = systemPrompt;
    }

    // Apply model parameters
    if (request.modelParams) {
      if (request.modelParams.temperature !== undefined) {
        body.temperature = request.modelParams.temperature;
      }
      if (request.modelParams.topP !== undefined) {
        body.top_p = request.modelParams.topP;
      }
    }

    // Apply custom body params
    if (request.customBodyParams) {
      Object.assign(body, request.customBodyParams);
    }

    const headers = this.getHeaders(request, true);
    headers['x-api-key'] = request.apiKey;
    headers['anthropic-version'] = '2023-06-01';
    headers['anthropic-dangerous-direct-browser-access'] = 'true';

    // Add MCP beta header if MCP servers are active
    if (mcpServers.length > 0) {
      headers['anthropic-beta'] = 'mcp-client-2025-04-04';
    }

    // Add custom headers if provided
    if (request.customHeaders) {
      Object.assign(headers, request.customHeaders);
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
        signal: request.signal
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: { message: response.statusText } }));
        throw { status: response.status, error };
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response body');

      const decoder = new TextDecoder();
      let buffer = '';
      // Track MCP tool calls
      const toolCalls = new Map<string, MCPToolCall>();
      // Track content blocks to add proper line breaks
      let currentBlockIndex = -1;
      let currentBlockType: string | null = null;
      let isFirstTextInBlock = false;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);

            try {
              const parsed = JSON.parse(data);

              if (parsed.type === 'content_block_delta') {
                const text = parsed.delta?.text || '';
                if (text) {
                  // Add line breaks between different text blocks
                  if (isFirstTextInBlock && currentBlockIndex > 0) {
                    yield { content: '\n\n', isComplete: false };
                    isFirstTextInBlock = false;
                  }
                  yield { content: text, isComplete: false };
                }
              } else if (parsed.type === 'content_block_start') {
                // Track the new block
                currentBlockIndex = parsed.index || 0;
                currentBlockType = parsed.content_block?.type || null;

                // Mark that the next text delta should check for line breaks
                if (currentBlockType === 'text') {
                  isFirstTextInBlock = true;
                }

                // Handle MCP tool use blocks
                if (parsed.content_block?.type === 'mcp_tool_use') {
                  const toolCall: MCPToolCall = {
                    id: parsed.content_block.id,
                    name: parsed.content_block.name,
                    arguments: JSON.stringify(parsed.content_block.input || {}),
                    serverLabel: parsed.content_block.server_name || '',
                    status: 'executing'
                  };
                  toolCalls.set(parsed.content_block.id, toolCall);
                  yield {
                    content: '',
                    isComplete: false,
                    toolCall,
                    eventType: 'tool_call'
                  };
                }
                // Handle MCP tool result blocks (they come as content_block_start too)
                if (parsed.content_block?.type === 'mcp_tool_result') {
                  const toolCall = toolCalls.get(parsed.content_block.tool_use_id);
                  if (toolCall) {
                    toolCall.status = 'completed';
                    toolCall.result = JSON.stringify(parsed.content_block.content);
                    yield {
                      content: '',
                      isComplete: false,
                      toolCall,
                      eventType: 'tool_result'
                    };
                  }
                }
              } else if (parsed.type === 'content_block_stop') {
                // Empty now since mcp_tool_result is handled in content_block_start
              } else if (parsed.type === 'message_stop') {
                yield { content: '', isComplete: true };
              } else if (parsed.type === 'error') {
                throw parsed.error;
              }
            } catch (e) {
              // Skip invalid JSON unless it's an error we threw
              if (e && typeof e === 'object' && 'message' in e) {
                throw e;
              }
            }
          }
        }
      }
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
    const url = `${request.baseUrl || 'https://api.anthropic.com/v1'}/messages`;
    const messages = await this.formatMessages(request);
    const systemPrompt = this.getSystemPrompt(request);

    // Get MCP servers if any are active
    const mcpServers = await this.getMCPServers();

    const body: any = {
      model: request.model,
      messages,
      stream: false,
      max_tokens: request.modelParams?.maxTokens || 4096
    };

    // Add MCP servers to the request if any are active
    if (mcpServers.length > 0) {
      body.mcp_servers = mcpServers;
    }

    if (systemPrompt) {
      body.system = systemPrompt;
    }

    // Apply model parameters
    if (request.modelParams) {
      if (request.modelParams.temperature !== undefined) {
        body.temperature = request.modelParams.temperature;
      }
      if (request.modelParams.topP !== undefined) {
        body.top_p = request.modelParams.topP;
      }
    }

    // Apply custom body params
    if (request.customBodyParams) {
      Object.assign(body, request.customBodyParams);
    }

    const headers = this.getHeaders(request, false);
    headers['x-api-key'] = request.apiKey;
    headers['anthropic-version'] = '2023-06-01';
    headers['anthropic-dangerous-direct-browser-access'] = 'true';

    // Add MCP beta header if MCP servers are active
    if (mcpServers.length > 0) {
      headers['anthropic-beta'] = 'mcp-client-2025-04-04';
    }

    // Add custom headers if provided
    if (request.customHeaders) {
      Object.assign(headers, request.customHeaders);
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
        signal: request.signal
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: { message: response.statusText } }));
        throw { status: response.status, error };
      }

      const data = await response.json();

      // Extract text content from response
      let content = '';
      if (data.content) {
        for (const block of data.content) {
          if (block.type === 'text') {
            content += block.text;
          }
        }
      }

      return {
        role: 'assistant',
        content,
        id: data.id
      };
    } catch (error) {
      throw this.formatError(error);
    }
  }

  formatError(error: any): AIError {
    return parseAnthropicError(error);
  }
}