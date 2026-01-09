import JSZip from 'jszip';
import { db, Folder, ChatGroup, Chat, Message, ImageAttachment } from '../db';
import { v4 as uuidv4 } from 'uuid';

export interface ChatterHubImportOptions {
  mergeMode: 'replace' | 'merge'; // Always 'replace' now
  preserveIds: boolean; // Always false now
}

export interface ChatterHubImportProgress {
  total: number;
  current: number;
  currentItem?: string;
  phase: 'parsing' | 'importing' | 'complete';
}

export interface ChatterHubImportResult {
  imported: {
    folders: number;
    chatGroups: number;
    chats: number;
    messages: number;
    images: number;
  };
  errors: string[];
}

interface ChatGroupFolder {
  path: string;
  metadata: any;
  chats: Map<string, any>;
  attachments: Map<string, { blob: Blob; meta: any }>;
}

export class ChatterHubImporter {
  private idMapping: Map<string, string> = new Map(); // Old ID -> New ID mapping

  async parseExportFile(zipFile: File): Promise<Map<string, ChatGroupFolder>> {
    const zip = new JSZip();
    const contents = await zip.loadAsync(zipFile);
    const chatGroups = new Map<string, ChatGroupFolder>();

    // Parse folder structure
    for (const [path, file] of Object.entries(contents.files)) {
      if (file.dir) continue;

      const parts = path.split('/');

      // Look for metadata.json files to identify chat groups
      if (parts[parts.length - 1] === 'metadata.json') {
        const chatGroupPath = parts.slice(0, -1).join('/');
        const metadata = JSON.parse(await file.async('text'));

        chatGroups.set(chatGroupPath, {
          path: chatGroupPath,
          metadata,
          chats: new Map(),
          attachments: new Map()
        });
      }
    }

    // Parse chats and attachments
    for (const [path, file] of Object.entries(contents.files)) {
      if (file.dir) continue;

      const parts = path.split('/');
      const filename = parts[parts.length - 1];

      // Find which chat group this belongs to
      let chatGroupPath = '';
      for (const cgPath of chatGroups.keys()) {
        if (path.startsWith(cgPath + '/')) {
          chatGroupPath = cgPath;
          break;
        }
      }

      if (!chatGroupPath || !chatGroups.has(chatGroupPath)) continue;

      const chatGroup = chatGroups.get(chatGroupPath)!;

      // Parse chat files
      if (filename && filename.startsWith('chat-') && filename.endsWith('.json')) {
        const chatData = JSON.parse(await file.async('text'));
        const chatId = filename.replace('chat-', '').replace('.json', '');
        chatGroup.chats.set(chatId, chatData);
      }

      // Parse attachment metadata
      if (path.includes('/attachments/') && filename && filename.endsWith('.meta.json')) {
        const attachmentId = filename.replace('.meta.json', '');
        const meta = JSON.parse(await file.async('text'));

        // Find the actual attachment file
        const imageFiles = Object.entries(contents.files).filter(([p]) =>
          p.includes('/attachments/') &&
          p.includes(attachmentId) &&
          !p.endsWith('.meta.json')
        );

        if (imageFiles.length > 0) {
          const firstImageFile = imageFiles[0];
          if (firstImageFile) {
            const [, imageFile] = firstImageFile;
            const blob = await imageFile.async('blob');
            chatGroup.attachments.set(attachmentId, { blob, meta });
          }
        }
      }
    }

    return chatGroups;
  }

