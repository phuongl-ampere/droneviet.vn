import { Body, Controller, Post } from "@nestjs/common";
import { ReserveEnrollmentDto } from "./dto/reserve-enrollment.dto";
import { CoursesService } from "./courses.service";

@Controller("courses")
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Post("enrollments")
  reserveEnrollment(@Body() input: ReserveEnrollmentDto) {
    return this.coursesService.reserveEnrollment(input);
  }
}
