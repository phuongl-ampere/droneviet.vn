import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { LocaleToggle } from "./locale-toggle";

vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams(),
}));

describe("LocaleToggle", () => {
  it("renders one compact current-locale button with an English menu choice", () => {
    render(<LocaleToggle alternateHref="/en/store" locale="vi" />);

    expect(
      screen.getByRole("button", { name: "Ngôn ngữ: VI" }),
    ).toBeInTheDocument();
    const menu = screen.getByRole("menu", { name: "Ngôn ngữ" });

    expect(within(menu).getByText("VI")).toHaveAttribute(
      "aria-current",
      "true",
    );
    expect(
      within(menu).getByRole("menuitem", { name: "EN" }),
    ).toHaveAttribute("href", "/en/store");
  });
});
