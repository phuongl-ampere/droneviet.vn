import { Injectable } from "@nestjs/common";
import rehypeParse from "rehype-parse";
import rehypeSanitize from "rehype-sanitize";
import rehypeSlug from "rehype-slug";
import rehypeStringify from "rehype-stringify";
import { unified } from "unified";

export type RichTextHeading = {
  depth: number;
  id: string;
  text: string;
};

export type RenderedRichText = {
  html: string;
  tableOfContents: RichTextHeading[];
  text: string;
};

type LexicalNode = {
  altText?: string;
  children?: LexicalNode[];
  format?: number;
  headerState?: number;
  listType?: string;
  src?: string;
  tag?: string;
  text?: string;
  type?: string;
  url?: string;
};

type LexicalEditorState = {
  root?: LexicalNode;
};

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function slugifyHeading(text: string): string {
  return text
    .normalize("NFKD")
    .replace(/\p{Diacritic}/gu, "")
    .toLocaleLowerCase()
    .replace(/[^\p{Letter}\p{Number}]+/gu, "-")
    .replace(/(^-|-$)/g, "");
}

function collectText(node: LexicalNode | undefined): string {
  if (!node) {
    return "";
  }

  return [
    node.text ?? "",
    ...(node.children?.map((child) => collectText(child)) ?? []),
  ]
    .filter(Boolean)
    .join(" ");
}

function validateSource(node: LexicalNode): void {
  if (node.type === "image") {
    const source = String(node.src ?? "");

    if (
      !/^\/media\/articles\/\d{4}\/\d{2}\/[a-f0-9-]+(?:-640)?\.webp$/i.test(
        source,
      )
    ) {
      throw new Error("RICH_TEXT_IMAGE_URL_INVALID");
    }
  }

  if (node.type === "link" || node.type === "autolink") {
    const url = String(node.url ?? "");

    if (!/^https?:\/\//i.test(url)) {
      throw new Error("RICH_TEXT_LINK_URL_INVALID");
    }
  }

  for (const child of node.children ?? []) {
    validateSource(child);
  }
}

function formatText(text: string, format = 0): string {
  let html = escapeHtml(text);

  if (format & 1) html = `<strong>${html}</strong>`;
  if (format & 2) html = `<em>${html}</em>`;
  if (format & 4) html = `<s>${html}</s>`;
  if (format & 8) html = `<u>${html}</u>`;
  if (format & 16) html = `<code>${html}</code>`;

  return html;
}

function renderChildren(
  children: LexicalNode[] | undefined,
  headings: RichTextHeading[],
): string {
  return (children ?? [])
    .map((child) => renderNode(child, headings))
    .join("");
}

function renderNode(node: LexicalNode, headings: RichTextHeading[]): string {
  const children = renderChildren(node.children, headings);

  switch (node.type) {
    case "root":
      return children;
    case "text":
      return formatText(node.text ?? "", node.format);
    case "linebreak":
      return "<br>";
    case "paragraph":
      return `<p>${children}</p>`;
    case "heading": {
      const level = /^h[1-6]$/.test(node.tag ?? "")
        ? Number((node.tag ?? "h2").slice(1))
        : 2;
      const text = collectText(node).trim();
      const id = slugifyHeading(text);

      if (text) {
        headings.push({ depth: level, id, text });
      }

      return `<h${level}>${children}</h${level}>`;
    }
    case "quote":
      return `<blockquote>${children}</blockquote>`;
    case "list":
      return node.listType === "number"
        ? `<ol>${children}</ol>`
        : `<ul>${children}</ul>`;
    case "listitem":
      return `<li>${children}</li>`;
    case "code":
      return `<pre><code>${children}</code></pre>`;
    case "horizontalrule":
      return "<hr>";
    case "link":
    case "autolink":
      return `<a href="${escapeHtml(String(node.url))}">${children}</a>`;
    case "image":
      return `<img src="${escapeHtml(String(node.src))}" alt="${escapeHtml(
        String(node.altText ?? ""),
      )}">`;
    case "table":
      return `<table><tbody>${children}</tbody></table>`;
    case "tablerow":
      return `<tr>${children}</tr>`;
    case "tablecell": {
      const tag = Number(node.headerState ?? 0) > 0 ? "th" : "td";

      return `<${tag}>${children}</${tag}>`;
    }
    default:
      return children;
  }
}

@Injectable()
export class RichTextRendererService {
  async render(document: LexicalEditorState): Promise<RenderedRichText> {
    const root = document?.root;

    if (!root || root.type !== "root") {
      throw new Error("RICH_TEXT_DOCUMENT_INVALID");
    }

    validateSource(root);
    const tableOfContents: RichTextHeading[] = [];
    const unsafeHtml = renderNode(root, tableOfContents);
    const html = String(
      await unified()
        .use(rehypeParse, { fragment: true })
        .use(rehypeSanitize)
        .use(rehypeSlug)
        .use(rehypeStringify)
        .process(unsafeHtml),
    );

    return {
      html,
      tableOfContents,
      text: collectText(root).replace(/\s+/g, " ").trim(),
    };
  }
}
