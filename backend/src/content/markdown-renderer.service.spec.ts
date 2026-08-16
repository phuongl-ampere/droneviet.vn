import { describe, expect, it } from "vitest";
import { MarkdownRendererService } from "./markdown-renderer.service";

describe("MarkdownRendererService", () => {
  it("renders safe Markdown while removing scripts and unsafe links", async () => {
    const renderer = new MarkdownRendererService();

    const result = await renderer.render(`
# Drone STEM

Học với [giáo trình](https://droneviet.vn/giao-trinh).

<script>alert("xss")</script>

[unsafe](javascript:alert("xss"))
`);

    expect(result.html).toContain("Drone STEM");
    expect(result.html).toContain('href="https://droneviet.vn/giao-trinh"');
    expect(result.html).not.toContain("<script");
    expect(result.html).not.toContain("javascript:");
    expect(result.tableOfContents).toEqual([
      { depth: 1, id: "drone-stem", text: "Drone STEM" },
    ]);
  });
});
