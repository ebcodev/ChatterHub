import { db, ChatGroup, Chat, Message, Folder, ImageAttachment } from '../db';
import { v4 as uuidv4 } from 'uuid';

export interface ChatGPTExport {
  conversations: ChatGPTConversation[];
  images: Map<string, Blob>; // Map of asset_pointer to blob
}

export interface ChatGPTConversation {
  title: string;
  create_time: number;
  update_time: number;
  mapping: Record<string, ChatGPTNode>;
  conversation_id: string;
  is_archived?: boolean;
  is_starred?: boolean;
  default_model_slug?: string;
}

export interface ChatGPTNode {
  id: string;
  message?: ChatGPTMessage;
  parent: string | null;
  children: string[];
}

export interface ChatGPTMessage {
  id: string;
  author: {
    role: 'user' | 'assistant' | 'system' | 'tool';
    name?: string;
  };
  content: {
    content_type: string;
    parts?: any[];
  };
  create_time?: number;
  metadata?: {
    model_slug?: string;
    user_context_message_data?: {
      about_user_message?: string;
      about_model_message?: string;
    };
  };
}

export interface ImportOptions {
  folderName?: string;
  organizationStrategy: 'root' | 'flat' | 'by-month' | 'by-year';
  skipArchived: boolean;
  dateFrom?: Date;
  dateTo?: Date;
  includeImages: boolean;
  modelMapping?: Record<string, string>; // Map ChatGPT models to ChatterHub models
}

export interface ImportProgress {
  total: number;
  current: number;
  currentConversation?: string;
  phase: 'parsing' | 'importing' | 'images' | 'complete';
}

// Model mapping from ChatGPT to ChatterHub
const DEFAULT_MODEL_MAPPING: Record<string, string> = {
  'gpt-4-5': 'gpt-5',
  'gpt-5-instant': 'gpt-5-mini',
  'gpt-5-t-mini': 'gpt-5-nano',
  'gpt-5-thinking': 'gpt-5',
  'gpt-4o': 'gpt-4o',
  'gpt-4o-mini': 'gpt-4o-mini',
  'gpt-4-1': 'gpt-4.1',
  'o3': 'o3',
  'o3-mini': 'o3-mini',
  'o3-mini-high': 'o3-mini',
  'o4-mini': 'o1-mini',
  'o4-mini-high': 'o1-mini',
  'o1': 'o1',
  'research': 'gpt-4o', // Fallback for research model
  'chatgpt-4o-latest': 'chatgpt-4o-latest',
  'gpt-3.5-turbo': 'gpt-4o-mini', // Map legacy model to mini
};

export class ChatGPTImporter {
  private imageStorage = new Map<string, Blob>(); // Map asset_pointer to blob
  private pendingImages: ImageAttachment[] = [];

