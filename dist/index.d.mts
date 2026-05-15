import { Style } from '@react-pdf/types';
import React from 'react';

type LayoutType = 'A4' | 'A5' | 'LETTER' | 'LEGAL';
type ItemKind = 'template' | 'header' | 'footer' | 'loop';
interface DocumentSchema {
    id: string;
    name: string;
    layout: LayoutType;
    kind: ItemKind;
    updatedAt: number;
    pages: PageSchema[];
    settings?: DocumentSettings;
}
interface DocumentSettings {
    fontFamily?: string;
    fontSize?: number;
    color?: string;
    title?: string;
    pageMode?: 'useNone' | 'useOutlines' | 'useThumbs' | 'fullScreen' | 'useOC' | 'useAttachments';
    pageLayout?: 'singlePage' | 'oneColumn' | 'twoColumnLeft' | 'twoColumnRight' | 'twoPageLeft' | 'twoPageRight';
    userPassword?: string;
    orientation?: 'portrait' | 'landscape';
}
type PageMode = 'static' | 'dynamic';
interface PageSchema {
    id: string;
    type: PageMode;
    settings: PageSettings;
    children: NodeSchema[];
    headerId?: string;
    footerId?: string;
}
interface PageSettings {
    padding?: number | [number, number] | [number, number, number, number];
    backgroundColor?: string;
    format?: LayoutType;
    orientation?: 'portrait' | 'landscape';
    fontFamily?: string;
    fontSize?: number;
    color?: string;
}
type NodeType = 'text' | 'view' | 'image' | 'repeater' | 'background-image';
interface BaseNode {
    id: string;
    type: NodeType;
    style?: Style;
    fixed?: boolean;
    wrap?: boolean;
}
interface TextNode extends BaseNode {
    type: 'text';
    content: string;
}
interface ViewNode extends BaseNode {
    type: 'view';
    children: NodeSchema[];
}
interface ImageNode extends BaseNode {
    type: 'image';
    src: string;
}
interface BackgroundImageNode extends BaseNode {
    type: 'background-image';
    src: string;
    children: NodeSchema[];
}
interface RepeaterNode extends BaseNode {
    type: 'repeater';
    dataKey: string;
    itemAs: string;
    indexAs: string;
    loopId?: string;
}
type NodeSchema = TextNode | ViewNode | ImageNode | BackgroundImageNode | RepeaterNode;

declare const sampleInvoiceSchema: DocumentSchema;
declare const sampleInvoiceLoopSchema: DocumentSchema;

/**
 * Interpolates a string with mustache-style variables (e.g. {{user.name}}).
 * @param template The string with placeholders
 * @param context The data object to resolve variables against
 * @returns The interpolated string
 */
declare function interpolate(template: string, context: Record<string, unknown>): string;

/**
 * Evaluates whether a condition is true against the context data.
 * @param condition The path to check (e.g. "order.hasDiscount")
 * @param context The data object
 * @returns true if the condition evaluates to a truthy value, false otherwise
 */
declare function evaluateCondition(condition: string | undefined, context: Record<string, any>): boolean;

declare function resolveRepeaterItems(node: RepeaterNode, context: Record<string, unknown>): unknown[];

interface PDFDocumentProps {
    schema: DocumentSchema;
    data: Record<string, unknown>;
    headerSchemas?: Record<string, DocumentSchema>;
    footerSchemas?: Record<string, DocumentSchema>;
    loopSchemas?: Record<string, DocumentSchema>;
}
declare const PDFDocument: React.FC<PDFDocumentProps>;
declare function createPdfElement(schema: DocumentSchema, data: Record<string, unknown>, headerSchemas?: Record<string, DocumentSchema>, footerSchemas?: Record<string, DocumentSchema>, loopSchemas?: Record<string, DocumentSchema>): React.ReactElement<any>;

interface RenderContext {
    data: Record<string, unknown>;
    loopSchemas?: Record<string, DocumentSchema>;
}
declare function renderNode(node: NodeSchema, context: RenderContext): React.ReactNode;

declare function generatePdfBlobUrl(schema: DocumentSchema, data: Record<string, unknown>, headerSchemas?: Record<string, DocumentSchema>, footerSchemas?: Record<string, DocumentSchema>, loopSchemas?: Record<string, DocumentSchema>): Promise<string>;

declare function generatePdfStream(schema: DocumentSchema, data: Record<string, any>, headerSchemas?: Record<string, DocumentSchema>, footerSchemas?: Record<string, DocumentSchema>, loopSchemas?: Record<string, DocumentSchema>): Promise<NodeJS.ReadableStream>;
declare function generatePdfBuffer(schema: DocumentSchema, data: Record<string, any>, headerSchemas?: Record<string, DocumentSchema>, footerSchemas?: Record<string, DocumentSchema>, loopSchemas?: Record<string, DocumentSchema>): Promise<Buffer>;
declare function generatePdfFile(filePath: string, schema: DocumentSchema, data: Record<string, any>, headerSchemas?: Record<string, DocumentSchema>, footerSchemas?: Record<string, DocumentSchema>, loopSchemas?: Record<string, DocumentSchema>): Promise<void>;

declare function registerFont(family: string): void;
declare function registerFontsFromSchema(schema: DocumentSchema): void;

export { type BackgroundImageNode, type BaseNode, type DocumentSchema, type DocumentSettings, type ImageNode, type ItemKind, type LayoutType, type NodeSchema, type NodeType, PDFDocument, type PDFDocumentProps, type PageMode, type PageSchema, type PageSettings, type RenderContext, type RepeaterNode, type TextNode, type ViewNode, createPdfElement, evaluateCondition, generatePdfBlobUrl, generatePdfBuffer, generatePdfFile, generatePdfStream, interpolate, registerFont, registerFontsFromSchema, renderNode, resolveRepeaterItems, sampleInvoiceLoopSchema, sampleInvoiceSchema };
