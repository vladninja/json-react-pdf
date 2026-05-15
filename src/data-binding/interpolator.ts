import get from 'lodash.get';

/**
 * Interpolates a string with mustache-style variables (e.g. {{user.name}}).
 * @param template The string with placeholders
 * @param context The data object to resolve variables against
 * @returns The interpolated string
 */
export function interpolate(template: string, context: Record<string, unknown>): string {
  if (!template || typeof template !== 'string') return template;
  
  return template.replace(/\{\{(.+?)\}\}/g, (_, path) => {
    const value = get(context, path.trim());
    return value !== undefined && value !== null ? String(value) : `{{${path.trim()}}}`;
  });
}
