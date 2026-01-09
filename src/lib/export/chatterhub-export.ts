import JSZip from 'jszip';
import { db, Folder, ChatGroup, Chat, Message, ImageAttachment } from '../db';

export interface ExportProgress {
  total: number;
  current: number;
  currentItem?: string;
  phase: 'preparing' | 'exporting' | 'packaging' | 'complete';
}

export interface ExportOptions {
  includeImages: boolean;
  selectedFolders?: string[]; // If specified, only export these folders
  selectedChatGroups?: string[]; // If specified, only export these chat groups
}

export class ChatterHubExporter {
  private zip: JSZip;
  
  constructor() {
    this.zip = new JSZip();
  }
  
  async exportAll(
    options: ExportOptions = { includeImages: true },
    onProgress?: (progress: ExportProgress) => void
  ): Promise<Blob> {
    // Get all data
    const folders = await db.folders.toArray();
    const chatGroups = await db.chatGroups.toArray();
    const chats = await db.chats.toArray();
    const messages = await db.messages.toArray();
    const imageAttachments = options.includeImages ? await db.imageAttachments.toArray() : [];
    
    // Filter if needed
    const filteredFolders = options.selectedFolders 
      ? folders.filter(f => options.selectedFolders!.includes(f.id!))
      : folders;
    
    const filteredChatGroups = options.selectedChatGroups
      ? chatGroups.filter(cg => options.selectedChatGroups!.includes(cg.id!))
      : chatGroups;
    
    const total = filteredChatGroups.length;
    let current = 0;
    
    onProgress?.({
      total,
      current: 0,
      phase: 'preparing'
    });
    
    // Build folder path map
    const folderPaths = this.buildFolderPaths(filteredFolders);
    
    // Export each chat group
    for (const chatGroup of filteredChatGroups) {
      current++;
      onProgress?.({
        total,
        current,
        currentItem: chatGroup.title,
        phase: 'exporting'
      });
      
      await this.exportChatGroup(
        chatGroup,
        chats.filter(c => c.chatGroupId === chatGroup.id),
        messages.filter(m => m.chatGroupId === chatGroup.id),
        imageAttachments.filter(ia => ia.chatGroupId === chatGroup.id),
        folderPaths.get(chatGroup.folderId || '') || ''
      );
    }
    
    // Add manifest file
    this.zip.file('manifest.json', JSON.stringify({
      version: '1.0',
      exportDate: new Date().toISOString(),
      folderCount: filteredFolders.length,
      chatGroupCount: filteredChatGroups.length,
      messageCount: messages.length,
      imageCount: imageAttachments.length
    }, null, 2));
    
    onProgress?.({
      total,
      current: total,
      phase: 'packaging'
    });
    
    // Generate zip file with progress tracking
    const blob = await this.zip.generateAsync({
      type: 'blob',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 }
    }, (metadata) => {
      // JSZip provides progress during compression
      const percent = metadata.percent;
      onProgress?.({
        total: 100,
        current: Math.round(percent),
        phase: 'packaging'
      });
    });
    
    onProgress?.({
      total,
      current: total,
      phase: 'complete'
    });
    
    return blob;
  }
  
  private buildFolderPaths(folders: Folder[]): Map<string, string> {
    const paths = new Map<string, string>();
    const folderMap = new Map<string, Folder>();
    
    // Build folder map
    folders.forEach(folder => {
      if (folder.id) {
        folderMap.set(folder.id, folder);
      }
    });
    
    // Build paths recursively
    const buildPath = (folderId: string): string => {
      if (paths.has(folderId)) {
        return paths.get(folderId)!;
      }
      
      const folder = folderMap.get(folderId);
      if (!folder) {
        return '';
      }
      
      let path = folder.name;
      if (folder.parentId) {
        const parentPath = buildPath(folder.parentId);
        if (parentPath) {
          path = `${parentPath}/${path}`;
        }
      }
      
      paths.set(folderId, path);
      return path;
    };
    
    // Build all paths
    folders.forEach(folder => {
      if (folder.id) {
        buildPath(folder.id);
      }
    });
    
    return paths;
  }
  
  private async exportChatGroup(
    chatGroup: ChatGroup,
    chats: Chat[],
    messages: Message[],
    imageAttachments: ImageAttachment[],
    folderPath: string
  ): Promise<void> {
    // Sanitize folder name for filesystem
    const sanitizedTitle = chatGroup.title.replace(/[<>:"/\\|?*]/g, '_');
    const chatGroupPath = folderPath 
      ? `${folderPath}/${sanitizedTitle}`
      : sanitizedTitle;
    
    // Export metadata
    const metadata = {
      id: chatGroup.id,
      title: chatGroup.title,
      layout: chatGroup.layout,
      folderId: chatGroup.folderId,
      order: chatGroup.order,
      systemPrompt: chatGroup.systemPrompt,
      isTemporary: chatGroup.isTemporary,
      isPinned: chatGroup.isPinned,
      createdAt: chatGroup.createdAt,
      updatedAt: chatGroup.updatedAt
    };
    
    this.zip.file(`${chatGroupPath}/metadata.json`, JSON.stringify(metadata, null, 2));
    
    // Export each chat
    for (const chat of chats) {
      const chatMessages = messages.filter(m => m.chatId === chat.id);
      
      const chatData = {
        id: chat.id,
        model: chat.model,
        position: chat.position,
        isActive: chat.isActive,
        x: chat.x,
        y: chat.y,
        width: chat.width,
        height: chat.height,
        zIndex: chat.zIndex,
        createdAt: chat.createdAt,
        updatedAt: chat.updatedAt,
        messages: chatMessages.map(m => ({
          id: m.id,
          role: m.role,
          content: m.content,
          model: m.model,
          starred: m.starred,
          createdAt: m.createdAt
        }))
      };
      
      this.zip.file(`${chatGroupPath}/chat-${chat.id}.json`, JSON.stringify(chatData, null, 2));
    }
    
    // Export image attachments
    if (imageAttachments.length > 0) {
      for (const attachment of imageAttachments) {
        // Determine file extension from MIME type
        const extension = this.getFileExtension(attachment.mimeType);
        const filename = `${attachment.id}${extension}`;
        
        this.zip.file(`${chatGroupPath}/attachments/${filename}`, attachment.data);
        
        // Also save attachment metadata
        const attachmentMeta = {
          id: attachment.id,
          messageId: attachment.messageId,
          filename: attachment.filename,
          mimeType: attachment.mimeType,
          width: attachment.width,
          height: attachment.height,
          size: attachment.size,
          createdAt: attachment.createdAt
        };
        
        this.zip.file(
          `${chatGroupPath}/attachments/${attachment.id}.meta.json`,
          JSON.stringify(attachmentMeta, null, 2)
        );
      }
    }
  }
  
  private getFileExtension(mimeType: string): string {
    const mimeToExt: Record<string, string> = {
      'image/jpeg': '.jpg',
      'image/jpg': '.jpg',
      'image/png': '.png',
      'image/gif': '.gif',
      'image/webp': '.webp',
      'image/svg+xml': '.svg',
      'image/bmp': '.bmp',
      'image/tiff': '.tiff',
    };
    
    return mimeToExt[mimeType] || '.bin';
  }
}