import { useState, useEffect } from 'react';
import { db, ImageAttachment } from '@/lib/db';
import { useLiveQuery } from 'dexie-react-hooks';

export function useImageAttachments(chatGroupId: string) {
  const [imageUrls, setImageUrls] = useState<Map<string, string>>(new Map());
  
  // Load image attachments for this chat group
  const imageAttachments = useLiveQuery(
    () => db.imageAttachments.where('chatGroupId').equals(chatGroupId).toArray(),
    [chatGroupId]
  ) || [];
  
  useEffect(() => {
    const urls = new Map<string, string>();
    
    // Convert blob data to URLs
    imageAttachments.forEach(attachment => {
      if (attachment.id && attachment.data) {
        const url = URL.createObjectURL(attachment.data);
        urls.set(attachment.id, url);
      }
    });
    
    setImageUrls(urls);
    
    // Cleanup URLs on unmount
    return () => {
      urls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [imageAttachments]);
  
  return { imageUrls, imageAttachments };
}

// Helper to process message content and replace attachment references
export function processMessageContent(content: string, imageUrls: Map<string, string>): string {
  // Replace attachment://id references with actual blob URLs
  return content.replace(/attachment:\/\/([a-f0-9-]+)/gi, (match, id) => {
    return imageUrls.get(id) || match;
  });
}