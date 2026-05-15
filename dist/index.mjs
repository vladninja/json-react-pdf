// src/schema/sample.ts
var sampleInvoiceSchema = {
  id: "invoice-template-1",
  name: "Standard Invoice",
  layout: "A4",
  kind: "template",
  updatedAt: 1747008e6,
  settings: {
    fontFamily: "Inter",
    fontSize: 10,
    color: "#333333"
  },
  pages: [
    {
      id: "page-1",
      type: "dynamic",
      settings: {
        padding: 40,
        backgroundColor: "#ffffff"
      },
      children: [
        {
          id: "branded-fixed-header",
          type: "view",
          fixed: true,
          style: {
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottomWidth: 1,
            borderBottomColor: "#deff9a",
            paddingBottom: 10,
            marginBottom: 20
          },
          children: [
            {
              id: "brand-logo",
              type: "view",
              style: {
                width: 40,
                height: 40,
                backgroundColor: "#deff9a",
                borderRadius: 20,
                justifyContent: "center",
                alignItems: "center"
              },
              children: [
                {
                  id: "brand-logo-text",
                  type: "text",
                  content: "D",
                  style: { color: "#000", fontWeight: "bold", fontSize: 20 }
                }
              ]
            },
            {
              id: "company-info",
              type: "view",
              style: { alignItems: "flex-end" },
              children: [
                {
                  id: "company-name",
                  type: "text",
                  content: "DOKK PDF SOLUTIONS",
                  style: { fontSize: 10, fontWeight: "bold", color: "#333" }
                },
                {
                  id: "company-tagline",
                  type: "text",
                  content: "Visual Template Engine",
                  style: { fontSize: 8, color: "#888" }
                }
              ]
            }
          ]
        },
        {
          id: "header-view",
          type: "view",
          style: {
            flexDirection: "row",
            justifyContent: "space-between",
            marginBottom: 20
          },
          children: [
            {
              id: "title-text",
              type: "text",
              content: "INVOICE",
              style: {
                fontSize: 24,
                fontWeight: "bold"
              }
            },
            {
              id: "invoice-number",
              type: "text",
              content: "#{{invoice_number}}",
              style: {
                fontSize: 16,
                color: "#666666"
              }
            }
          ]
        },
        {
          id: "items-repeater",
          type: "repeater",
          dataKey: "items",
          itemAs: "item",
          indexAs: "index",
          loopId: "invoice-line-item-loop"
        },
        {
          id: "total-view",
          type: "view",
          style: {
            flexDirection: "row",
            justifyContent: "flex-end",
            marginTop: 20
          },
          children: [
            {
              id: "total-text",
              type: "text",
              content: "Total: ${{total_amount}}",
              style: {
                fontSize: 16,
                fontWeight: "bold"
              }
            }
          ]
        }
      ]
    }
  ]
};
var sampleInvoiceLoopSchema = {
  id: "invoice-line-item-loop",
  name: "Invoice Line Item",
  layout: "A4",
  kind: "loop",
  updatedAt: 1747008e6,
  pages: [
    {
      id: "loop-page",
      type: "dynamic",
      settings: {},
      children: [
        {
          id: "item-row",
          type: "view",
          style: {
            flexDirection: "row",
            justifyContent: "space-between",
            borderBottomWidth: 1,
            borderBottomColor: "#eeeeee",
            paddingVertical: 10
          },
          children: [
            { id: "item-name", type: "text", content: "{{item.name}}", style: {} },
            { id: "item-price", type: "text", content: "${{item.price}}", style: {} }
          ]
        }
      ]
    }
  ]
};

// src/data-binding/interpolator.ts
import get from "lodash.get";
function interpolate(template, context) {
  if (!template || typeof template !== "string") return template;
  return template.replace(/\{\{(.+?)\}\}/g, (_, path) => {
    const value = get(context, path.trim());
    return value !== void 0 && value !== null ? String(value) : `{{${path.trim()}}}`;
  });
}

// src/data-binding/conditions.ts
import get2 from "lodash.get";
function evaluateCondition(condition, context) {
  if (!condition) return true;
  const value = get2(context, condition.trim());
  return Boolean(value);
}

// src/data-binding/repeater.ts
import get3 from "lodash.get";
function resolveRepeaterItems(node, context) {
  if (!node.dataKey) return [];
  const items = get3(context, node.dataKey.trim());
  if (Array.isArray(items)) {
    return items;
  }
  if (items != null) {
    console.warn(`[dokk-pdf] Repeater "${node.id}" expected array at "${node.dataKey}" but got ${typeof items}`);
  }
  return [];
}

