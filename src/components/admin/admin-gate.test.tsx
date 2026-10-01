import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { I18nProvider } from "@/components/i18n-provider";
import { AdminGate } from "./admin-gate";

vi.mock("./admin-workbench", () => ({
  AdminWorkbench: () => <div>Admin workbench</div>,
}));

vi.mock("@/lib/commerce/admin-api", () => ({
  loginAdmin: vi.fn(),
}));

describe("AdminGate", () => {
  it("uses POST for the non-JavaScript login fallback", () => {
    render(
      <I18nProvider locale="vi">
        <AdminGate />
      </I18nProvider>,
    );

    expect(
      screen.getByRole("button", { name: "Đăng nhập" }).closest("form"),
    ).toHaveAttribute("method", "post");
  });
});
