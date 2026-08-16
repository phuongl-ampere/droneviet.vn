import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AdminWorkbench } from "./admin-workbench";

describe("AdminWorkbench", () => {
  it("lets an operator edit product pricing and preview an article in Markdown", () => {
    render(<AdminWorkbench />);

    expect(
      screen.getByRole("heading", { name: "Admin vận hành" }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Giá VND")).toHaveValue(9_500_000);

    fireEvent.click(screen.getByRole("button", { name: "Bài viết" }));
    fireEvent.change(screen.getByLabelText("Nội dung Markdown"), {
      target: { value: "# Drone STEM\n\nNội dung khóa học." },
    });
    fireEvent.click(screen.getByRole("button", { name: "Xem trước" }));

    expect(
      screen.getByRole("heading", { name: "Drone STEM", level: 1 }),
    ).toBeInTheDocument();
  });
});
