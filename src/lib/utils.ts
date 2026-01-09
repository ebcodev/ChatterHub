import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getRandomGradient(seed: string): string {
  // Create a deterministic gradient based on the seed
  const hash = seed.split("").reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);

  const hue1 = hash % 360;
  const hue2 = (hue1 + 40) % 360;

  return `linear-gradient(45deg, hsl(${hue1}, 80%, 60%), hsl(${hue2}, 80%, 60%))`;
}

export function getModelGradient(modelName: string): { colors: string[]; gradient: string } {
  // Create a deterministic gradient based on the model name
  let hash = 0;
  for (let i = 0; i < modelName.length; i++) {
    const char = modelName.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  
  // Generate two vibrant colors with good contrast
  const hue1 = Math.abs(hash % 360);
  const hue2 = (hue1 + 120 + Math.abs(hash % 120)) % 360; // Ensure good color separation
  
  // Vary saturation and lightness for more interesting gradients
  const sat1 = 70 + (Math.abs(hash >> 8) % 30); // 70-100%
  const sat2 = 70 + (Math.abs(hash >> 16) % 30); // 70-100%
  const light1 = 50 + (Math.abs(hash >> 4) % 20); // 50-70%
  const light2 = 50 + (Math.abs(hash >> 12) % 20); // 50-70%
  
  const color1 = `hsl(${hue1}, ${sat1}%, ${light1}%)`;
  const color2 = `hsl(${hue2}, ${sat2}%, ${light2}%)`;
  
  return {
    colors: [color1, color2],
    gradient: `linear-gradient(135deg, ${color1}, ${color2})`
  };
}

export function formatContextWindow(contextWindow: number): string {
  if (!contextWindow || contextWindow === 0) return 'Unknown';
  
  if (contextWindow >= 1000000) {
    return `${(contextWindow / 1000000).toFixed(contextWindow % 1000000 === 0 ? 0 : 1)}M`;
  } else if (contextWindow >= 1000) {
    return `${Math.round(contextWindow / 1000)}K`;
  } else {
    return contextWindow.toString();
  }
}
