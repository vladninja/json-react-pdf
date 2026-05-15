import { Font } from '@react-pdf/renderer';
import type { FontStyle } from '@react-pdf/types';
import googleFontsData from '../assets/google-fonts.json';
import type { DocumentSchema, NodeSchema } from '../schema/types';

type GoogleFontItem = {
  family: string;
  files: Record<string, string>;
};

const FONT_METADATA = new Map<string, GoogleFontItem>();
googleFontsData.items.forEach(item => {
  FONT_METADATA.set(item.family.toLowerCase(), item as GoogleFontItem);
});

const registeredFonts = new Set<string>();

export function registerFont(family: string): void {
  if (!family || family === '') return;

  const sanitizedFamily = (family.replace(/['"]/g, '').split(',')[0] ?? family).trim();

  if (registeredFonts.has(sanitizedFamily)) return;

  const metadata = FONT_METADATA.get(sanitizedFamily.toLowerCase());
  if (!metadata) return;

  const sources: Array<{ src: string; fontWeight: number; fontStyle: FontStyle }> = [];

  Object.entries(metadata.files).forEach(([variant, url]) => {
    let fontWeight = 400;

    if (variant === 'regular' || variant === 'italic') fontWeight = 400;
    else if (variant === '700' || variant === '700italic') fontWeight = 700;
    else if (!isNaN(parseInt(variant))) fontWeight = parseInt(variant);

    const secureUrl = url.replace('http://', 'https://');
    const fontStyle: FontStyle = variant.includes('italic') ? 'italic' : 'normal';

    sources.push({ src: secureUrl, fontWeight, fontStyle });
  });

  if (sources.length > 0) {
    try {
      Font.register({ family, fonts: sources });
      registeredFonts.add(family);
    } catch (e) {
      console.error(`[Fonts] Failed to register font "${family}":`, e);
    }
  }
}

export function registerFontsFromSchema(schema: DocumentSchema): void {
  const fonts = new Set<string>();

  function scan(nodes: NodeSchema[]): void {
    for (const node of nodes) {
      const fontFamily = node.style?.fontFamily;
      if (fontFamily) {
        fonts.add(Array.isArray(fontFamily) ? (fontFamily[0] ?? '') : fontFamily);
      }
      if ('children' in node) scan(node.children);
    }
  }

  for (const page of schema.pages) {
    if (page.settings.fontFamily) fonts.add(page.settings.fontFamily);
    scan(page.children);
  }

  if (schema.settings?.fontFamily) fonts.add(schema.settings.fontFamily);

  fonts.forEach(f => registerFont(f));
}
