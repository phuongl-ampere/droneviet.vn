import { describe, expect, it } from "vitest";
import {
  ARTICLE_EDITOR_MODES,
  createEmptyRichTextDocument,
  isRichTextDocumentEmpty,
} from "./article-editor";

describe("article editor helpers", () => {
  it("exposes the two independent authoring modes", () => {
    expect(ARTICLE_EDITOR_MODES).toEqual(["markdown", "rich_text"]);
  });

  it("distinguishes an empty Lexical editor state from meaningful content", () => {
    expect(isRichTextDocumentEmpty(createEmptyRichTextDocument())).toBe(true);
    expect(
      isRichTextDocumentEmpty({
        root: {
          children: [
            {
              children: [{ text: "Flight protocol", type: "text", version: 1 }],
              type: "paragraph",
              version: 1,
            },
          ],
          type: "root",
          version: 1,
        },
      }),
    ).toBe(false);
  });

  it("creates an empty Lexical editor state for visual editor source", () => {
    expect(createEmptyRichTextDocument()).toEqual(
      expect.objectContaining({
        root: expect.objectContaining({
          children: [expect.objectContaining({ type: "paragraph" })],
          type: "root",
        }),
      }),
    );
  });
});
