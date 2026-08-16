import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import QuotePage from "./page";

describe("QuotePage", () => {
  it("renders a business quote form with product context", async () => {
    render(
      await QuotePage({
        searchParams: Promise.resolve({
          product: "dv-research-platform",
        }),
      }),
    );

    expect(
      screen.getByRole("heading", { name: "Yêu cầu báo giá" }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Đơn vị")).toBeInTheDocument();
    expect(screen.getByDisplayValue("DV Research Platform")).toBeInTheDocument();
  });
});
