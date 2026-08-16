import { describe, expect, it, vi } from "vitest";
import { CourseSessionStatus } from "./entities/course-session.entity";
import { CoursesService } from "./courses.service";

describe("CoursesService", () => {
  it("reserves a seat in an open course session inside a transaction", async () => {
    const sessionRepository = {
      createQueryBuilder: vi.fn(() => ({
        getOne: vi.fn().mockResolvedValue({
          capacity: 12,
          id: "session-g1",
          reservedSeats: 7,
          status: CourseSessionStatus.OPEN,
        }),
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
});
