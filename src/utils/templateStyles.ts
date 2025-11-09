/**
 * Template Styles Utility
 * Applies template configuration (colors, fonts, layouts) dynamically
 */

export interface TemplateConfig {
  primary_color?: string;
  secondary_color?: string;
  font_family?: string;
  layout?: string;
  sections?: string[];
  [key: string]: any;
}

/**
 * Convert hex color to RGB
 */
function hexToRgb(hex: string): string | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
    : null;
}

/**
 * Apply template styles to a DOM element
 */
export function applyTemplateStyles(
  element: HTMLElement | null,
  config: TemplateConfig
): void {
  if (!element) return;

  const root = element;
  const rgb = hexToRgb(config.primary_color || "#2563eb");
  const secondaryRgb = hexToRgb(config.secondary_color || "#64748b");

  if (rgb) {
    root.style.setProperty("--template-primary-rgb", rgb);
    root.style.setProperty("--template-primary", config.primary_color || "#2563eb");
  }

  if (secondaryRgb) {
    root.style.setProperty("--template-secondary-rgb", secondaryRgb);
    root.style.setProperty("--template-secondary", config.secondary_color || "#64748b");
  }

  if (config.font_family) {
    root.style.setProperty("--template-font-family", config.font_family);
    root.style.fontFamily = config.font_family;
  }
}

/**
 * Get template-specific CSS classes
 */
export function getTemplateClasses(templateType: string): {
  container: string;
  header: string;
  section: string;
  card: string;
} {
  const baseClasses = {
    classic: {
      container: "template-classic",
      header: "template-classic-header",
      section: "template-classic-section",
      card: "template-classic-card",
    },
    modern: {
      container: "template-modern",
      header: "template-modern-header",
      section: "template-modern-section",
      card: "template-modern-card",
    },
    minimalist: {
      container: "template-minimalist",
      header: "template-minimalist-header",
      section: "template-minimalist-section",
      card: "template-minimalist-card",
    },
    developer: {
      container: "template-developer",
      header: "template-developer-header",
      section: "template-developer-section",
      card: "template-developer-card",
    },
    designer: {
      container: "template-designer",
      header: "template-designer-header",
      section: "template-designer-section",
      card: "template-designer-card",
    },
  };

  return baseClasses[templateType as keyof typeof baseClasses] || baseClasses.modern;
}

/**
 * Get template color scheme
 */
export function getTemplateColors(templateType: string, config?: TemplateConfig): {
  primary: string;
  secondary: string;
  background: string;
  text: string;
} {
  const defaults: Record<string, { primary: string; secondary: string; background: string; text: string }> = {
    classic: {
      primary: config?.primary_color || "#2563eb",
      secondary: config?.secondary_color || "#64748b",
      background: "#ffffff",
      text: "#1f2937",
    },
    modern: {
      primary: config?.primary_color || "#7c3aed",
      secondary: config?.secondary_color || "#a78bfa",
      background: "#0f172a",
      text: "#f8fafc",
    },
    minimalist: {
      primary: config?.primary_color || "#000000",
      secondary: config?.secondary_color || "#6b7280",
      background: "#ffffff",
      text: "#000000",
    },
    developer: {
      primary: config?.primary_color || "#10b981",
      secondary: config?.secondary_color || "#6ee7b7",
      background: "#1e293b",
      text: "#f1f5f9",
    },
    designer: {
      primary: config?.primary_color || "#f59e0b",
      secondary: config?.secondary_color || "#fbbf24",
      background: "#ffffff",
      text: "#1f2937",
    },
  };

  return defaults[templateType] || defaults.modern;
}

