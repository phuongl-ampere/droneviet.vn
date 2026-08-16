import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MarkdownDocument } from "./markdown-document";

describe("MarkdownDocument", () => {
  it("renders safe Markdown structure without rendering raw HTML", () => {
    render(
      <MarkdownDocument
        content={`# Drone STEM

Học với [giáo trình](https://droneviet.vn/giao-trinh).

- Lập trình
- An toàn bay

<script>alert("xss")</script>`}
      />,
    );

    expect(
      screen.getByRole("heading", { name: "Drone STEM", level: 1 }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "giáo trình" })).toHaveAttribute(
      "href",
      "https://droneviet.vn/giao-trinh",
    );
    expect(screen.getByText("Lập trình")).toBeInTheDocument();
    expect(document.querySelector("script")).not.toBeInTheDocument();
  });
});
