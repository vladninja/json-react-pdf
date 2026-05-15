# json-react-pdf

Generate PDFs from a JSON document schema and dynamic data, powered by [@react-pdf/renderer](https://react-pdf.org).

Define your document layout as a JSON schema, bind it to data, and render a PDF — in the browser or Node.js.

## Install

```bash
npm install json-react-pdf @react-pdf/renderer react
```

## Quick start

### Browser

```ts
import { generatePdfBlobUrl } from 'json-react-pdf';
import type { DocumentSchema } from 'json-react-pdf';

const schema: DocumentSchema = {
  id: 'invoice-1',
  name: 'Invoice',
  layout: 'A4',
  kind: 'template',
  updatedAt: Date.now(),
  pages: [
    {
      id: 'page-1',
      type: 'dynamic',
      settings: { padding: 40 },
      children: [
        { id: 'title', type: 'text', content: 'Invoice #{{invoice.number}}', style: { fontSize: 24 } },
        { id: 'customer', type: 'text', content: 'Bill to: {{customer.name}}' },
      ],
    },
  ],
};

const data = {
  invoice: { number: '2024-001' },
  customer: { name: 'Acme Corp' },
};

const url = await generatePdfBlobUrl(schema, data);
window.open(url);
```

### Node.js

```ts
import { generatePdfBuffer } from 'json-react-pdf';

const buffer = await generatePdfBuffer(schema, data);
fs.writeFileSync('invoice.pdf', buffer);
```

## Schema reference

### `DocumentSchema`

| Field | Type | Description |
|---|---|---|
| `id` | `string` | Unique document identifier |
| `name` | `string` | Document name |
| `layout` | `'A4' \| 'A5' \| 'LETTER' \| 'LEGAL'` | Default page size |
| `kind` | `'template' \| 'header' \| 'footer' \| 'loop'` | Document role |
| `pages` | `PageSchema[]` | Pages |
| `settings` | `DocumentSettings` | Global font, color, password, etc. |

### Node types

| Type | Description |
|---|---|
| `text` | Renders a text string. Supports `{{variable}}` interpolation and `{{page}}` / `{{pages}}` for page numbers. |
| `view` | Container with children. Maps to `<View>`. |
| `image` | Renders an image from a URL or base64. `src` supports interpolation. |
| `background-image` | Full-bleed image container. Supports `objectFit` and `objectPosition` in style. |
| `repeater` | Iterates over an array in data. See [Repeater](#repeater). |

All nodes accept a `style` object (react-pdf style props), plus optional `fixed` and `wrap` booleans.

## Data binding

Interpolate values using `{{path.to.value}}` in `text` content and `image` src. Nested paths use dot notation via [lodash.get](https://lodash.com/docs/#get).

```json
{ "type": "text", "content": "Hello, {{user.firstName}}!" }
```

Missing paths are left as-is: `{{missing.key}}`.

## Repeater

The repeater iterates over an array and renders a row template for each item. Like headers and footers, the row template lives in a separate `DocumentSchema` of `kind: 'loop'` and is referenced by ID.

### 1. Define the row template schema (`kind: 'loop'`)

```ts
const lineItemSchema: DocumentSchema = {
  id: 'invoice-line-item-loop',
  name: 'Invoice Line Item',
  layout: 'A4',
  kind: 'loop',
  updatedAt: Date.now(),
  pages: [
    {
      id: 'loop-page',
      type: 'dynamic',
      settings: {},
      children: [
        {
          id: 'item-row',
          type: 'view',
          style: { flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: '#eee', paddingVertical: 8 },
          children: [
            { id: 'item-index',    type: 'text', content: '{{i}}.' },
            { id: 'item-name',     type: 'text', content: '{{item.name}}' },
            { id: 'item-quantity', type: 'text', content: '{{item.qty}} x' },
            { id: 'item-price',    type: 'text', content: '${{item.price}}' },
          ],
        },
      ],
    },
  ],
};
```

- `{{item.*}}` — fields of the current array element (bound via `itemAs`)
- `{{i}}` — zero-based index of the current element (bound via `indexAs`)

### 2. Place a repeater node in the template

```ts
const invoiceSchema: DocumentSchema = {
  id: 'invoice-template',
  kind: 'template',
  // ...
  pages: [
    {
      id: 'page-1',
      type: 'dynamic',
      headerId: 'invoice-header',   // optional
      footerId: 'invoice-footer',   // optional
      settings: { padding: 40 },
      children: [
        { id: 'title', type: 'text', content: 'Invoice #{{invoice.number}}', style: { fontSize: 20 } },
        {
          id: 'items-repeater',
          type: 'repeater',
          dataKey: 'items',               // dot-path to the array in data
          itemAs: 'item',                 // name for each element inside the loop
          indexAs: 'i',                   // name for the index inside the loop
          loopId: 'invoice-line-item-loop', // matches lineItemSchema.id
        },
        { id: 'total', type: 'text', content: 'Total: ${{total}}', style: { fontWeight: 'bold' } },
      ],
    },
  ],
};
```

### 3. Pass the loop schema alongside headers and footers

```ts
const data = {
  invoice: { number: '2024-001' },
  items: [
    { name: 'Design work', qty: 3, price: 150 },
    { name: 'Hosting',     qty: 1, price: 20  },
  ],
  total: 470,
};

const url = await generatePdfBlobUrl(
  invoiceSchema,
  data,
  { [headerSchema.id]: headerSchema },   // headerSchemas (optional)
  { [footerSchema.id]: footerSchema },   // footerSchemas (optional)
  { [lineItemSchema.id]: lineItemSchema }, // loopSchemas
);
```

### Repeater node fields

| Field | Type | Description |
|---|---|---|
| `dataKey` | `string` | Dot-path to the array in your data |
| `itemAs` | `string` | Variable name bound to each element inside the loop template |
| `indexAs` | `string` | Variable name bound to the element index inside the loop template |
| `loopId` | `string` | ID of the `kind: 'loop'` schema whose `pages[0].children` are the row template |

## Headers and footers

Pass header and footer schemas by ID:

```ts
const url = await generatePdfBlobUrl(
  templateSchema,
  data,
  { [headerSchema.id]: headerSchema },
  { [footerSchema.id]: footerSchema },
);
```

Reference them in each page:

```json
{
  "id": "page-1",
  "type": "dynamic",
  "headerId": "header-schema-id",
  "footerId": "footer-schema-id",
  "settings": {},
  "children": []
}
```

## Fonts

Google Fonts are supported out of the box. Set `fontFamily` in document/page settings or a node's style:

```json
{ "settings": { "fontFamily": "Inter", "fontSize": 11 } }
```

Fonts are fetched from Google Fonts CDN at render time and cached for the session.

## API

### Browser

```ts
generatePdfBlobUrl(schema, data, headerSchemas?, footerSchemas?, loopSchemas?): Promise<string>
```

Returns a `blob:` URL you can open in a new tab or set as an `<iframe src>`.

### Node.js

```ts
generatePdfBuffer(schema, data, headerSchemas?, footerSchemas?, loopSchemas?): Promise<Buffer>
generatePdfStream(schema, data, headerSchemas?, footerSchemas?, loopSchemas?): Promise<NodeJS.ReadableStream>
generatePdfFile(filePath, schema, data, headerSchemas?, footerSchemas?, loopSchemas?): Promise<void>
```

### React component

```tsx
import { PDFDocument } from 'json-react-pdf';
import { PDFViewer } from '@react-pdf/renderer';

<PDFViewer>
  <PDFDocument schema={schema} data={data} />
</PDFViewer>
```

## License

MIT
