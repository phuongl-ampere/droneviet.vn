export const ARTICLE_EDITOR_MODES = ["markdown", "rich_text"] as const;

export type ArticleEditorMode = (typeof ARTICLE_EDITOR_MODES)[number];
export type LexicalArticleState = {
  root: Record<string, unknown>;
};

export function createEmptyRichTextDocument(): LexicalArticleState {
  return {
    root: {
      children: [
        {
          children: [],
          direction: null,
          format: "",
          indent: 0,
          type: "paragraph",
          version: 1,
        },
      ],
      direction: null,
      format: "",
      indent: 0,
      type: "root",
      version: 1,
    },
  };
}

function nodeHasText(node: {
  children?: Array<unknown>;
  text?: unknown;
  type?: unknown;
}): boolean {
  if (typeof node.text === "string" && node.text.trim()) {
    return true;
  }

  if (node.type && node.type !== "root" && node.type !== "paragraph") {
    return true;
  }

  return Array.isArray(node.children)
    ? node.children.some(
        (child) =>
          typeof child === "object" &&
          child !== null &&
          nodeHasText(child as typeof node),
      )
    : false;
}

export function isRichTextDocumentEmpty(
  document: LexicalArticleState | Record<string, unknown> | null | undefined,
): boolean {
  const root =
    document && typeof document === "object" && "root" in document
      ? document.root
      : undefined;

  return !(
    root &&
    typeof root === "object" &&
    Array.isArray((root as { children?: unknown }).children) &&
    (root as { children: Array<unknown> }).children.some(
      (child) =>
        typeof child === "object" &&
        child !== null &&
        nodeHasText(child as { children?: Array<unknown>; text?: unknown; type?: unknown }),
    )
  );
}
