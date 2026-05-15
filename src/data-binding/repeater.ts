import get from 'lodash.get';
import { RepeaterNode } from '../schema/types';

export function resolveRepeaterItems(node: RepeaterNode, context: Record<string, unknown>): unknown[] {
  if (!node.dataKey) return [];

  const items = get(context, node.dataKey.trim());
  if (Array.isArray(items)) {
    return items;
  }
  if (items != null) {
    console.warn(`[dokk-pdf] Repeater "${node.id}" expected array at "${node.dataKey}" but got ${typeof items}`);
  }
  return [];
}
