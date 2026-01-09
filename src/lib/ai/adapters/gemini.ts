import { BaseAdapter } from './base';
import { AIRequest, AIStreamChunk, AIMessage, AIError } from '../types';
import { parseGeminiError } from '../errors';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { db } from '@/lib/db';
import { arrayBufferToBase64 } from '@/lib/utils/base64';

export class GeminiAdapter extends BaseAdapter {
  name = 'Gemini';
  supportsStreaming = true;

  private async formatContents(request: AIRequest): Promise<any[]> {
    const contents = [];
    
    // Add system prompt as first user message if present
    if (request.systemPrompt) {
      contents.push({
        role: 'user',
        parts: [{ text: `System: ${request.systemPrompt}` }]
      });
      contents.push({
        role: 'model',
        parts: [{ text: 'Understood. I will follow these instructions.' }]
      });
    }
    
    // Format messages for Gemini API
    for (const msg of request.messages) {
      const role = msg.role === 'assistant' ? 'model' : 'user';
      const parts = [];
      
      if (typeof msg.content === 'string') {
        parts.push({ text: msg.content });
      } else {
        // Handle multimodal content
        for (const part of msg.content) {
          if (part.type === 'text') {
            parts.push({ text: part.text });
          } else if (part.type === 'image') {
            // Gemini expects inline base64 data
            const imageData = part.image.startsWith('data:') 
              ? part.image.split(',')[1] 
              : part.image;
            
            const mimeType = part.image.startsWith('data:image/png') ? 'image/png' : 'image/jpeg';
            
            parts.push({
              inlineData: {
                mimeType,
                data: imageData
              }
            });
          }
        }
      }
      
      contents.push({ role, parts });
    }
    
    // Add image attachments if present
    if (request.attachmentIds && request.attachmentIds.length > 0) {
      const attachments = await db.imageAttachments
        .where('id')
        .anyOf(request.attachmentIds)
        .toArray();
      
      for (const attachment of attachments) {
        if (attachment.data) {
          const lastContent = contents[contents.length - 1];
          if (lastContent) {
            // Convert Blob to base64
            const buffer = await attachment.data.arrayBuffer();
            const base64 = arrayBufferToBase64(buffer);
            const mimeType = attachment.mimeType || 'image/jpeg';
            
            lastContent.parts.push({
              inlineData: {
                mimeType,
                data: base64
              }
            });
          }
        }
      }
    }
    
    return contents;
  }

  async *stream(request: AIRequest): AsyncGenerator<AIStreamChunk> {
    try {
      const genAI = new GoogleGenerativeAI(request.apiKey);
      const model = genAI.getGenerativeModel({ model: request.model });
      
      const contents = await this.formatContents(request);
      
      // Build generation config
      const generationConfig: any = {};
      if (request.modelParams) {
        if (request.modelParams.temperature !== undefined) {
          generationConfig.temperature = request.modelParams.temperature;
        }
        if (request.modelParams.maxTokens !== undefined) {
          generationConfig.maxOutputTokens = request.modelParams.maxTokens;
        }
        if (request.modelParams.topP !== undefined) {
          generationConfig.topP = request.modelParams.topP;
        }
      }
      
      // Apply custom body params to generation config
      if (request.customBodyParams) {
        Object.assign(generationConfig, request.customBodyParams);
      }
      
      // Create chat session
      const chat = model.startChat({
        history: contents.slice(0, -1), // All but last message
        generationConfig
      });
      
      // Get the last message
      const lastMessage = contents[contents.length - 1];
      const prompt = lastMessage.parts.map((p: any) => p.text || '').join(' ');
      
      // Stream the response
      const result = await chat.sendMessageStream(prompt);
      
      for await (const chunk of result.stream) {
        const text = chunk.text();
        if (text) {
          yield { content: text, isComplete: false };
        }
      }
      
      yield { content: '', isComplete: true };
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
    try {
      const genAI = new GoogleGenerativeAI(request.apiKey);
      const model = genAI.getGenerativeModel({ model: request.model });
      
      const contents = await this.formatContents(request);
      
      // Build generation config
      const generationConfig: any = {};
      if (request.modelParams) {
        if (request.modelParams.temperature !== undefined) {
          generationConfig.temperature = request.modelParams.temperature;
        }
        if (request.modelParams.maxTokens !== undefined) {
          generationConfig.maxOutputTokens = request.modelParams.maxTokens;
        }
        if (request.modelParams.topP !== undefined) {
          generationConfig.topP = request.modelParams.topP;
        }
      }
      
      // Apply custom body params to generation config
      if (request.customBodyParams) {
        Object.assign(generationConfig, request.customBodyParams);
      }
      
      // Create chat session
      const chat = model.startChat({
        history: contents.slice(0, -1), // All but last message
        generationConfig
      });
      
      // Get the last message
      const lastMessage = contents[contents.length - 1];
      const prompt = lastMessage.parts.map((p: any) => p.text || '').join(' ');
      
      // Send the message
      const result = await chat.sendMessage(prompt);
      const response = result.response;
      const content = response.text();
      
      return {
        role: 'assistant',
        content
      };
    } catch (error) {
      throw this.formatError(error);
    }
  }

  formatError(error: any): AIError {
    return parseGeminiError(error);
  }
}