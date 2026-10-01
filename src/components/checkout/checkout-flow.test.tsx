import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { I18nProvider } from "@/components/i18n-provider";
import { CartProvider } from "@/components/store/cart-provider";
import { CheckoutFlow } from "./checkout-flow";

const {
  estimateCheckoutShipping,
  fetchVnProvinces,
  fetchVnWards,
  replace,
  submitCheckout,
  useOptionalCustomerSession,
} = vi.hoisted(() => ({
  estimateCheckoutShipping: vi.fn(),
  fetchVnProvinces: vi.fn(),
  fetchVnWards: vi.fn(),
  replace: vi.fn(),
  submitCheckout: vi.fn(),
  useOptionalCustomerSession: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace }),
}));

vi.mock("@/components/customer/customer-session-provider", () => ({
  useOptionalCustomerSession,
}));

vi.mock("@/lib/commerce/checkout", () => ({
  estimateCheckoutShipping,
  submitCheckout,
}));

vi.mock("@/lib/commerce/vn-address", () => ({
  fetchVnProvinces,
  fetchVnWards,
}));

function renderCheckout() {
  return render(
    <I18nProvider locale="vi">
      <CartProvider
        initialLines={[
          {
            priceVnd: 9_500_000,
            quantity: 1,
            slug: "dv-primary-lab",
            title: "DV Primary Lab",
            variantId: "variant-primary-lab",
          },
        ]}
      >
        <CheckoutFlow />
      </CartProvider>
    </I18nProvider>,
  );
}

function fillDeliveryDetails() {
  fireEvent.change(screen.getByLabelText("Họ và tên"), {
    target: { value: "Nguyen Van A" },
  });
  fireEvent.change(screen.getByLabelText("Số điện thoại"), {
    target: { value: "0900000000" },
  });
  fireEvent.change(screen.getByLabelText("Địa chỉ chi tiết"), {
    target: { value: "1 Le Loi" },
  });
}

