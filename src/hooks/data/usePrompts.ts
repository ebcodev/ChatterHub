import { useLiveQuery } from 'dexie-react-hooks';
import { db, Prompt } from '@/lib/db';
import { 
  addPrompt as addPromptOp, 
  updatePrompt as updatePromptOp, 
  deletePrompt as deletePromptOp,
  togglePromptStar as togglePromptStarOp,
  duplicatePrompt as duplicatePromptOp 
} from '@/lib/data/operations/prompts';

export function usePrompts() {
  // Get all prompts sorted by starred status and creation date
  const prompts = useLiveQuery(
    () => db.prompts.orderBy('createdAt').reverse().toArray(),
    []
  ) || [];

  // Separate starred and regular prompts for display
  const starredPrompts = prompts.filter(p => p.isStarred);
  const regularPrompts = prompts.filter(p => !p.isStarred);

  // Get unique tags from all prompts
  const allTags = useLiveQuery(() => {
    return db.prompts.toArray().then(prompts => {
      const tagSet = new Set<string>();
      prompts.forEach(prompt => {
        prompt.tags.forEach(tag => tagSet.add(tag));
      });
      return Array.from(tagSet).sort();
    });
  }, []) || [];

  const addPrompt = async (prompt: Omit<Prompt, 'id' | 'createdAt' | 'updatedAt'>) => {
    return await addPromptOp(prompt);
  };

  const updatePrompt = async (id: string, updates: Partial<Omit<Prompt, 'id' | 'createdAt' | 'updatedAt'>>) => {
    await updatePromptOp(id, updates);
  };

  const deletePrompt = async (id: string) => {
    await deletePromptOp(id);
  };

  const togglePromptStar = async (id: string) => {
    await togglePromptStarOp(id);
  };

  const duplicatePrompt = async (id: string) => {
    return await duplicatePromptOp(id);
  };

  return {
    prompts,
    starredPrompts,
    regularPrompts,
    allTags,
    addPrompt,
    updatePrompt,
    deletePrompt,
    togglePromptStar,
    duplicatePrompt,
  };
}