import { useLiveQuery } from 'dexie-react-hooks';
import { db, CustomModel } from '@/lib/db';
import {
  addCustomModel,
  updateCustomModel,
  deleteCustomModel,
  toggleCustomModelStatus,
} from '@/lib/data/operations/customModels';

export function useCustomModels() {
  // Get all custom models with live updates
  const customModels = useLiveQuery(
    () => db.customModels.toArray()
  ) || [];

  // Get only active custom models
  const activeCustomModels = useLiveQuery(
    () => db.customModels.toArray().then(models => models.filter(m => m.isActive))
  ) || [];

  return {
    customModels,
    activeCustomModels,
    addCustomModel,
    updateCustomModel,
    deleteCustomModel,
    toggleCustomModelStatus,
  };
}

// Hook to get a single custom model by ID
export function useCustomModel(id: string | null) {
  const customModel = useLiveQuery(
    () => id ? db.customModels.get(id) : undefined,
    [id]
  );

  return customModel;
}