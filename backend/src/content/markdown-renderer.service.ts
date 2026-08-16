import { Injectable } from "@nestjs/common";
import { toString } from "mdast-util-to-string";
import rehypeSanitize from "rehype-sanitize";
import rehypeSlug from "rehype-slug";
import rehypeStringify from "rehype-stringify";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";
import { visit } from "unist-util-visit";

export interface MarkdownHeading {
  depth: number;
  id: string;
  text: string;
}

export interface RenderedMarkdown {
  html: string;
  tableOfContents: MarkdownHeading[];
}

function slugifyHeading(text: string): string {
  return text
    .normalize("NFKD")
    .replace(/\p{Diacritic}/gu, "")
    .toLocaleLowerCase()
    .replace(/[^\p{Letter}\p{Number}]+/gu, "-")
    .replace(/(^-|-$)/g, "");
}

@Injectable()
export class MarkdownRendererService {
  async render(markdown: string): Promise<RenderedMarkdown> {
    const markdownTree = unified().use(remarkParse).parse(markdown);
    const tableOfContents: MarkdownHeading[] = [];

    visit(markdownTree, "heading", (node) => {
      const text = toString(node).trim();

      if (text) {
        tableOfContents.push({
          depth: node.depth,
          id: slugifyHeading(text),
          text,
        });
      }
    });

    const html = String(
      await unified()
        .use(remarkParse)
        .use(remarkRehype)
        .use(rehypeSlug)
        .use(rehypeSanitize)
        .use(rehypeStringify)
        .process(markdown),
    );

    return { html, tableOfContents };
  }
}
