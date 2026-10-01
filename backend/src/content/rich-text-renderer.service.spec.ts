import { describe, expect, it } from "vitest";
import { RichTextRendererService } from "./rich-text-renderer.service";

describe("RichTextRendererService", () => {
  it("renders allowed Lexical JSON and produces headings for the table of contents", async () => {
    const renderer = new RichTextRendererService();

    await expect(
      renderer.render({
        root: {
          children: [
            {
              children: [{ text: "Method", type: "text", version: 1 }],
              tag: "h2",
              type: "heading",
              version: 1,
            },
            {
              children: [
                {
                  text: "Repeatable flight protocol.",
                  type: "text",
                  version: 1,
                },
              ],
              type: "paragraph",
              version: 1,
            },
          ],
          type: "root",
          version: 1,
        },
      }),
    ).resolves.toEqual(
      expect.objectContaining({
        html: expect.stringContaining("<h2"),
        tableOfContents: [{ depth: 2, id: "method", text: "Method" }],
        text: "Method Repeatable flight protocol.",
      }),
    );
  });

  it("rejects remote images and non-http links before rendering", async () => {
    const renderer = new RichTextRendererService();

    await expect(
      renderer.render({
        root: {
          children: [
            {
              src: "https://untrusted.example/flight.png",
              type: "image",
              version: 1,
            },
          ],
          type: "root",
          version: 1,
        },
      }),
    ).rejects.toThrow("RICH_TEXT_IMAGE_URL_INVALID");
    await expect(
      renderer.render({
        root: {
          children: [
            {
              children: [
                {
                  children: [
                    { text: "Unsafe", type: "text", version: 1 },
                  ],
                  type: "link",
                  url: "javascript:alert(1)",
                  version: 1,
                },
              ],
              type: "paragraph",
              version: 1,
            },
          ],
          type: "root",
          version: 1,
        },
      }),
    ).rejects.toThrow("RICH_TEXT_LINK_URL_INVALID");
  });

  it("renders Lexical list JSON as safe public HTML", async () => {
    const renderer = new RichTextRendererService();

    await expect(
      renderer.render({
        root: {
          children: [
            {
              children: [{ text: "Flight checklist", type: "text", version: 1 }],
              tag: "h2",
              type: "heading",
              version: 1,
            },
            {
              children: [
                {
                  children: [
                    {
                      children: [
                        {
                          text: "Check battery before takeoff.",
                          type: "text",
                          version: 1,
                        },
                      ],
                      type: "paragraph",
                      version: 1,
                    },
                  ],
                  type: "listitem",
                  value: 1,
                  version: 1,
                },
              ],
              listType: "bullet",
              start: 1,
              tag: "ul",
              type: "list",
              version: 1,
            },
          ],
          type: "root",
          version: 1,
        },
      }),
    ).resolves.toEqual(
      expect.objectContaining({
        html: expect.stringContaining("<ul>"),
        tableOfContents: [
          { depth: 2, id: "flight-checklist", text: "Flight checklist" },
        ],
        text: "Flight checklist Check battery before takeoff.",
      }),
    );
  });

  it("renders Lexical tables, local images, and horizontal rules", async () => {
    const renderer = new RichTextRendererService();

    await expect(
      renderer.render({
        root: {
          children: [
            {
              altText: "Flight diagram",
              src: "/media/articles/2026/08/aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee.webp",
              type: "image",
              version: 1,
            },
            {
              children: [
                {
                  children: [
                    {
                      children: [
                        {
                          children: [
                            { text: "Mission", type: "text", version: 1 },
                          ],
                          type: "paragraph",
                          version: 1,
                        },
                      ],
                      headerState: 3,
                      type: "tablecell",
                      version: 1,
                    },
                    {
                      children: [
                        {
                          children: [
                            { text: "Survey", type: "text", version: 1 },
                          ],
                          type: "paragraph",
                          version: 1,
                        },
                      ],
                      headerState: 0,
                      type: "tablecell",
                      version: 1,
                    },
                  ],
                  type: "tablerow",
                  version: 1,
                },
              ],
              type: "table",
              version: 1,
            },
            { type: "horizontalrule", version: 1 },
          ],
          type: "root",
          version: 1,
        },
      }),
    ).resolves.toEqual(
      expect.objectContaining({
        html: expect.stringContaining("<table>"),
      }),
    );
  });
});
