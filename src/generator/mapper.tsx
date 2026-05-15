import React from 'react';
import { Text, View, Image } from '@react-pdf/renderer';
import type { Style } from '@react-pdf/types';
import type { DocumentSchema, NodeSchema } from '../schema/types';
import { interpolate } from '../data-binding/interpolator';
import { resolveRepeaterItems } from '../data-binding/repeater';

export interface RenderContext {
  data: Record<string, unknown>;
  loopSchemas?: Record<string, DocumentSchema>;
}

type CommonNodeProps = { style: Style; fixed?: boolean; wrap?: boolean };

export function renderNode(node: NodeSchema, context: RenderContext): React.ReactNode {

  if (node.type === 'repeater') {
    const items = resolveRepeaterItems(node, context.data);
    const loopChildren = node.loopId
      ? (context.loopSchemas?.[node.loopId]?.pages[0]?.children ?? [])
      : null;

    return items.map((item, index) => {
      const scopedContext: RenderContext = {
        ...context,
        data: { ...context.data, [node.itemAs]: item, [node.indexAs]: index },
      };
      return (
        <React.Fragment key={`${node.id}-${index}`}>
          {loopChildren?.map(child => renderNode(child, scopedContext))}
        </React.Fragment>
      );
    });
  }

  const commonProps: CommonNodeProps = { style: node.style ?? ({} as Style) };
  if (node.fixed !== undefined) commonProps.fixed = node.fixed;
  if (node.wrap !== undefined) commonProps.wrap = node.wrap;

  if (node.type === 'text') {
    const usesPageVars = node.content.includes('{{page}}') || node.content.includes('{{pages}}');
    if (usesPageVars) {
      return (
        <Text key={node.id} {...commonProps} render={({ pageNumber, totalPages }) =>
          interpolate(node.content, { ...context.data, page: pageNumber, pages: totalPages })
        } />
      );
    }
    return (
      <Text key={node.id} {...commonProps}>
        {interpolate(node.content, context.data)}
      </Text>
    );
  }

  if (node.type === 'image') {
    return (
      <Image
        key={node.id}
        {...commonProps}
        src={interpolate(node.src, context.data)}
      />
    );
  }

  if (node.type === 'view') {
    return (
      <View key={node.id} {...commonProps}>
        {node.children.map(child => renderNode(child, context))}
      </View>
    );
  }

  if (node.type === 'background-image') {
    const { objectFit, objectPosition, ...containerStyle } = node.style ?? ({} as Style);
    return (
      <View key={node.id} style={containerStyle} fixed={node.fixed} {...(node.wrap !== undefined && { wrap: node.wrap })}>
        <Image
          src={interpolate(node.src, context.data)}
          style={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            width: '100%', height: '100%',
            objectFit: objectFit ?? 'cover',
            objectPosition,
          }}
        />
        {node.children.map(child => renderNode(child, context))}
      </View>
    );
  }

  return null;
}
