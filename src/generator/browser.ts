import { pdf } from '@react-pdf/renderer';
import { DocumentSchema } from '../schema/types';
import { createPdfElement } from './document';
import { registerFontsFromSchema } from './fonts';

export async function generatePdfBlobUrl(
  schema: DocumentSchema,
  data: Record<string, any>,
  headerSchemas?: Record<string, DocumentSchema>,
  footerSchemas?: Record<string, DocumentSchema>,
  loopSchemas?: Record<string, DocumentSchema>,
): Promise<string> {
  registerFontsFromSchema(schema);
  if (headerSchemas) {
    for (const hSchema of Object.values(headerSchemas)) registerFontsFromSchema(hSchema);
  }
  if (footerSchemas) {
    for (const fSchema of Object.values(footerSchemas)) registerFontsFromSchema(fSchema);
  }
  if (loopSchemas) {
    for (const lSchema of Object.values(loopSchemas)) registerFontsFromSchema(lSchema);
  }

  const asPdf = pdf(createPdfElement(schema, data, headerSchemas, footerSchemas, loopSchemas));
  const blob = await asPdf.toBlob();
  return URL.createObjectURL(blob);
}
