/**
 * Message operations for ChatterHub
 * Pure functions for all message CRUD operations
 */

import { db, Message } from '../../db';
import { v4 as uuidv4 } from 'uuid';
import { deleteMessageImageAttachments } from './images';

/**
 * Create a new message
 */
export async function createMessage(
  chatId: string,
  chatGroupId: string,
  role: 'user' | 'assistant' | 'system',
  content: string,
  model?: string
): Promise<string> {
  const messageId = uuidv4();
  const newMessage: Message = {
    id: messageId,
    chatId,
    chatGroupId,
    role,
    content,
    model: model || 'unknown',
    starred: false,
    createdAt: new Date(),
  };
  
  await db.messages.add(newMessage);
  return messageId;
}

/**
 * Update message content
 */
export async function updateMessage(messageId: string, content: string): Promise<void> {
  await db.messages.update(messageId, { content });
}

/**
 * Delete a single message and its associated image attachments
 */
export async function deleteMessage(messageId: string): Promise<void> {
  // Delete associated image attachments first
  await deleteMessageImageAttachments(messageId);
  // Then delete the message
  await db.messages.delete(messageId);
}

/**
 * Delete multiple messages and their associated image attachments
 */
export async function bulkDeleteMessages(messageIds: string[]): Promise<void> {
  // Delete associated image attachments for all messages
  for (const messageId of messageIds) {
    await deleteMessageImageAttachments(messageId);
  }
  // Then delete all messages
  await db.messages.bulkDelete(messageIds);
}

/**
 * Toggle message star status
 */
export async function toggleMessageStar(messageId: string): Promise<boolean> {
  const message = await db.messages.get(messageId);
  if (!message) return false;
  
  const newStarStatus = !message.starred;
  await db.messages.update(messageId, { starred: newStarStatus });
  return newStarStatus;
}

/**
 * Star a message
 */
export async function starMessage(messageId: string): Promise<void> {
  await db.messages.update(messageId, { starred: true });
}

/**
 * Unstar a message
 */
export async function unstarMessage(messageId: string): Promise<void> {
  await db.messages.update(messageId, { starred: false });
}

/**
 * Get all starred messages
 */
export async function getStarredMessages(): Promise<Message[]> {
  const allMessages = await db.messages.toArray();
  return allMessages.filter(m => m.starred === true);
}

/**
 * Get messages for a specific chat
 */
export async function getMessagesForChat(chatId: string): Promise<Message[]> {
  return await db.messages
    .where('chatId')
    .equals(chatId)
    .toArray();
}

/**
 * Get messages for a chat group
 */
export async function getMessagesForChatGroup(chatGroupId: string): Promise<Message[]> {
  return await db.messages
    .where('chatGroupId')
    .equals(chatGroupId)
    .toArray();
}

/**
 * Get conversation history for a chat with system prompt
 */
export async function getChatConversation(
  chatId: string,
  systemPrompt?: string
): Promise<Array<{ role: string; content: string }>> {
  const messages = await getMessagesForChat(chatId);
  const sortedMessages = messages.sort((a, b) => 
    new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );
  
  const conversation: Array<{ role: string; content: string }> = [];
  
  // Add system prompt if provided
  if (systemPrompt) {
    conversation.push({ role: 'system', content: systemPrompt });
  }
  
  // Add all messages
  conversation.push(...sortedMessages.map(m => ({
    role: m.role,
    content: m.content
  })));
  
  return conversation;
}

/**
 * Delete all messages for a chat and their associated image attachments
 */
export async function deleteMessagesForChat(chatId: string): Promise<void> {
  // Get all message IDs for the chat
  const messages = await db.messages.where('chatId').equals(chatId).toArray();
  const messageIds = messages.map(m => m.id!);
  
  // Delete associated image attachments for all messages
  for (const messageId of messageIds) {
    await deleteMessageImageAttachments(messageId);
  }
  
  // Then delete all messages
  await db.messages.where('chatId').equals(chatId).delete();
}

/**
 * Delete all messages for a chat group and their associated image attachments
 */
export async function deleteMessagesForChatGroup(chatGroupId: string): Promise<void> {
  // Get all message IDs for the chat group
  const messages = await db.messages.where('chatGroupId').equals(chatGroupId).toArray();
  const messageIds = messages.map(m => m.id!);
  
  // Delete associated image attachments for all messages
  for (const messageId of messageIds) {
    await deleteMessageImageAttachments(messageId);
  }
  
  // Then delete all messages
  await db.messages.where('chatGroupId').equals(chatGroupId).delete();
}

/**
 * Count messages in a chat
 */
export async function countMessagesInChat(chatId: string): Promise<number> {
  return await db.messages.where('chatId').equals(chatId).count();
}

/**
 * Count messages in a chat group
 */
export async function countMessagesInChatGroup(chatGroupId: string): Promise<number> {
  return await db.messages.where('chatGroupId').equals(chatGroupId).count();
}

/**
 * Get the last message in a chat
 */
export async function getLastMessageInChat(chatId: string): Promise<Message | undefined> {
  const messages = await db.messages
    .where('chatId')
    .equals(chatId)
    .toArray();
  
  if (messages.length === 0) return undefined;
  
  return messages.sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )[0];
}

/**
 * Clear all messages in a chat (but keep the chat)
 */
export async function clearChatMessages(chatId: string): Promise<void> {
  await deleteMessagesForChat(chatId);
}