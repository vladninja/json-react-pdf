import { Font } from '@react-pdf/renderer';
import googleFontsData from '../assets/google-fonts.json';

/**
 * A lookup map for font metadata indexed by family name.
 */
const FONT_METADATA = new Map<string, any>();
googleFontsData.items.forEach(item => {
  FONT_METADATA.set(item.family.toLowerCase(), item);
});

const registeredFonts = new Set<string>();

/**
 * Registers a Google Font with @react-pdf/renderer using local metadata.
 */
export function registerFont(family: string) {
  if (!family || family === '') return;
  
  // Sanitize family name: remove quotes and take only the first one if it's a list
  const sanitizedFamily = family.replace(/['"]/g, '').split(',')[0].trim();
  
  if (registeredFonts.has(sanitizedFamily)) {
    return;
  }
  
  const metadata = FONT_METADATA.get(sanitizedFamily.toLowerCase());
  if (!metadata) {
    return;
  }

  const sources: { src: string, fontWeight: number | string, fontStyle: string }[] = [];
  
  Object.entries(metadata.files).forEach(([variant, url]) => {
    let fontWeight: number | string = 400;
    
    if (variant === 'regular' || variant === 'italic') fontWeight = 400;
    else if (variant === '700' || variant === '700italic') fontWeight = 700;
    else if (!isNaN(parseInt(variant))) fontWeight = parseInt(variant);
    
    const secureUrl = (url as string).replace('http://', 'https://');
    const fontStyle = variant.includes('italic') ? 'italic' : 'normal';
    
    sources.push({
      src: secureUrl,
      fontWeight,
      fontStyle
    });
  });

  if (sources.length > 0) {
    try {
      Font.register({ family, fonts: sources as any });
      registeredFonts.add(family);
    } catch (e) {
      console.error(`[Fonts] Failed to register font "${family}":`, e);
    }
  }
}

/**
 * Scans a schema and registers all fonts used in it.
 */
export function registerFontsFromSchema(schema: any) {
  const fonts = new Set<string>();
  
  function scan(nodes: any[]) {
    for (const node of nodes) {
      if (node.style?.fontFamily) fonts.add(node.style.fontFamily);
      if (node.children) scan(node.children);
    }
  }
  
  if (schema.pages) {
    for (const page of schema.pages) {
      if (page.settings?.fontFamily) fonts.add(page.settings.fontFamily);
      scan(page.children || []);
    }
  }
  
  fonts.forEach(f => registerFont(f));
}