describe("CheckoutFlow", () => {
  beforeEach(() => {
    estimateCheckoutShipping.mockReset();
    estimateCheckoutShipping.mockResolvedValue({
      amountVnd: null,
      carrier: "manual",
      note: "Drone Viet will confirm delivery cost before fulfillment.",
      pricingStatus: "manual_quote",
    });
    fetchVnProvinces.mockReset();
    fetchVnProvinces.mockResolvedValue([
      { id: "79", name: "Hồ Chí Minh", slug: "ho-chi-minh-79" },
    ]);
    fetchVnWards.mockReset();
    fetchVnWards.mockResolvedValue([
      { id: "26740", name: "Phường Bến Nghé", slug: "phuong-ben-nghe" },
    ]);
    replace.mockReset();
    submitCheckout.mockReset();
    useOptionalCustomerSession.mockReturnValue(null);
  });

  it("starts at delivery, validates address fields, and progresses to shipping", async () => {
    renderCheckout();

    expect(
      screen.getByRole("heading", { name: "Thông tin nhận hàng" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "Giao hàng" }),
    ).not.toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Số điện thoại"), {
      target: { value: "123" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Tiếp tục" }));

    expect(screen.getByText("Nhập số điện thoại hợp lệ.")).toBeInTheDocument();

    fillDeliveryDetails();
    await waitFor(() => {
      expect(screen.getByLabelText("Tỉnh / thành phố")).not.toBeDisabled();
    });
    fireEvent.change(screen.getByLabelText("Tỉnh / thành phố"), {
      target: { value: "79" },
    });
    await waitFor(() => {
      expect(screen.getByLabelText("Phường / xã")).not.toBeDisabled();
    });
    fireEvent.change(screen.getByLabelText("Phường / xã"), {
      target: { value: "26740" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Tiếp tục" }));

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: "Giao hàng" }),
      ).toBeInTheDocument();
    });
    expect(
      screen.getByText(
        "Drone Việt liên hệ sau khi nhận đơn để xác nhận phương án giao và chi phí.",
      ),
    ).toBeInTheDocument();
    expect(estimateCheckoutShipping).toHaveBeenCalledWith(
      expect.objectContaining({ receiverProvince: "Hồ Chí Minh" }),
    );
    expect(fetchVnWards).toHaveBeenCalledWith("ho-chi-minh-79");
  });

  it("allows showroom pickup without collecting a delivery address", () => {
    renderCheckout();

    fireEvent.click(
      screen.getByRole("radio", { name: "Nhận tại showroom" }),
    );
    fireEvent.change(screen.getByLabelText("Họ và tên"), {
      target: { value: "Nguyen Van A" },
    });
    fireEvent.change(screen.getByLabelText("Số điện thoại"), {
      target: { value: "0900000000" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Tiếp tục" }));

    expect(
      screen.getByRole("heading", { name: "Giao hàng" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Miễn phí")).toBeInTheDocument();
  });

  it("does not serialize a localized address when showroom pickup is selected", async () => {
    submitCheckout.mockResolvedValue({
      order: { orderNumber: "DV-PICKUP01" },
    });
    renderCheckout();

    fireEvent.click(screen.getByText("Nhận tại showroom", { exact: true }));
    fireEvent.change(screen.getByLabelText("Họ và tên"), {
      target: { value: "Nguyen Van A" },
    });
    fireEvent.change(screen.getByLabelText("Số điện thoại"), {
      target: { value: "0900000000" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Tiếp tục" }));
    fireEvent.click(screen.getByRole("button", { name: "Tiếp tục" }));
    fireEvent.click(screen.getByRole("button", { name: "Đặt đơn hàng" }));

    await waitFor(() => {
      expect(submitCheckout).toHaveBeenCalledWith(
        expect.objectContaining({
          fulfillmentMethod: "showroom_pickup",
          shippingAddress: undefined,
        }),
      );
    });
  });

  it("prefills contact details for a signed-in customer without blocking guest checkout", async () => {
    const values = new Map<string, string>();
    const originalStorage = Object.getOwnPropertyDescriptor(
      window,
      "localStorage",
    );
    Object.defineProperty(window, "localStorage", {
      configurable: true,
      value: {
        clear: () => values.clear(),
        getItem: (key: string) => values.get(key) ?? null,
        key: (index: number) => [...values.keys()][index] ?? null,
        get length() {
          return values.size;
        },
        removeItem: (key: string) => values.delete(key),
        setItem: (key: string, value: string) => values.set(key, value),
      },
    });
    useOptionalCustomerSession.mockReturnValue({
      error: null,
      loading: false,
      logout: vi.fn(),
      refresh: vi.fn(),
      setUser: vi.fn(),
      user: {
        displayName: "Nguyen Van A",
        email: "customer@example.vn",
        id: "customer-1",
        phone: "0900000000",
        roles: ["customer"],
      },
    });
    try {
      renderCheckout();

      await waitFor(() => {
        expect(screen.getByLabelText("Họ và tên")).toHaveValue("Nguyen Van A");
        expect(screen.getByLabelText("Số điện thoại")).toHaveValue("0900000000");
        expect(screen.getByLabelText("Email")).toHaveValue(
          "customer@example.vn",
        );
      });
      expect(
        screen.getByLabelText("Lưu địa chỉ này trên thiết bị"),
      ).toBeInTheDocument();
    } finally {
      if (originalStorage) {
        Object.defineProperty(window, "localStorage", originalStorage);
      }
    }
  });

  it("shows review details and sends a COD order to the result route", async () => {
    submitCheckout.mockResolvedValue({
      order: { orderNumber: "DV-COD0001" },
    });
    renderCheckout();

    fillDeliveryDetails();
    await waitFor(() => {
      expect(screen.getByLabelText("Tỉnh / thành phố")).not.toBeDisabled();
    });
    fireEvent.change(screen.getByLabelText("Tỉnh / thành phố"), {
      target: { value: "79" },
    });
    await waitFor(() => {
      expect(screen.getByLabelText("Phường / xã")).not.toBeDisabled();
    });
    fireEvent.change(screen.getByLabelText("Phường / xã"), {
      target: { value: "26740" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Tiếp tục" }));
    await screen.findByRole("heading", { name: "Giao hàng" });
    fireEvent.click(screen.getByRole("button", { name: "Tiếp tục" }));

    expect(
      screen.getByRole("heading", { name: "Xác nhận & thanh toán" }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("PayOS")).toBeChecked();
    expect(screen.getByText("DV Primary Lab × 1")).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("radio", { name: "Thanh toán khi nhận hàng" }),
    );
    fireEvent.click(screen.getByRole("button", { name: "Đặt đơn hàng" }));

    await waitFor(() => {
      expect(submitCheckout).toHaveBeenCalledWith(
        expect.objectContaining({
          fulfillmentMethod: "delivery",
          paymentMethod: "cod",
          shippingAddress: "1 Le Loi, Phường Bến Nghé, Hồ Chí Minh",
        }),
      );
      expect(replace).toHaveBeenCalledWith(
        "/thanh-toan/ket-qua?order=DV-COD0001",
      );
    });
  });
});
