// React can stream a product-info div outside its article, then move it to P:n.
// Resolve only observed $RS(S:n,P:n) references for audit text extraction.
// Never execute scripts; this is not a replacement for a browser rendering check.
export function resolveStreamedCard(card, documentHtml) {
  return card.replace(/<template id="(P:[a-f0-9]+)"><\/template>/g, (placeholder, target) => {
    const source = `S:${target.slice(2)}`;
    if (!documentHtml.includes(`$RS("${source}","${target}")`)) return placeholder;
    const start = documentHtml.indexOf(`<div hidden id="${source}">`);
    if (start < 0) return placeholder;
    const innerStart = documentHtml.indexOf('>', start) + 1;
    const tags = /<\/?div\b[^>]*>/g;
    tags.lastIndex = innerStart;
    let depth = 1;
    for (let match; (match = tags.exec(documentHtml));) {
      depth += match[0].startsWith('</') ? -1 : 1;
      if (depth === 0) return documentHtml.slice(innerStart, match.index);
    }
    return placeholder;
  });
}
