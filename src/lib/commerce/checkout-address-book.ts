const storageKey = "droneviet.checkout.addresses.v1";

export type CheckoutAddress = {
  email: string;
  id: string;
  name: string;
  phone: string;
  province: string;
  streetAddress: string;
  ward: string;
};

export type CheckoutAddressInput = Omit<CheckoutAddress, "id"> & {
  id?: string;
};

function browserStorage(): Storage | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function isCheckoutAddress(value: unknown): value is CheckoutAddress {
  if (!value || typeof value !== "object") {
    return false;
  }

  return [
    "email",
    "id",
    "name",
    "phone",
    "province",
    "streetAddress",
    "ward",
  ].every(
    (key) =>
      key in value &&
      typeof value[key as keyof typeof value] === "string",
  );
}

function makeAddressId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `address-${Date.now()}`;
}

function writeCheckoutAddresses(addresses: CheckoutAddress[]): void {
  const storage = browserStorage();

  if (!storage) {
    return;
  }

  try {
    storage.setItem(storageKey, JSON.stringify(addresses));
  } catch {
    // A blocked or full browser storage must not stop checkout.
  }
}

export function loadCheckoutAddresses(): CheckoutAddress[] {
  const storage = browserStorage();

  if (!storage) {
    return [];
  }

  try {
    const raw = storage.getItem(storageKey);

    if (!raw) {
      return [];
    }

    const value: unknown = JSON.parse(raw);

    return Array.isArray(value) ? value.filter(isCheckoutAddress) : [];
  } catch {
    return [];
  }
}

export function saveCheckoutAddress(
  input: CheckoutAddressInput,
): CheckoutAddress[] {
  const address: CheckoutAddress = {
    ...input,
    id: input.id ?? makeAddressId(),
  };
  const nextAddresses = [
    address,
    ...loadCheckoutAddresses().filter(
      (current) => current.id !== address.id,
    ),
  ];

  writeCheckoutAddresses(nextAddresses);

  return nextAddresses;
}

export function removeCheckoutAddress(id: string): CheckoutAddress[] {
  const nextAddresses = loadCheckoutAddresses().filter(
    (address) => address.id !== id,
  );

  writeCheckoutAddresses(nextAddresses);

  return nextAddresses;
}
