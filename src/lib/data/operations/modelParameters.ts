/**
 * Model parameters operations for ChatterHub
 * Pure functions for managing AI model parameters
 */

import { db, ModelParameters } from '../../db';
import { v4 as uuidv4 } from 'uuid';

/**
 * Save or update model parameters
 */
export async function saveModelParameters(
  modelId: string,
  params: {
    temperature?: number | null;
    presencePenalty?: number | null;
    frequencyPenalty?: number | null;
    topP?: number | null;
    maxTokens?: number | null;
    reasoningEffort?: 'low' | 'medium' | 'high' | null;
  }
): Promise<void> {
  // Check if parameters already exist for this model
  const existing = await db.modelParameters.where('modelId').equals(modelId).first();
  
  const modelParams: ModelParameters = {
    id: existing?.id || uuidv4(),
    modelId,
    temperature: params.temperature ?? null,
    presencePenalty: params.presencePenalty ?? null,
    frequencyPenalty: params.frequencyPenalty ?? null,
    topP: params.topP ?? null,
    maxTokens: params.maxTokens ?? null,
    reasoningEffort: params.reasoningEffort ?? null,
    createdAt: existing?.createdAt || new Date(),
    updatedAt: new Date(),
  };
  
  if (existing) {
    await db.modelParameters.update(existing.id!, modelParams);
  } else {
    await db.modelParameters.add(modelParams);
  }
}

/**
 * Get model parameters
 */
export async function getModelParameters(modelId: string): Promise<ModelParameters | undefined> {
  return await db.modelParameters.where('modelId').equals(modelId).first();
}

/**
 * Delete model parameters
 */
export async function deleteModelParameters(id: string): Promise<void> {
  await db.modelParameters.delete(id);
}

/**
 * Delete model parameters by model ID
 */
export async function deleteModelParametersByModelId(modelId: string): Promise<void> {
  await db.modelParameters.where('modelId').equals(modelId).delete();
}

/**
 * Reset model parameters to defaults (delete saved parameters)
 */
export async function resetModelParameters(modelId: string): Promise<void> {
  await deleteModelParametersByModelId(modelId);
}

/**
 * Get all saved model parameters
 */
export async function getAllModelParameters(): Promise<ModelParameters[]> {
  return await db.modelParameters.toArray();
}

/**
 * Bulk update model parameters
 */
export async function bulkUpdateModelParameters(
  updates: Array<{
    modelId: string;
    params: Partial<ModelParameters>;
  }>
): Promise<void> {
  await db.transaction('rw', db.modelParameters, async () => {
    for (const { modelId, params } of updates) {
      await saveModelParameters(modelId, params);
    }
  });
}

/**
 * Export model parameters for backup
 */
export async function exportModelParameters(): Promise<ModelParameters[]> {
  return await getAllModelParameters();
}

/**
 * Import model parameters from backup
 */
export async function importModelParameters(
  parameters: Array<Omit<ModelParameters, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<void> {
  await db.transaction('rw', db.modelParameters, async () => {
    for (const param of parameters) {
      await saveModelParameters(param.modelId, {
        temperature: param.temperature,
        presencePenalty: param.presencePenalty,
        frequencyPenalty: param.frequencyPenalty,
        topP: param.topP,
        maxTokens: param.maxTokens,
        reasoningEffort: param.reasoningEffort,
      });
    }
  });
}

/**
 * Clear all model parameters
 */
export async function clearAllModelParameters(): Promise<void> {
  await db.modelParameters.clear();
}