  async parseExportFile(zipFile: File): Promise<ChatGPTExport> {
    const JSZip = (await import('jszip')).default;
    const zip = new JSZip();
    const contents = await zip.loadAsync(zipFile);

    // Parse conversations.json
    const conversationsFile = contents.file('conversations.json');
    if (!conversationsFile) {
      throw new Error('No conversations.json found in export');
    }

    const conversationsText = await conversationsFile.async('text');
    const conversations = JSON.parse(conversationsText) as ChatGPTConversation[];

    // Load images
    const images = new Map<string, Blob>();
    const imageFiles = Object.keys(contents.files).filter(name =>
      /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(name)
    );

    console.log('Loading images from ChatGPT export...');
    for (const imagePath of imageFiles) {
      const file = contents.file(imagePath);
      if (file) {
        const blob = await file.async('blob');
        console.log('Found image file:', imagePath);

        // Extract asset pointer from filename (e.g., file-xyz123.png -> file-service://file-xyz123)
        const filename = imagePath.split('/').pop();
        if (filename) {
          const assetId = filename.replace(/\.[^.]+$/, ''); // Remove extension

          // Store with multiple possible key formats for better matching
          images.set(`file-service://${assetId}`, blob);
          images.set(`file-service://file-${assetId}`, blob); // Sometimes has 'file-' prefix
          images.set(assetId, blob); // Without prefix
          images.set(`file-${assetId}`, blob); // With 'file-' prefix but no protocol

          // Also handle case where the file ID might be in the path
          // e.g., uploads/file-QZnXtTCbJ3VYWqnASy1qZr/image.png
          const pathParts = imagePath.split('/');
          for (const part of pathParts) {
            if (part.startsWith('file-') && part.length > 10) {
              images.set(`file-service://${part}`, blob);
              images.set(part, blob);

              // Extract base file ID (before any UUID suffix)
              // Pattern: file-[22 chars]-[UUID]
              const baseMatch = part.match(/file-[A-Za-z0-9]{22}/);
              if (baseMatch) {
                images.set(`file-service://${baseMatch[0]}`, blob);
                images.set(baseMatch[0], blob);
              }
            }
          }

          // Also extract base file ID from the filename
          // Handle pattern: file-XXXXXX-UUID.extension
          const baseFileMatch = assetId.match(/file-[A-Za-z0-9]{22}/);
          if (baseFileMatch) {
            const baseFileId = baseFileMatch[0];
            images.set(`file-service://${baseFileId}`, blob);
            images.set(baseFileId, blob);
          }
        }
      }
    }
    console.log('Image keys loaded:', Array.from(images.keys()));

    return { conversations, images };
  }

