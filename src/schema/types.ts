import type { Style } from '@react-pdf/types';

export type LayoutType = 'A4' | 'A5' | 'LETTER' | 'LEGAL';

export type ItemKind = 'template' | 'header' | 'footer' | 'loop';

export interface DocumentSchema {
  id: string;
  name: string;
  layout: LayoutType;
  kind: ItemKind;
  updatedAt: number;
  pages: PageSchema[];
  settings?: DocumentSettings;
}

export interface DocumentSettings {
  fontFamily?: string;
  fontSize?: number;
  color?: string;
  title?: string;
  pageMode?: 'useNone' | 'useOutlines' | 'useThumbs' | 'fullScreen' | 'useOC' | 'useAttachments';
  pageLayout?: 'singlePage' | 'oneColumn' | 'twoColumnLeft' | 'twoColumnRight' | 'twoPageLeft' | 'twoPageRight';
  userPassword?: string;
  orientation?: 'portrait' | 'landscape';
}

export type PageMode = 'static' | 'dynamic';

export interface PageSchema {
  id: string;
  type: PageMode;
  settings: PageSettings;
  children: NodeSchema[];
  headerId?: string;
  footerId?: string;
}

export interface PageSettings {
  padding?: number | [number, number] | [number, number, number, number];
  backgroundColor?: string;
  format?: LayoutType;
  orientation?: 'portrait' | 'landscape';
  fontFamily?: string;
  fontSize?: number;
  color?: string;
}

export type NodeType = 'text' | 'view' | 'image' | 'repeater' | 'background-image';

export interface BaseNode {
  id: string;
  type: NodeType;
  style?: Style;
  fixed?: boolean;
  wrap?: boolean;
}

export interface TextNode extends BaseNode {
  type: 'text';
  content: string;
}

export interface ViewNode extends BaseNode {
  type: 'view';
  children: NodeSchema[];
}

export interface ImageNode extends BaseNode {
  type: 'image';
  src: string;
}

export interface BackgroundImageNode extends BaseNode {
  type: 'background-image';
  src: string;
  children: NodeSchema[];
}

export interface RepeaterNode extends BaseNode {
  type: 'repeater';
  dataKey: string;
  itemAs: string;
  indexAs: string;
  loopId?: string;
}

export type NodeSchema = TextNode | ViewNode | ImageNode | BackgroundImageNode | RepeaterNode;
