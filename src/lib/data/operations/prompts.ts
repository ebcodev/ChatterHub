import { v4 as uuidv4 } from 'uuid';
import { db, Prompt } from '@/lib/db';

export async function addPrompt(prompt: Omit<Prompt, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  const id = uuidv4();
  const now = new Date();
  
  await db.prompts.add({
    ...prompt,
    id,
    createdAt: now,
    updatedAt: now,
  });
  
  return id;
}

export async function updatePrompt(id: string, updates: Partial<Omit<Prompt, 'id' | 'createdAt' | 'updatedAt'>>): Promise<void> {
  await db.prompts.update(id, {
    ...updates,
    updatedAt: new Date(),
  });
}

export async function deletePrompt(id: string): Promise<void> {
  await db.prompts.delete(id);
}

export async function togglePromptStar(id: string): Promise<void> {
  const prompt = await db.prompts.get(id);
  if (prompt) {
    await db.prompts.update(id, {
      isStarred: !prompt.isStarred,
      updatedAt: new Date(),
    });
  }
}

export async function duplicatePrompt(id: string): Promise<string | null> {
  const prompt = await db.prompts.get(id);
  if (!prompt) return null;
  
  const newId = uuidv4();
  const now = new Date();
  
  await db.prompts.add({
    ...prompt,
    id: newId,
    title: `Copy of ${prompt.title}`,
    isStarred: false, // Reset starred status for the copy
    createdAt: now,
    updatedAt: now,
  });
  
  return newId;
}

export async function getPromptById(id: string): Promise<Prompt | undefined> {
  return await db.prompts.get(id);
}

export async function getAllPrompts(): Promise<Prompt[]> {
  return await db.prompts.toArray();
}