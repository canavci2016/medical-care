import { randomUUID } from 'node:crypto';

export class StringHelper {
  static capitalizeFirstLetter(str: string): string {
    if (!str) return str;
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  static toSlug(value: string): string {
    const normalized = value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    return normalized || randomUUID();
  }

  static attachUtmSource(url: string, source: string): string {
    if (!url || !source) return url;

    try {
      const isAbsolute = /^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(url);
      const parsed = isAbsolute ? new URL(url) : new URL(url, 'http://dummy');

      parsed.searchParams.set('utm_source', source);

      if (isAbsolute) return parsed.toString();

      // For relative URLs, return the path + query + hash (omit dummy origin)
      return parsed.pathname + parsed.search + parsed.hash;
    } catch {
      // Fallback: naive append
      const separator = url.includes('?') ? '&' : '?';
      const replaced = url.replace(/([?&])utm_source=[^&]*/i, '$1');
      // Clean up any trailing separators before appending
      const clean = replaced.replace(/[?&]$/g, '');
      return `${clean}${clean.includes('?') ? '&' : separator}utm_source=${encodeURIComponent(source)}`;
    }
  }
}
