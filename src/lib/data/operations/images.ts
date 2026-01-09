import { db, ImageAttachment } from '../../db';
import { v4 as uuidv4 } from 'uuid';

export interface ImageData {
  filename: string;
  mimeType: string;
  data: Blob;
  width?: number;
  height?: number;
}

/**
 * Save image attachments for a message
 */
export async function saveImageAttachments(
  messageId: string,
  chatGroupId: string,
  images: ImageData[]
): Promise<string[]> {
  const attachmentIds: string[] = [];

  for (const image of images) {
    const attachment: ImageAttachment = {
      id: uuidv4(),
      messageId,
      chatGroupId,
      filename: image.filename,
      mimeType: image.mimeType,
      data: image.data,
      width: image.width,
      height: image.height,
      size: image.data.size,
      createdAt: new Date(),
    };

    await db.imageAttachments.add(attachment);
    attachmentIds.push(attachment.id!);
  }

  return attachmentIds;
}

/**
 * Convert File to Blob for storage
 */
export async function fileToBlob(file: File): Promise<Blob> {
  return new Blob([await file.arrayBuffer()], { type: file.type });
}

/**
 * Convert base64 string to Blob
 */
export function base64ToBlob(base64: string, mimeType: string): Blob {
  const parts = base64.split(',');
  const byteString = parts.length > 1 ? parts[1]! : parts[0]!;
  const byteCharacters = atob(byteString);
  const byteNumbers = new Array(byteCharacters.length);
  
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: mimeType });
}

/**
 * Convert Blob to base64 string
 */
export function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Get image attachments for a message
 */
export async function getMessageImageAttachments(messageId: string): Promise<ImageAttachment[]> {
  return await db.imageAttachments.where('messageId').equals(messageId).toArray();
}

/**
 * Delete image attachments for a message
 */
export async function deleteMessageImageAttachments(messageId: string): Promise<void> {
  await db.imageAttachments.where('messageId').equals(messageId).delete();
}

/**
 * Delete all image attachments for a chat group
 */
export async function deleteChatGroupImageAttachments(chatGroupId: string): Promise<void> {
  await db.imageAttachments.where('chatGroupId').equals(chatGroupId).delete();
}

/**
 * Format image for API request (convert to base64 if needed)
 */
export async function formatImageForAPI(attachment: ImageAttachment): Promise<{
  type: string;
  data: string;
}> {
  const base64 = await blobToBase64(attachment.data);
  return {
    type: attachment.mimeType,
    data: base64,
  };
}

/**
 * Create a content array with text and images for OpenAI vision models
 */
export async function createOpenAIVisionContent(
  text: string,
  attachmentIds: string[]
): Promise<any[]> {
  const content: any[] = [{ type: 'text', text }];
  
  for (const id of attachmentIds) {
    const attachment = await db.imageAttachments.get(id);
    if (attachment) {
      const base64 = await blobToBase64(attachment.data);
      content.push({
        type: 'image_url',
        image_url: {
          url: base64,
        },
      });
    }
  }
  
  return content;
}

// Backwards compatibility alias
export const createVisionContent = createOpenAIVisionContent;

/**
 * Create a content array with text and images for Anthropic vision models
 */
export async function createAnthropicVisionContent(
  text: string,
  attachmentIds: string[]
): Promise<any[]> {
  const content: any[] = [{ type: 'text', text }];
  
  for (const id of attachmentIds) {
    const attachment = await db.imageAttachments.get(id);
    if (attachment) {
      const base64 = await blobToBase64(attachment.data);
      // Anthropic expects just the base64 data without the data URL prefix
      const base64Data = base64.split(',')[1];
      content.push({
        type: 'image',
        source: {
          type: 'base64',
          media_type: attachment.mimeType,
          data: base64Data,
        },
      });
    }
  }
  
  return content;
}

/**
 * Create parts array with text and images for Gemini vision models
 */
export async function createGeminiVisionParts(
  text: string,
  attachmentIds: string[]
): Promise<any[]> {
  const parts: any[] = [{ text }];
  
  for (const id of attachmentIds) {
    const attachment = await db.imageAttachments.get(id);
    if (attachment) {
      const base64 = await blobToBase64(attachment.data);
      // Remove data URL prefix for Gemini
      const base64Data = base64.split(',')[1];
      parts.push({
        inlineData: {
          data: base64Data,
          mimeType: attachment.mimeType,
        },
      });
    }
  }
  
  return parts;
}