import { v4 as uuidv4 } from 'uuid';
import { db, CustomModel } from '@/lib/db';

// Add a new custom model
export async function addCustomModel(model: Omit<CustomModel, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  const id = uuidv4();
  const now = new Date();

  await db.customModels.add({
    ...model,
    id,
    createdAt: now,
    updatedAt: now,
  });

  return id;
}

// Update an existing custom model
export async function updateCustomModel(id: string, updates: Partial<Omit<CustomModel, 'id' | 'createdAt'>>): Promise<void> {
  await db.customModels.update(id, {
    ...updates,
    updatedAt: new Date(),
  });
}

// Delete a custom model
export async function deleteCustomModel(id: string): Promise<void> {
  await db.customModels.delete(id);
}

// Toggle custom model active status
export async function toggleCustomModelStatus(id: string): Promise<void> {
  const model = await db.customModels.get(id);
  if (model) {
    await updateCustomModel(id, { isActive: !model.isActive });
  }
}

// Get all custom models
export async function getCustomModels(): Promise<CustomModel[]> {
  return await db.customModels.toArray();
}

// Get active custom models
export async function getActiveCustomModels(): Promise<CustomModel[]> {
  const models = await db.customModels.toArray();
  return models.filter(m => m.isActive);
}