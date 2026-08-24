/**
 * Wraps a paragraph that contains nothing but an image in a <figure>, using the
 * markdown title as the caption: ![alt](./chart.png "Where the number came from")
 *
 * Astro resolves and optimises markdown images itself; this only moves the node
 * it produced, so the optimised src, width and height all survive untouched.
 * Paragraphs that mix an image with text are left alone — those are inline
 * images, not figures, and boxing them would be wrong.
 */
export function rehypeFigure() {
  return (tree) => {
    visit(tree);
  };

  function visit(node) {
    if (!node.children) return;
    node.children = node.children.map((child) => {
      visit(child);
      if (child.type !== 'element' || child.tagName !== 'p') return child;

      const kids = child.children.filter(
        (c) => !(c.type === 'text' && c.value.trim() === '')
      );
      if (kids.length !== 1) return child;

      const img = kids[0];
      if (img.type !== 'element' || img.tagName !== 'img') return child;

      const caption = img.properties?.title;
      if (caption) delete img.properties.title;

      return {
        type: 'element',
        tagName: 'figure',
        properties: {},
        children: caption
          ? [
              img,
              {
                type: 'element',
                tagName: 'figcaption',
                properties: {},
                children: [{ type: 'text', value: String(caption) }],
              },
            ]
          : [img],
      };
    });
  }
}
