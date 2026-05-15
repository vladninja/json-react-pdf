import get from 'lodash.get';

/**
 * Evaluates whether a condition is true against the context data.
 * @param condition The path to check (e.g. "order.hasDiscount")
 * @param context The data object
 * @returns true if the condition evaluates to a truthy value, false otherwise
 */
export function evaluateCondition(condition: string | undefined, context: Record<string, any>): boolean {
  if (!condition) return true; // if no condition is provided, it should show
  
  const value = get(context, condition.trim());
  return Boolean(value);
}
