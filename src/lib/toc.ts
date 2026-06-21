export interface TocItem {
  id: string;
  text: string;
  level: number;
}

/**
 * Parse markdown content and extract headings for table of contents.
 * The generated id matches what rehype-slug would produce.
 */
export function extractToc(markdown: string): TocItem[] {
  const headingRegex = /^(#{2,4})\s+(.+)$/gm;
  const items: TocItem[] = [];
  let match: RegExpExecArray | null;

  while ((match = headingRegex.exec(markdown)) !== null) {
    const level = match[1].length;
    const rawText = match[2].trim();
    // Remove inline formatting like **bold**, `code`, [link](url)
    const text = rawText.replace(/[`*_~\[\]()]/g, "").trim();
    // rehype-slug uses github-slugger which lowercases, replaces non-words with -,
    // removes leading/trailing hyphens, collapses multiple hyphens
    const id = text
      .toLowerCase()
      .replace(/[^\w\u4e00-\u9fff\s-]/g, "")  // remove special chars
      .replace(/\s+/g, "-")                    // spaces to hyphens
      .replace(/-+/g, "-")                     // collapse hyphens
      .replace(/^-+|-+$/g, "");                // trim hyphens
    items.push({ id, text, level });
  }

  return items;
}
