import katex from 'katex';

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function renderKatexExpression(expression: string, displayMode: boolean) {
  try {
    return katex.renderToString(expression, { throwOnError: false, displayMode });
  } catch {
    return `<code>${escapeHtml(expression)}</code>`;
  }
}

function renderPlainSegment(segment: string) {
  return escapeHtml(segment)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br />');
}

export function renderRichTextToHtml(value: string) {
  const source = value || '';
  const parts = source.split(/(\$\$[\s\S]+?\$\$|\$[^$]+\$)/g).filter(Boolean);

  return parts
    .map((part) => {
      if (part.startsWith('$$') && part.endsWith('$$')) {
        return renderKatexExpression(part.slice(2, -2), true);
      }
      if (part.startsWith('$') && part.endsWith('$')) {
        return renderKatexExpression(part.slice(1, -1), false);
      }
      return renderPlainSegment(part);
    })
    .join('');
}