  async importConversations(
    exportData: ChatGPTExport,
    options: ImportOptions,
    onProgress?: (progress: ImportProgress) => void
  ): Promise<{ imported: number; skipped: number; errors: string[] }> {
    const { conversations, images } = exportData;
    const errors: string[] = [];
    let imported = 0;
    let skipped = 0;

    // Store images for use in messages
    // Also create a mapping for partial matches (file ID without UUID suffix)
    for (const [assetPointer, blob] of images.entries()) {
      this.imageStorage.set(assetPointer, blob);

      // Extract the base file ID (before any UUID suffix)
      // e.g., file-SmKR3ZFSdChY5Q8rwFHgTC-814CCC1A-7244-482B-B244-EF664716D901
      //   -> also store as file-SmKR3ZFSdChY5Q8rwFHgTC
      const match = assetPointer.match(/file-[A-Za-z0-9]+/);
      if (match) {
        const baseFileId = match[0];
        this.imageStorage.set(`file-service://${baseFileId}`, blob);
        this.imageStorage.set(baseFileId, blob);
      }
    }

    // Group conversations by organization strategy
    const groups = this.groupConversations(conversations, options);

    const total = conversations.filter(conv =>
      this.shouldImportConversation(conv, options)
    ).length;

    let current = 0;

    for (const [groupName, groupConversations] of groups.entries()) {
      // Create folder if needed
      let folderId: string | null = null;
      if (groupName && options.organizationStrategy !== 'flat' && options.organizationStrategy !== 'root') {
        const folder: Folder = {
          id: uuidv4(),
          name: groupName,
          parentId: null,
          order: Date.now(),
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        await db.folders.add(folder);
        folderId = folder.id!;
      }

      for (const conv of groupConversations) {
        if (!this.shouldImportConversation(conv, options)) {
          skipped++;
          continue;
        }

        current++;
        onProgress?.({
          total,
          current,
          currentConversation: conv.title,
          phase: 'importing'
        });

        try {
          await this.importSingleConversation(conv, folderId, options);
          imported++;
        } catch (error) {
          errors.push(`Failed to import "${conv.title}": ${error}`);
        }
      }
    }

    // Update progress for image processing
    if (options.includeImages && images.size > 0) {
      onProgress?.({
        total,
        current: total,
        phase: 'images'
      });
    }

    onProgress?.({
      total,
      current: total,
      phase: 'complete'
    });

    return { imported, skipped, errors };
  }


  private groupConversations(
    conversations: ChatGPTConversation[],
    options: ImportOptions
  ): Map<string, ChatGPTConversation[]> {
    const groups = new Map<string, ChatGPTConversation[]>();

    conversations.forEach(conv => {
      let groupKey = '';

      if (options.organizationStrategy === 'by-month') {
        const date = new Date(conv.create_time * 1000);
        groupKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      } else if (options.organizationStrategy === 'by-year') {
        const date = new Date(conv.create_time * 1000);
        groupKey = String(date.getFullYear());
      } else if (options.organizationStrategy === 'flat') {
        groupKey = 'imported';
      }
      // For 'root' strategy, groupKey remains empty string

      if (!groups.has(groupKey)) {
        groups.set(groupKey, []);
      }
      groups.get(groupKey)!.push(conv);
    });

    return groups;
  }

  private shouldImportConversation(
    conv: ChatGPTConversation,
    options: ImportOptions
  ): boolean {
    if (options.skipArchived && conv.is_archived) {
      return false;
    }

    const convDate = new Date(conv.create_time * 1000);
    if (options.dateFrom && convDate < options.dateFrom) {
      return false;
    }
    if (options.dateTo && convDate > options.dateTo) {
      return false;
    }

    return true;
  }

  private async importSingleConversation(
    conv: ChatGPTConversation,
    folderId: string | null,
    options: ImportOptions
  ): Promise<void> {
    // Extract linear conversation path
    const messages = this.extractLinearMessages(conv.mapping);

    // Extract system prompt if present
    const systemPrompt = this.extractSystemPrompt(messages);

    // Create ChatGroup
    const chatGroup: ChatGroup = {
      id: uuidv4(),
      title: conv.title || 'Untitled Conversation',
      layout: 'vertical',
      folderId,
      order: conv.create_time,
      systemPrompt,
      isPinned: conv.is_starred,
      createdAt: new Date(conv.create_time * 1000),
      updatedAt: new Date(conv.update_time * 1000),
      lastActivityAt: new Date(conv.update_time * 1000),
    };

    await db.chatGroups.add(chatGroup);

    // Create a single Chat window
    const defaultModel = this.mapModel(conv.default_model_slug || 'gpt-4o', options.modelMapping);
    const chat: Chat = {
      id: uuidv4(),
      chatGroupId: chatGroup.id!,
      model: defaultModel,
      position: 0,
      isActive: true,
      createdAt: new Date(conv.create_time * 1000),
      updatedAt: new Date(conv.update_time * 1000),
    };

    await db.chats.add(chat);

    // Import messages
    this.pendingImages = []; // Clear pending images for this conversation

    for (const msg of messages) {
      if (msg.author.role === 'tool' ||
        (msg.author.role === 'system' && msg.content.content_type === 'user_editable_context')) {
        continue; // Skip tool messages and user context
      }

      const messageId = uuidv4();
      const content = await this.extractMessageContent(msg, options, messageId);

      // Skip messages with empty content
      if (!content || content.trim() === '') {
        continue;
      }

      const model = this.mapModel(msg.metadata?.model_slug || defaultModel, options.modelMapping);

      const message: Message = {
        id: messageId,
        chatId: chat.id!,
        chatGroupId: chatGroup.id!,
        role: msg.author.role as 'user' | 'assistant' | 'system',
        content,
        model,
        createdAt: msg.create_time ? new Date(msg.create_time * 1000) : new Date(),
      };

      await db.messages.add(message);
    }

    // Batch insert images for this conversation
    if (this.pendingImages.length > 0) {
      // Update chatGroupId for all pending images
      this.pendingImages.forEach(img => {
        img.chatGroupId = chatGroup.id!;
      });
      await db.imageAttachments.bulkAdd(this.pendingImages);
    }
  }

  private extractLinearMessages(mapping: Record<string, ChatGPTNode>): ChatGPTMessage[] {
    const messages: ChatGPTMessage[] = [];

    // Find root node
    let currentNodeId = Object.keys(mapping).find(id => !mapping[id]?.parent);

    // Follow the main branch (first child)
    while (currentNodeId) {
      const node = mapping[currentNodeId];
      if (node?.message) {
        messages.push(node.message);
      }

      // Follow first child (main branch)
      currentNodeId = node?.children?.[0];
    }

    return messages;
  }

  private extractSystemPrompt(messages: ChatGPTMessage[]): string | undefined {
    // Look for user context messages
    const contextMessage = messages.find(msg =>
      msg.content.content_type === 'user_editable_context' &&
      msg.metadata?.user_context_message_data
    );

    if (contextMessage?.metadata?.user_context_message_data) {
      const data = contextMessage.metadata.user_context_message_data;
      const parts: string[] = [];

      if (data.about_user_message) {
        parts.push(`User Profile:\n${data.about_user_message}`);
      }
      if (data.about_model_message) {
        parts.push(`Instructions:\n${data.about_model_message}`);
      }

      return parts.length > 0 ? parts.join('\n\n') : undefined;
    }

    return undefined;
  }

  private async extractMessageContent(
    msg: ChatGPTMessage,
    options: ImportOptions,
    messageId?: string
  ): Promise<string> {
    if (!msg.content.parts || msg.content.parts.length === 0) {
      return '';
    }

    const contentParts: string[] = [];

    for (const part of msg.content.parts) {
      if (typeof part === 'string') {
        contentParts.push(part);
      } else if (part && typeof part === 'object') {
        // Handle image references
        if (part.asset_pointer && options.includeImages) {
          // Try multiple formats to find the image
          let imageBlob = this.imageStorage.get(part.asset_pointer);

          // If not found, try alternative formats
          if (!imageBlob) {
            const assetId = part.asset_pointer.replace('file-service://', '');
            imageBlob = this.imageStorage.get(assetId) ||
              this.imageStorage.get(`file-${assetId}`) ||
              this.imageStorage.get(part.asset_pointer.replace('file-service://', 'file-'));

            // If still not found, try to find by partial match (ignoring UUID suffix)
            if (!imageBlob) {
              for (const [key, blob] of this.imageStorage.entries()) {
                if (key.includes(assetId) || key.includes(part.asset_pointer.replace('file-service://', ''))) {
                  imageBlob = blob;
                  break;
                }
              }
            }
          }

          if (imageBlob && messageId) {
            // Store image in database
            const imageAttachment: ImageAttachment = {
              id: uuidv4(),
              messageId,
              chatGroupId: '', // Will be set by caller
              filename: part.asset_pointer.replace('file-service://', '') + '.jpg',
              mimeType: part.content_type || 'image/jpeg',
              data: imageBlob,
              width: part.width,
              height: part.height,
              size: part.size_bytes || imageBlob.size,
              createdAt: msg.create_time ? new Date(msg.create_time * 1000) : new Date(),
            };

            // Store for later batch insert
            this.pendingImages.push(imageAttachment);
          } else {
            // Log for debugging with more detail
            const searchTerm = part.asset_pointer.replace('file-service://', '').replace('file-', '');
            console.warn(`Image not found during import:`, {
              requested: part.asset_pointer,
              searchTerm,
              availableKeys: Array.from(this.imageStorage.keys()).slice(0, 10),
              possibleMatches: Array.from(this.imageStorage.keys()).filter(k =>
                k.includes(searchTerm) || k.includes(part.asset_pointer.slice(-20))
              )
            });
            contentParts.push(`[Image not found: ${part.asset_pointer}]`);
          }
        }
        // Handle code execution output
        else if (part.text) {
          contentParts.push(part.text);
        }
        // Handle other structured content
        else if (part.content) {
          contentParts.push(part.content);
        }
      }
    }

    return contentParts.join('\n\n');
  }


  private mapModel(
    chatGPTModel: string,
    customMapping?: Record<string, string>
  ): string {
    const mapping = { ...DEFAULT_MODEL_MAPPING, ...customMapping };
    return mapping[chatGPTModel] || 'gpt-4o'; // Default fallback
  }

  // Cleanup method to clear storage
  cleanup() {
    this.imageStorage.clear();
    this.pendingImages = [];
  }
}