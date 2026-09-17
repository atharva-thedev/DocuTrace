import DOMPurify from 'dompurify';

/**
 * Sanitize untrusted user and LLM markdown/HTML strings.
 */
export function sanitizeHtml(dirtyHtml: string): string {
  if (!dirtyHtml) return '';
  return DOMPurify.sanitize(dirtyHtml, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'ul', 'ol', 'li', 'code', 'pre', 'span', 'br'],
    ALLOWED_ATTR: ['href', 'target', 'class', 'rel'],
  });
}
