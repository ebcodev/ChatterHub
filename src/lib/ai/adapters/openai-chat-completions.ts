import { BaseAdapter } from './base';
import { AIRequest, AIStreamChunk, AIMessage, AIError } from '../types';
import { parseOpenAIError } from '../errors';
import { db } from '@/lib/db';
import { arrayBufferToBase64 } from '@/lib/utils/base64';

export class OpenAIChatCompletionsAdapter extends BaseAdapter {
  name = 'OpenAI Chat Completions';
  supportsStreaming = true;

  private async formatMessages(request: AIRequest): Promise<any[]> {
    const messages = [];

    // Add system prompt if present
    if (request.systemPrompt) {
      messages.push({
        role: 'system',
        content: request.systemPrompt
      });
    }

    // Format messages with image support
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
              type: 'text',
              text: part.text
            });
          } else if (part.type === 'image') {
            formattedContent.push({
              type: 'image_url',
              image_url: {
                url: part.image.startsWith('data:') ? part.image : `data:image/jpeg;base64,${part.image}`
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
            const dataUrl = `data:${attachment.mimeType};base64,${base64}`;

            if (typeof lastMessage.content === 'string') {
              lastMessage.content = [
                { type: 'text', text: lastMessage.content },
                { type: 'image_url', image_url: { url: dataUrl } }
              ];
            } else if (Array.isArray(lastMessage.content)) {
              lastMessage.content.push({
                type: 'image_url',
                image_url: { url: dataUrl }
              });
            }
          }
        }
      }
    }

    return messages;
  }

  async *stream(request: AIRequest): AsyncGenerator<AIStreamChunk> {
    const url = `${request.baseUrl || 'https://api.openai.com/v1'}/chat/completions`;
    const messages = await this.formatMessages(request);

    const body = this.buildRequestBody(request, {
      messages,
      stream: true
    });

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

      const decoder = new TextDecoder();
      let buffer = '';

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
              yield { content: '', isComplete: true };
              return;
            }

            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content || '';
              const finishReason = parsed.choices?.[0]?.finish_reason;

              if (content) {
                yield { content, isComplete: false };
              }

              if (finishReason) {
                yield { content: '', isComplete: true };
              }
            } catch (e) {
              // Skip invalid JSON
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
    const url = `${request.baseUrl || 'https://api.openai.com/v1'}/chat/completions`;
    const messages = await this.formatMessages(request);

    const body = this.buildRequestBody(request, {
      messages,
      stream: false
    });

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
      const content = data.choices?.[0]?.message?.content || '';

      return {
        role: 'assistant',
        content
      };
    } catch (error) {
      throw this.formatError(error);
    }
  }

  formatError(error: any): AIError {
    // Determine provider based on error or request context
    let provider = 'OpenAI';

    if (error?.config?.baseURL) {
      if (error.config.baseURL.includes('x.ai')) {
        provider = 'xAI';
      } else if (error.config.baseURL.includes('deepseek')) {
        provider = 'DeepSeek';
      } else if (error.config.baseURL.includes('openrouter')) {
        provider = 'OpenRouter';
      }
    }

    return parseOpenAIError(error, provider);
  }
}