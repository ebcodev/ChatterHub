/**
 * Calculates the cosine similarity between two vectors.
 * Cosine similarity measures the cosine of the angle between two vectors,
 * providing a value between -1 (completely opposite) and 1 (exactly the same).
 * This is useful for comparing the similarity of documents or feature vectors.
 *
 * The function handles null/undefined values by treating them as 0.
 *
 * @param {number[]} a - First vector of numbers
 * @param {number[]} b - Second vector of numbers
 * @returns {number} The cosine similarity value between -1 and 1
 * @example
 * // Returns 1 (identical vectors)
 * cosineSimilarity([1, 2, 3], [1, 2, 3]);
 *
 * // Returns 0 (orthogonal vectors)
 * cosineSimilarity([1, 0, 0], [0, 1, 0]);
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  // Calculate the dot product of vectors a and b
  const dotProduct = a.reduce(
    (sum, _, i) => sum + (a[i] ?? 0) * (b[i] ?? 0),
    0,
  );

  // Calculate the magnitude (Euclidean norm) of vector a
  const magnitudeA = Math.sqrt(
    a.reduce((sum, val) => sum + (val ?? 0) * (val ?? 0), 0),
  );

  // Calculate the magnitude (Euclidean norm) of vector b
  const magnitudeB = Math.sqrt(
    b.reduce((sum, val) => sum + (val ?? 0) * (val ?? 0), 0),
  );

  // Return the cosine similarity (dot product divided by the product of magnitudes)
  return dotProduct / (magnitudeA * magnitudeB);
}