// src/generator/document.tsx
import React2 from "react";
import { Document, Page, View as View2 } from "@react-pdf/renderer";

// src/generator/mapper.tsx
import React from "react";
import { Text, View, Image } from "@react-pdf/renderer";
function renderNode(node, context) {
  var _a, _b, _c, _d, _e, _f;
  if (node.type === "repeater") {
    const items = resolveRepeaterItems(node, context.data);
    const loopChildren = node.loopId ? (_d = (_c = (_b = (_a = context.loopSchemas) == null ? void 0 : _a[node.loopId]) == null ? void 0 : _b.pages[0]) == null ? void 0 : _c.children) != null ? _d : [] : null;
    return items.map((item, index) => {
      const scopedContext = {
        ...context,
        data: { ...context.data, [node.itemAs]: item, [node.indexAs]: index }
      };
      return /* @__PURE__ */ React.createElement(React.Fragment, { key: `${node.id}-${index}` }, loopChildren == null ? void 0 : loopChildren.map((child) => renderNode(child, scopedContext)));
    });
  }
  const commonProps = { style: (_e = node.style) != null ? _e : {} };
  if (node.fixed !== void 0) commonProps.fixed = node.fixed;
  if (node.wrap !== void 0) commonProps.wrap = node.wrap;
  if (node.type === "text") {
    const usesPageVars = node.content.includes("{{page}}") || node.content.includes("{{pages}}");
    if (usesPageVars) {
      return /* @__PURE__ */ React.createElement(Text, { key: node.id, ...commonProps, render: ({ pageNumber, totalPages }) => interpolate(node.content, { ...context.data, page: pageNumber, pages: totalPages }) });
    }
    return /* @__PURE__ */ React.createElement(Text, { key: node.id, ...commonProps }, interpolate(node.content, context.data));
  }
  if (node.type === "image") {
    return /* @__PURE__ */ React.createElement(
      Image,
      {
        key: node.id,
        ...commonProps,
        src: interpolate(node.src, context.data)
      }
    );
  }
  if (node.type === "view") {
    return /* @__PURE__ */ React.createElement(View, { key: node.id, ...commonProps }, node.children.map((child) => renderNode(child, context)));
  }
  if (node.type === "background-image") {
    const { objectFit, objectPosition, ...containerStyle } = (_f = node.style) != null ? _f : {};
    return /* @__PURE__ */ React.createElement(View, { key: node.id, style: containerStyle, fixed: node.fixed, ...node.wrap !== void 0 && { wrap: node.wrap } }, /* @__PURE__ */ React.createElement(
      Image,
      {
        src: interpolate(node.src, context.data),
        style: {
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: "100%",
          height: "100%",
          objectFit: objectFit != null ? objectFit : "cover",
          objectPosition
        }
      }
    ), node.children.map((child) => renderNode(child, context)));
  }
  return null;
}

// src/generator/document.tsx
function resolvePadding(p) {
  if (p === void 0) return void 0;
  if (typeof p === "number") return p;
  return p.join(" ");
}
var PDFDocument = ({ schema, data, headerSchemas, footerSchemas, loopSchemas }) => {
  var _a, _b, _c, _d;
  const context = { data, loopSchemas };
  return /* @__PURE__ */ React2.createElement(
    Document,
    {
      title: ((_a = schema.settings) == null ? void 0 : _a.title) || schema.name,
      pageMode: (_b = schema.settings) == null ? void 0 : _b.pageMode,
      pageLayout: (_c = schema.settings) == null ? void 0 : _c.pageLayout,
      userPassword: (_d = schema.settings) == null ? void 0 : _d.userPassword
    },
    schema.pages.map((page) => {
      var _a2, _b2, _c2, _d2, _e, _f, _g, _h, _i, _j;
      const isStatic = page.type === "static";
      const headerSchema = page.headerId ? headerSchemas == null ? void 0 : headerSchemas[page.headerId] : void 0;
      const footerSchema = page.footerId ? footerSchemas == null ? void 0 : footerSchemas[page.footerId] : void 0;
      return /* @__PURE__ */ React2.createElement(
        Page,
        {
          key: page.id,
          size: page.settings.format || schema.layout,
          orientation: page.settings.orientation || ((_a2 = schema.settings) == null ? void 0 : _a2.orientation) || "portrait",
          style: {
            padding: resolvePadding(page.settings.padding),
            backgroundColor: page.settings.backgroundColor,
            fontFamily: (_c2 = page.settings.fontFamily) != null ? _c2 : (_b2 = schema.settings) == null ? void 0 : _b2.fontFamily,
            fontSize: (_e = page.settings.fontSize) != null ? _e : (_d2 = schema.settings) == null ? void 0 : _d2.fontSize,
            color: (_h = (_g = page.settings.color) != null ? _g : (_f = schema.settings) == null ? void 0 : _f.color) != null ? _h : "#000"
          },
          wrap: !isStatic
        },
        headerSchema && /* @__PURE__ */ React2.createElement(View2, { fixed: true }, (_i = headerSchema.pages[0]) == null ? void 0 : _i.children.map((child) => renderNode(child, context))),
        page.children.map((child) => renderNode(child, context)),
        footerSchema && /* @__PURE__ */ React2.createElement(View2, { fixed: true, style: { marginTop: "auto" } }, (_j = footerSchema.pages[0]) == null ? void 0 : _j.children.map((child) => renderNode(child, context)))
      );
    })
  );
};
function createPdfElement(schema, data, headerSchemas, footerSchemas, loopSchemas) {
  return React2.createElement(PDFDocument, { schema, data, headerSchemas, footerSchemas, loopSchemas });
}

