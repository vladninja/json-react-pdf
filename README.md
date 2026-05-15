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

Iterate over an array to render repeated blocks:

```json
{
  "type": "repeater",
  "dataKey": "items",
  "itemAs": "item",
  "indexAs": "i",
  "loopId": "line-item-loop-schema-id"
}
```

- `dataKey` — dot-path to the array in your data
- `itemAs` — name to bind each item to inside the loop
- `indexAs` — name to bind the index to inside the loop
- `loopId` — (optional) ID of a separate `DocumentSchema` of `kind: 'loop'` whose `pages[0].children` are used as the row template

Within the loop schema, use `{{item.fieldName}}` and `{{i}}` for the current row.

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
