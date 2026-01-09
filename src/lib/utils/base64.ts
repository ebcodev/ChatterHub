/**
 * Safely convert an ArrayBuffer to a base64 string
 * Handles large buffers without stack overflow
 */
export function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const uint8Array = new Uint8Array(buffer);
  const chunkSize = 0x8000; // Process in 32KB chunks to avoid stack overflow
  let result = '';
  
  for (let i = 0; i < uint8Array.length; i += chunkSize) {
    const chunk = uint8Array.subarray(i, Math.min(i + chunkSize, uint8Array.length));
    result += String.fromCharCode.apply(null, Array.from(chunk));
  }
  
  return btoa(result);
}