// src/generator/browser.ts
import { pdf } from "@react-pdf/renderer";

// src/generator/fonts.ts
import { Font } from "@react-pdf/renderer";
import googleFontsData from "./google-fonts-4HMFZ7VA.json";
var FONT_METADATA = /* @__PURE__ */ new Map();
googleFontsData.items.forEach((item) => {
  FONT_METADATA.set(item.family.toLowerCase(), item);
});
var registeredFonts = /* @__PURE__ */ new Set();
function registerFont(family) {
  var _a;
  if (!family || family === "") return;
  const sanitizedFamily = ((_a = family.replace(/['"]/g, "").split(",")[0]) != null ? _a : family).trim();
  if (registeredFonts.has(sanitizedFamily)) return;
  const metadata = FONT_METADATA.get(sanitizedFamily.toLowerCase());
  if (!metadata) return;
  const sources = [];
  Object.entries(metadata.files).forEach(([variant, url]) => {
    let fontWeight = 400;
    if (variant === "regular" || variant === "italic") fontWeight = 400;
    else if (variant === "700" || variant === "700italic") fontWeight = 700;
    else if (!isNaN(parseInt(variant))) fontWeight = parseInt(variant);
    const secureUrl = url.replace("http://", "https://");
    const fontStyle = variant.includes("italic") ? "italic" : "normal";
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
function registerFontsFromSchema(schema) {
  var _a;
  const fonts = /* @__PURE__ */ new Set();
  function scan(nodes) {
    var _a2, _b;
    for (const node of nodes) {
      const fontFamily = (_a2 = node.style) == null ? void 0 : _a2.fontFamily;
      if (fontFamily) {
        fonts.add(Array.isArray(fontFamily) ? (_b = fontFamily[0]) != null ? _b : "" : fontFamily);
      }
      if ("children" in node) scan(node.children);
    }
  }
  for (const page of schema.pages) {
    if (page.settings.fontFamily) fonts.add(page.settings.fontFamily);
    scan(page.children);
  }
  if ((_a = schema.settings) == null ? void 0 : _a.fontFamily) fonts.add(schema.settings.fontFamily);
  fonts.forEach((f) => registerFont(f));
}

// src/generator/browser.ts
async function generatePdfBlobUrl(schema, data, headerSchemas, footerSchemas, loopSchemas) {
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

// src/generator/node.ts
import { renderToStream, renderToBuffer, renderToFile } from "@react-pdf/renderer";
async function generatePdfStream(schema, data, headerSchemas, footerSchemas, loopSchemas) {
  return renderToStream(createPdfElement(schema, data, headerSchemas, footerSchemas, loopSchemas));
}
async function generatePdfBuffer(schema, data, headerSchemas, footerSchemas, loopSchemas) {
  return renderToBuffer(createPdfElement(schema, data, headerSchemas, footerSchemas, loopSchemas));
}
async function generatePdfFile(filePath, schema, data, headerSchemas, footerSchemas, loopSchemas) {
  await renderToFile(createPdfElement(schema, data, headerSchemas, footerSchemas, loopSchemas), filePath);
}
export {
  PDFDocument,
  createPdfElement,
  evaluateCondition,
  generatePdfBlobUrl,
  generatePdfBuffer,
  generatePdfFile,
  generatePdfStream,
  interpolate,
  registerFont,
  registerFontsFromSchema,
  renderNode,
  resolveRepeaterItems,
  sampleInvoiceLoopSchema,
  sampleInvoiceSchema
};
