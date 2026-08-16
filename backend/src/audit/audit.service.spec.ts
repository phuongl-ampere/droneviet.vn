import { describe, expect, it, vi } from "vitest";
import { AuditService } from "./audit.service";

describe("AuditService", () => {
  it("records a structured privileged mutation event", async () => {
    const repository = {
      create: vi.fn((event) => event),
      save: vi.fn(async (event) => ({ ...event, id: "audit-1" })),
    };
    const service = new AuditService(repository as never);

    await expect(
      service.record({
        action: "catalog.product.created",
        actorId: "admin-1",
        aggregateId: "product-1",
        aggregateType: "product",
        nextState: { status: "draft" },
      }),
    ).resolves.toEqual(
      expect.objectContaining({
        id: "audit-1",
      }),
    );
  });
});
