import type { DocumentSchema } from './types';

export const sampleInvoiceSchema: DocumentSchema = {
  id: 'invoice-template-1',
  name: 'Standard Invoice',
  layout: 'A4',
  kind: 'template',
  updatedAt: 1747008000000,
  settings: {
    fontFamily: 'Inter',
    fontSize: 10,
    color: '#333333'
  },
  pages: [
    {
      id: 'page-1',
      type: 'dynamic',
      settings: {
        padding: 40,
        backgroundColor: '#ffffff',
      },
      children: [
        {
          id: 'branded-fixed-header',
          type: 'view',
          fixed: true,
          style: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottomWidth: 1,
            borderBottomColor: '#deff9a',
            paddingBottom: 10,
            marginBottom: 20
          },
          children: [
            {
              id: 'brand-logo',
              type: 'view',
              style: {
                width: 40,
                height: 40,
                backgroundColor: '#deff9a',
                borderRadius: 20,
                justifyContent: 'center',
                alignItems: 'center'
              },
              children: [
                {
                  id: 'brand-logo-text',
                  type: 'text',
                  content: 'D',
                  style: { color: '#000', fontWeight: 'bold', fontSize: 20 }
                }
              ]
            },
            {
              id: 'company-info',
              type: 'view',
              style: { alignItems: 'flex-end' },
              children: [
                {
                  id: 'company-name',
                  type: 'text',
                  content: 'DOKK PDF SOLUTIONS',
                  style: { fontSize: 10, fontWeight: 'bold', color: '#333' }
                },
                {
                  id: 'company-tagline',
                  type: 'text',
                  content: 'Visual Template Engine',
                  style: { fontSize: 8, color: '#888' }
                }
              ]
            }
          ]
        },
        {
          id: 'header-view',
          type: 'view',
          style: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: 20
          },
          children: [
            {
              id: 'title-text',
              type: 'text',
              content: 'INVOICE',
              style: {
                fontSize: 24,
                fontWeight: 'bold'
              }
            },
            {
              id: 'invoice-number',
              type: 'text',
              content: '#{{invoice_number}}',
              style: {
                fontSize: 16,
                color: '#666666'
              }
            }
          ]
        },
        {
          id: 'items-repeater',
          type: 'repeater',
          dataKey: 'items',
          itemAs: 'item',
          indexAs: 'index',
          loopId: 'invoice-line-item-loop',
        },
        {
          id: 'total-view',
          type: 'view',
          style: {
            flexDirection: 'row',
            justifyContent: 'flex-end',
            marginTop: 20
          },
          children: [
            {
              id: 'total-text',
              type: 'text',
              content: 'Total: ${{total_amount}}',
              style: {
                fontSize: 16,
                fontWeight: 'bold'
              }
            }
          ]
        }
      ]
    }
  ]
};

export const sampleInvoiceLoopSchema: DocumentSchema = {
  id: 'invoice-line-item-loop',
  name: 'Invoice Line Item',
  layout: 'A4',
  kind: 'loop',
  updatedAt: 1747008000000,
  pages: [
    {
      id: 'loop-page',
      type: 'dynamic',
      settings: {},
      children: [
        {
          id: 'item-row',
          type: 'view',
          style: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            borderBottomWidth: 1,
            borderBottomColor: '#eeeeee',
            paddingVertical: 10,
          },
          children: [
            { id: 'item-name', type: 'text', content: '{{item.name}}', style: {} },
            { id: 'item-price', type: 'text', content: '${{item.price}}', style: {} },
          ],
        },
      ],
    },
  ],
};
