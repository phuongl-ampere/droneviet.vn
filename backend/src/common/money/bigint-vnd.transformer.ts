import { ValueTransformer } from "typeorm";

export const bigintVndTransformer: ValueTransformer = {
  from(value: string | number | null): number | null {
    if (value === null) {
      return null;
    }

    const parsed = Number(value);
    if (!Number.isSafeInteger(parsed)) {
      throw new Error("VND amount exceeds JavaScript safe integer range");
    }

    return parsed;
  },
  to(value: number | null): string | null {
    if (value === null) {
      return null;
    }

    if (!Number.isSafeInteger(value) || value < 0) {
      throw new Error("VND amount must be a non-negative safe integer");
    }

    return String(value);
  },
};
