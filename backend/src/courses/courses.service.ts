import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { CourseEnrollment } from "./entities/course-enrollment.entity";
import {
  CourseSession,
  CourseSessionStatus,
} from "./entities/course-session.entity";

export interface ReserveEnrollmentInput {
  contactEmail?: string;
  contactName: string;
  contactPhone: string;
  quantity: number;
  sessionId: string;
}

@Injectable()
export class CoursesService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async reserveEnrollment(
    input: ReserveEnrollmentInput,
  ): Promise<CourseEnrollment> {
    if (!Number.isInteger(input.quantity) || input.quantity < 1) {
      throw new BadRequestException("Quantity must be a positive integer");
    }

    return this.dataSource.transaction(async (manager) => {
      const sessionRepository = manager.getRepository(CourseSession);
      const session = await sessionRepository
        .createQueryBuilder("session")
        .where("session.id = :id", { id: input.sessionId })
        .setLock("pessimistic_write")
        .getOne();

      if (!session || session.status !== CourseSessionStatus.OPEN) {
        throw new NotFoundException("Course session is unavailable");
      }

      if (session.capacity - session.reservedSeats < input.quantity) {
        throw new BadRequestException("Course session no longer has enough seats");
      }

      session.reservedSeats += input.quantity;
      await sessionRepository.save(session);
      const enrollmentRepository = manager.getRepository(CourseEnrollment);

      return enrollmentRepository.save(
        enrollmentRepository.create({
          contactEmail: input.contactEmail ?? null,
          contactName: input.contactName,
          contactPhone: input.contactPhone,
          quantity: input.quantity,
          sessionId: session.id,
        }),
      );
    });
  }
}
