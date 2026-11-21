import katex from 'katex';

// Renders authored text to HTML: "## " headings, "- " lists, paragraphs, **bold**, $inline$ and $$display$$ math.
// Content is trusted (written by authors through the import script), but plain text is still escaped.

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export function inline(text: string): string {
  return text.split(/(\$\$[\s\S]+?\$\$|\$[^$\n]+?\$)/).map((part, i) => {
    if (i % 2 === 0) return esc(part).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>');
    const display = part.startsWith('$$');
    return katex.renderToString(part.slice(display ? 2 : 1, display ? -2 : -1), { displayMode: display, throwOnError: false, strict: false });
  }).join('');
}

export function rich(text: string): string {
  // A heading line ends its block, so "## Title\ntext" is a heading then a paragraph.
  return text.replace(/\r\n/g, '\n').replace(/^(#{2,3} .*)\n(?=\S)/gm, '$1\n\n').split(/\n\s*\n/).map((block) => {
    const b = block.trim();
    if (b.startsWith('### ')) return `<h3>${inline(b.slice(4))}</h3>`;
    if (b.startsWith('## ')) return `<h2>${inline(b.slice(3))}</h2>`;
    if (/^- /.test(b)) return `<ul>${b.split(/\n(?=- )/).map((li) => `<li>${inline(li.slice(2))}</li>`).join('')}</ul>`;
    return `<p>${inline(b)}</p>`;
  }).join('');
}
