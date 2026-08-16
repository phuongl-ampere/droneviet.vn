import { describe, expect, it, vi } from "vitest";
import { QuoteStatus } from "./entities/quote-request.entity";
import { QuotesService } from "./quotes.service";

describe("QuotesService", () => {
  it("records a school lab request as a new quote", async () => {
    const repository = {
      create: vi.fn((quote) => quote),
      save: vi.fn(async (quote) => ({ ...quote, id: "quote-1" })),
    };
    const service = new QuotesService(repository as never);

    await expect(
      service.createRequest({
        budgetVnd: 120_000_000,
        contactName: "Nguyen Van A",
        email: "lab@example.edu.vn",
        organization: "Truong THPT Drone Viet",
        phone: "0900000000",
        quantity: 10,
        requirements: "Phòng lab AI Vision",
      }),
    ).resolves.toEqual(
      expect.objectContaining({
        id: "quote-1",
        status: QuoteStatus.NEW,
      }),
    );
  });
});
