import React from 'react';
import { Document, Page, View } from '@react-pdf/renderer';
import type { Style } from '@react-pdf/types';
import type { DocumentSchema } from '../schema/types';
import { renderNode, RenderContext } from './mapper';

export interface PDFDocumentProps {
  schema: DocumentSchema;
  data: Record<string, unknown>;
  headerSchemas?: Record<string, DocumentSchema>;
  footerSchemas?: Record<string, DocumentSchema>;
  loopSchemas?: Record<string, DocumentSchema>;
}

function resolvePadding(
  p: number | [number, number] | [number, number, number, number] | undefined
): number | string | undefined {
  if (p === undefined) return undefined;
  if (typeof p === 'number') return p;
  return p.join(' ');
}

export const PDFDocument: React.FC<PDFDocumentProps> = ({ schema, data, headerSchemas, footerSchemas, loopSchemas }) => {
  const context: RenderContext = { data, loopSchemas };

  return (
    <Document
      title={schema.settings?.title || schema.name}
      pageMode={schema.settings?.pageMode}
      pageLayout={schema.settings?.pageLayout}
      userPassword={schema.settings?.userPassword}
    >
      {schema.pages.map((page) => {
        const isStatic = page.type === 'static';
        const headerSchema = page.headerId ? headerSchemas?.[page.headerId] : undefined;
        const footerSchema = page.footerId ? footerSchemas?.[page.footerId] : undefined;
        return (
          <Page
            key={page.id}
            size={page.settings.format || schema.layout}
            orientation={page.settings.orientation || schema.settings?.orientation || 'portrait'}
            style={{
              padding: resolvePadding(page.settings.padding),
              backgroundColor: page.settings.backgroundColor,
              fontFamily: page.settings.fontFamily ?? schema.settings?.fontFamily,
              fontSize: page.settings.fontSize ?? schema.settings?.fontSize,
              color: page.settings.color ?? schema.settings?.color ?? '#000',
            } as Style}
            wrap={!isStatic}
          >
            {headerSchema && (
              <View fixed>
                {headerSchema.pages[0]?.children.map(child => renderNode(child, context))}
              </View>
            )}
            {page.children.map(child => renderNode(child, context))}
            {footerSchema && (
              <View fixed style={{ marginTop: 'auto' }}>
                {footerSchema.pages[0]?.children.map(child => renderNode(child, context))}
              </View>
            )}
          </Page>
        );
      })}
    </Document>
  );
};

export function createPdfElement(
  schema: DocumentSchema,
  data: Record<string, unknown>,
  headerSchemas?: Record<string, DocumentSchema>,
  footerSchemas?: Record<string, DocumentSchema>,
  loopSchemas?: Record<string, DocumentSchema>,
// eslint-disable-next-line @typescript-eslint/no-explicit-any
): React.ReactElement<any> {
  return React.createElement(PDFDocument, { schema, data, headerSchemas, footerSchemas, loopSchemas });
}
