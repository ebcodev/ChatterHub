// Function to generate a random pastel color using improved algorithm
function generateImprovedPastelColor(): string {
  // Generate base values between 127 and 255 for pastel effect
  const r = Math.round(Math.random() * 127 + 127);
  const g = Math.round(Math.random() * 127 + 127);
  const b = Math.round(Math.random() * 127 + 127);
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

// Function to mix two colors
function mixColors(
  color1: string,
  color2: string,
  weight: number = 0.5,
): string {
  const c1 = parseInt(color1.replace("#", ""), 16);
  const c2 = parseInt(color2.replace("#", ""), 16);

  const r1 = (c1 >> 16) & 0xff;
  const g1 = (c1 >> 8) & 0xff;
  const b1 = c1 & 0xff;

  const r2 = (c2 >> 16) & 0xff;
  const g2 = (c2 >> 8) & 0xff;
  const b2 = c2 & 0xff;

  const r = Math.round(r1 * (1 - weight) + r2 * weight);
  const g = Math.round(g1 * (1 - weight) + g2 * weight);
  const b = Math.round(b1 * (1 - weight) + b2 * weight);

  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
}

// Function to generate a random pastel color with white mixing
function generateSoftPastelColor(): string {
  const baseColor = generateImprovedPastelColor();
  return mixColors(baseColor, "#FFFFFF", 0.3); // Mix with white for softer pastels
}

// Function to darken a color
function darkenColor(hex: string, percent: number): string {
  const num = parseInt(hex.replace("#", ""), 16);
  const amt = Math.round(2.55 * percent);
  const R = Math.max(0, (num >> 16) - amt);
  const G = Math.max(0, ((num >> 8) & 0x00ff) - amt);
  const B = Math.max(0, (num & 0x0000ff) - amt);
  return `#${((1 << 24) | (R << 16) | (G << 8) | B).toString(16).slice(1)}`;
}

// Generate a complementary color
function getComplementaryColor(hex: string): string {
  const num = parseInt(hex.replace("#", ""), 16);
  const comp = 0xffffff ^ num;
  return `#${comp.toString(16).padStart(6, "0")}`;
}

// Generate a set of harmonious pastel colors
export function generateHarmoniousPastelColors() {
  // Generate main background color using improved pastel generation
  const backgroundColor = generateSoftPastelColor();

  // Generate a slightly darker version for dark mode by mixing with black
  const backgroundColorDark = mixColors(backgroundColor, "#000000", 0.4);

  // Generate border colors based on background with different mix ratios
  const borderColorLight = mixColors(backgroundColor, "#000000", 0.2);
  const borderColorDark = mixColors(backgroundColor, "#000000", 0.6);

  // Generate title colors that are bolder than subtitle colors
  const titleColorLight = mixColors(backgroundColor, "#000000", 0.8); // Darker than subtitle for better contrast
  const titleColorDark = mixColors(generateSoftPastelColor(), "#FFFFFF", 0.2); // Brighter than subtitle in dark mode

  // Generate subtitle colors that complement the background
  const subtitleColorLight = mixColors(backgroundColor, "#000000", 0.6); // Lighter than title
  const subtitleColorDark = generateSoftPastelColor(); // Different pastel for contrast

  return {
    backgroundColorLight: backgroundColor,
    backgroundColorDark,
    borderColorLight,
    borderColorDark,
    titleColorLight,
    titleColorDark,
    subtitleColorLight,
    subtitleColorDark,
  };
}
