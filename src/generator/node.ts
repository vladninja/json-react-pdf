import { renderToStream, renderToBuffer, renderToFile } from '@react-pdf/renderer';
import { DocumentSchema } from '../schema/types';
import { createPdfElement } from './document';

export async function generatePdfStream(
  schema: DocumentSchema,
  data: Record<string, any>,
  headerSchemas?: Record<string, DocumentSchema>,
  footerSchemas?: Record<string, DocumentSchema>,
  loopSchemas?: Record<string, DocumentSchema>,
) {
  return renderToStream(createPdfElement(schema, data, headerSchemas, footerSchemas, loopSchemas));
}

export async function generatePdfBuffer(
  schema: DocumentSchema,
  data: Record<string, any>,
  headerSchemas?: Record<string, DocumentSchema>,
  footerSchemas?: Record<string, DocumentSchema>,
  loopSchemas?: Record<string, DocumentSchema>,
) {
  return renderToBuffer(createPdfElement(schema, data, headerSchemas, footerSchemas, loopSchemas));
}

export async function generatePdfFile(
  filePath: string,
  schema: DocumentSchema,
  data: Record<string, any>,
  headerSchemas?: Record<string, DocumentSchema>,
  footerSchemas?: Record<string, DocumentSchema>,
  loopSchemas?: Record<string, DocumentSchema>,
) {
  await renderToFile(createPdfElement(schema, data, headerSchemas, footerSchemas, loopSchemas), filePath);
}
