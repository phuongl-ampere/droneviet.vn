import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import TrackOrderPage from "./page";

describe("TrackOrderPage", () => {
  it("renders guest order tracking fields", () => {
    render(<TrackOrderPage />);

    expect(
      screen.getByRole("heading", { name: "Theo dõi đơn hàng" }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Mã đơn hàng")).toBeInTheDocument();
    expect(screen.getByLabelText("Số điện thoại")).toBeInTheDocument();
  });
});