  async importData(
    chatGroups: Map<string, ChatGroupFolder>,
    options: ChatterHubImportOptions,
    onProgress?: (progress: ChatterHubImportProgress) => void
  ): Promise<ChatterHubImportResult> {
    const result: ChatterHubImportResult = {
      imported: {
        folders: 0,
        chatGroups: 0,
        chats: 0,
        messages: 0,
        images: 0
      },
      errors: []
    };

    const total = chatGroups.size;
    let current = 0;

    onProgress?.({
      total,
      current: 0,
      phase: 'importing'
    });

    // Build folder structure first
    const folderPaths = new Map<string, string>(); // Path -> Folder ID
    const processedFolders = new Set<string>();

    for (const [path] of chatGroups) {
      const parts = path.split('/');

      // Create all parent folders
      for (let i = 0; i < parts.length - 1; i++) {
        const folderPath = parts.slice(0, i + 1).join('/');

        if (!processedFolders.has(folderPath)) {
          processedFolders.add(folderPath);

          const parentPath = i > 0 ? parts.slice(0, i).join('/') : null;
          const parentId = parentPath ? folderPaths.get(parentPath) || null : null;

          const folder: Folder = {
            id: uuidv4(),
            name: parts[i] || 'Untitled Folder',
            parentId,
            order: Date.now() + result.imported.folders,
            createdAt: new Date(),
            updatedAt: new Date()
          };

          await db.folders.add(folder);
          folderPaths.set(folderPath, folder.id!);
          result.imported.folders++;
        }
      }
    }

    // Import chat groups
    for (const [path, chatGroupFolder] of chatGroups) {
      current++;
      onProgress?.({
        total,
        current,
        currentItem: chatGroupFolder.metadata.title,
        phase: 'importing'
      });

      try {
        const parentPath = path.split('/').slice(0, -1).join('/');
        const folderId = parentPath ? folderPaths.get(parentPath) || null : null;

        // Create chat group with new ID
        const oldChatGroupId = chatGroupFolder.metadata.id;
        const newChatGroupId = uuidv4();

        this.idMapping.set(oldChatGroupId, newChatGroupId);

        const chatGroup: ChatGroup = {
          ...chatGroupFolder.metadata,
          id: newChatGroupId,
          folderId,
          createdAt: new Date(chatGroupFolder.metadata.createdAt),
          updatedAt: new Date(chatGroupFolder.metadata.updatedAt),
          lastActivityAt: chatGroupFolder.metadata.lastActivityAt 
            ? new Date(chatGroupFolder.metadata.lastActivityAt)
            : new Date(chatGroupFolder.metadata.updatedAt || chatGroupFolder.metadata.createdAt)
        };

        await db.chatGroups.add(chatGroup);
        result.imported.chatGroups++;

        // Import chats and messages
        for (const [, chatData] of chatGroupFolder.chats) {
          const oldChatId = chatData.id;
          const newChatId = uuidv4();

          this.idMapping.set(oldChatId, newChatId);

          const chat: Chat = {
            id: newChatId,
            chatGroupId: newChatGroupId,
            model: chatData.model,
            position: chatData.position,
            isActive: chatData.isActive,
            x: chatData.x,
            y: chatData.y,
            width: chatData.width,
            height: chatData.height,
            zIndex: chatData.zIndex,
            createdAt: new Date(chatData.createdAt),
            updatedAt: new Date(chatData.updatedAt)
          };

          await db.chats.add(chat);
          result.imported.chats++;

          // Import messages
          for (const messageData of chatData.messages || []) {
            const oldMessageId = messageData.id;
            const newMessageId = uuidv4();

            this.idMapping.set(oldMessageId, newMessageId);

            // Update attachment references in content
            let content = messageData.content;
            if (content.includes('attachment://')) {
              for (const [oldId, newId] of this.idMapping) {
                content = content.replace(
                  new RegExp(`attachment://${oldId}`, 'g'),
                  `attachment://${newId}`
                );
              }
            }

            const message: Message = {
              id: newMessageId,
              chatId: newChatId,
              chatGroupId: newChatGroupId,
              role: messageData.role,
              content,
              model: messageData.model,
              starred: messageData.starred,
              createdAt: new Date(messageData.createdAt)
            };

            await db.messages.add(message);
            result.imported.messages++;
          }
        }

        // Import attachments
        for (const [attachmentId, { blob, meta }] of chatGroupFolder.attachments) {
          const oldMessageId = meta.messageId;
          const newMessageId = this.idMapping.get(oldMessageId) || oldMessageId;
          const newAttachmentId = uuidv4();

          this.idMapping.set(attachmentId, newAttachmentId);

          const attachment: ImageAttachment = {
            id: newAttachmentId,
            messageId: newMessageId,
            chatGroupId: newChatGroupId,
            filename: meta.filename,
            mimeType: meta.mimeType,
            data: blob,
            width: meta.width,
            height: meta.height,
            size: meta.size,
            createdAt: new Date(meta.createdAt)
          };

          await db.imageAttachments.add(attachment);
          result.imported.images++;
        }

      } catch (error) {
        result.errors.push(`Failed to import "${chatGroupFolder.metadata.title}": ${error}`);
      }
    }

    onProgress?.({
      total,
      current: total,
      phase: 'complete'
    });

    return result;
  }

  cleanup() {
    this.idMapping.clear();
  }
}