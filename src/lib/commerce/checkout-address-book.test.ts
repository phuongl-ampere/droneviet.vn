import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  loadCheckoutAddresses,
  removeCheckoutAddress,
  saveCheckoutAddress,
} from "./checkout-address-book";

describe("checkout address book", () => {
  let storage: Storage;

  beforeEach(() => {
    const values = new Map<string, string>();
    storage = {
      clear: () => values.clear(),
      getItem: (key) => values.get(key) ?? null,
      key: (index) => [...values.keys()][index] ?? null,
      get length() {
        return values.size;
      },
      removeItem: (key) => values.delete(key),
      setItem: (key, value) => values.set(key, value),
    };
    vi.stubGlobal("window", { localStorage: storage });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("keeps the most recently saved address first and replaces a matching id", () => {
    saveCheckoutAddress({
      email: "first@example.vn",
      id: "address-1",
      name: "First buyer",
      phone: "0900000000",
      province: "Ho Chi Minh City",
      streetAddress: "1 Le Loi",
      ward: "Ben Nghe",
    });
    saveCheckoutAddress({
      email: "latest@example.vn",
      id: "address-2",
      name: "Latest buyer",
      phone: "0911111111",
      province: "Ha Noi",
      streetAddress: "2 Trang Tien",
      ward: "Trang Tien",
    });
    saveCheckoutAddress({
      email: "updated@example.vn",
      id: "address-1",
      name: "Updated buyer",
      phone: "0900000000",
      province: "Ho Chi Minh City",
      streetAddress: "3 Le Loi",
      ward: "Ben Nghe",
    });

    expect(loadCheckoutAddresses()).toEqual([
      expect.objectContaining({
        email: "updated@example.vn",
        id: "address-1",
        streetAddress: "3 Le Loi",
      }),
      expect.objectContaining({ id: "address-2" }),
    ]);
  });

  it("removes only the requested saved address", () => {
    saveCheckoutAddress({
      email: "",
      id: "address-1",
      name: "First buyer",
      phone: "0900000000",
      province: "Ho Chi Minh City",
      streetAddress: "1 Le Loi",
      ward: "Ben Nghe",
    });
    saveCheckoutAddress({
      email: "",
      id: "address-2",
      name: "Second buyer",
      phone: "0911111111",
      province: "Ha Noi",
      streetAddress: "2 Trang Tien",
      ward: "Trang Tien",
    });

    removeCheckoutAddress("address-1");

    expect(loadCheckoutAddresses()).toEqual([
      expect.objectContaining({ id: "address-2" }),
    ]);
  });

  it("ignores malformed browser storage", () => {
    storage.setItem("droneviet.checkout.addresses.v1", "{");

    expect(loadCheckoutAddresses()).toEqual([]);
  });
});
