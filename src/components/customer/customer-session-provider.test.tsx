import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  CustomerSessionProvider,
  useCustomerSession,
} from "./customer-session-provider";

const { session } = vi.hoisted(() => ({
  session: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => window.location.pathname,
}));

vi.mock("@/lib/commerce/customer-api", () => ({
  customerApi: {
    logout: vi.fn(),
    session,
  },
}));

function SessionProbe() {
  const { loading, user } = useCustomerSession();

  if (loading) {
    return <p>Loading</p>;
  }

  return <p>{user?.email ?? "Signed out"}</p>;
}

describe("CustomerSessionProvider", () => {
  beforeEach(() => {
    session.mockReset();
  });

  it("hydrates a safe customer profile on a non-account route", async () => {
    window.history.replaceState({}, "", "/dang-nhap");
    session.mockResolvedValue({
      user: {
        displayName: "Nguyen Van A",
        email: "customer@example.vn",
        id: "customer-1",
        phone: null,
        roles: ["customer"],
      },
    });

    render(
      <CustomerSessionProvider>
        <SessionProbe />
      </CustomerSessionProvider>,
    );

    expect(await screen.findByText("customer@example.vn")).toBeInTheDocument();
  });

  it("keeps an anonymous visitor signed out without a profile error", async () => {
    window.history.replaceState({}, "", "/dang-nhap");
    session.mockResolvedValue({ user: null });

    render(
      <CustomerSessionProvider>
        <SessionProbe />
      </CustomerSessionProvider>,
    );

    expect(await screen.findByText("Signed out")).toBeInTheDocument();
  });
});
