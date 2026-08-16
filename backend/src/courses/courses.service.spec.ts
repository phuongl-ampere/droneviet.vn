import { describe, expect, it, vi } from "vitest";
import { CourseSessionStatus } from "./entities/course-session.entity";
import { CoursesService } from "./courses.service";

describe("CoursesService", () => {
  it("reserves a seat in an open course session inside a transaction", async () => {
    const sessionRepository = {
      createQueryBuilder: vi.fn(() => ({
        getOne: vi.fn().mockResolvedValue({
          capacity: 12,
          course: { productVariantId: "variant-course-g1" },
          id: "session-g1",
          reservedSeats: 7,
          status: CourseSessionStatus.OPEN,
        }),
        leftJoinAndSelect: vi.fn().mockReturnThis(),
        setLock: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
      })),
      save: vi.fn(),
    };
    const enrollmentRepository = {
      create: vi.fn((enrollment) => enrollment),
      save: vi.fn(async (enrollment) => ({ ...enrollment, id: "enrollment-1" })),
    };
    const manager = {
      getRepository: vi.fn((entity) =>
        entity.name === "CourseSession" ? sessionRepository : enrollmentRepository,
      ),
    };
    const dataSource = {
      transaction: vi.fn((callback) => callback(manager)),
    };
    const service = new CoursesService(dataSource as never);

    await expect(
      service.reserveEnrollment({
        contactEmail: "parent@example.vn",
        contactName: "Nguyen Van A",
        contactPhone: "0900000000",
        productVariantId: "variant-course-g1",
        quantity: 2,
        sessionId: "session-g1",
      }),
    ).resolves.toEqual(
      expect.objectContaining({
        id: "enrollment-1",
        quantity: 2,
      }),
    );
    expect(sessionRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({ reservedSeats: 9 }),
    );
  });

  it("releases confirmed course seats when operations cancels a paid order", async () => {
    const andWhere = vi.fn().mockReturnThis();
    const sessionRepository = { save: vi.fn() };
    const enrollmentRepository = {
      createQueryBuilder: vi.fn(() => ({
        andWhere,
        getMany: vi.fn().mockResolvedValue([
          {
            quantity: 2,
            session: { reservedSeats: 4 },
            status: "confirmed",
          },
        ]),
        leftJoinAndSelect: vi.fn().mockReturnThis(),
        setLock: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
      })),
      save: vi.fn(),
    };
    const manager = {
      getRepository: vi.fn((entity) =>
        entity.name === "CourseSession" ? sessionRepository : enrollmentRepository,
      ),
    };
    const service = new CoursesService({} as never);

    await service.releaseEnrollmentsForOrder(manager as never, "order-1");

    expect(andWhere).toHaveBeenCalledWith(
      "enrollment.status IN (:...statuses)",
      { statuses: ["reserved", "confirmed"] },
    );
    expect(sessionRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({ reservedSeats: 2 }),
    );
    expect(enrollmentRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({ status: "cancelled" }),
    );
  });
});
