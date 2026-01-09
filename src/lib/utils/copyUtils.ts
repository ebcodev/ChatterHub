/**
 * Utility functions for copying message content in different formats
 */

/**
 * Extract plain text from markdown content while preserving paragraph structure
 * @param markdown - The markdown content to convert
 * @returns Plain text with preserved paragraph breaks
 */
export function extractPlainText(markdown: string): string {
  let text = markdown;
  
  // FIRST PASS: Process line-based markdown elements (while newlines still exist)
  
  // Remove horizontal rules
  text = text.replace(/^---+$/gm, '');
  text = text.replace(/^\*\*\*+$/gm, '');
  text = text.replace(/^___+$/gm, '');
  
  // Remove headers but keep the text
  text = text.replace(/^#{1,6}\s+(.+)$/gm, '$1');
  
  // Remove blockquote markers
  text = text.replace(/^>\s+/gm, '');
  
  // Remove list markers but keep indentation
  text = text.replace(/^(\s*)[-*+]\s+/gm, '$1');
  text = text.replace(/^(\s*)\d+\.\s+/gm, '$1');
  
  // Remove table row separators
  text = text.replace(/^\|?[-:\s]+\|[-:\s|]+$/gm, '');
  
  // SECOND PASS: Process inline markdown elements
  
  // Remove code blocks but keep their content
  text = text.replace(/```[^`\n]*\n([\s\S]*?)```/g, '$1');
  text = text.replace(/`([^`]+)`/g, '$1');
  
  // Remove emphasis markers - handle multi-line bold/italic
  text = text.replace(/\*\*([\s\S]*?)\*\*/g, '$1'); // Bold
  text = text.replace(/__([\s\S]*?)__/g, '$1'); // Bold alternative
  text = text.replace(/\*([^*\n]+)\*/g, '$1'); // Italic
  text = text.replace(/_([^_\n]+)_/g, '$1'); // Italic alternative
  
  // Remove images but keep alt text
  text = text.replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1');
  
  // Remove links but keep text
  text = text.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
  
  // Remove table cell separators
  text = text.replace(/\|/g, ' ');
  
  // FINAL PASS: Clean up whitespace
  
  // Clean up multiple blank lines (more than 2 newlines in a row)
  text = text.replace(/\n{3,}/g, '\n\n');
  
  // Clean up trailing spaces on each line
  text = text.replace(/ +$/gm, '');
  
  // Clean up multiple spaces
  text = text.replace(/ {2,}/g, ' ');
  
  // Final trim
  text = text.trim();
  
  return text;
}

/**
 * Preserve the full markdown content for copying
 * @param content - The original message content
 * @returns The content as-is for markdown copying
 */
export function preserveMarkdown(content: string): string {
  // Return the content as-is for full markdown preservation
  return content;
}

/**
 * Copy text to clipboard with error handling
 * @param text - The text to copy
 * @returns Promise that resolves to true on success, false on failure
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
}