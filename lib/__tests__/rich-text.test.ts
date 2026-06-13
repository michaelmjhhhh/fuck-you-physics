import { describe, expect, it } from 'vitest';
import { renderRichTextToHtml } from '../rich-text';

describe('renderRichTextToHtml', () => {
  it('escapes raw HTML while preserving markdown emphasis', () => {
    const rendered = renderRichTextToHtml('Use **moments** <script>alert("x")</script>');

    expect(rendered).toContain('<strong>moments</strong>');
    expect(rendered).toContain('&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;');
    expect(rendered).not.toContain('<script>');
  });

  it('renders inline KaTeX expressions', () => {
    const rendered = renderRichTextToHtml('Use $F=ma$ for the resultant force.');

    expect(rendered).toContain('katex');
    expect(rendered).toContain('F');
    expect(rendered).toContain('m');
  });
});
