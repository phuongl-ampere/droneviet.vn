import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import CourseCatalogPage from "./page";

describe("CourseCatalogPage", () => {
  it("lists purchasable course sessions and institutional routes", () => {
    render(<CourseCatalogPage />);

    expect(
      screen.getByRole("heading", { name: "Khóa học Drone Việt" }),
    ).toBeInTheDocument();
    expect(screen.getByText("8 buổi · Cấp 1")).toBeInTheDocument();
    expect(screen.getByText(/2\.400\.000\s*₫/)).toBeInTheDocument();
    expect(
      screen
        .getAllByRole("link", { name: "Xem syllabus" })
        .some(
          (link) =>
            link.getAttribute("href") === "/khoa-hoc/drone-ung-dung-dai-hoc",
        ),
    ).toBe(true);
  });
});
