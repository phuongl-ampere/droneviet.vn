import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Course } from "./course.entity";
import { CourseEnrollment } from "./course-enrollment.entity";

export enum CourseSessionStatus {
  CLOSED = "closed",
  OPEN = "open",
}

@Entity("course_sessions")
export class CourseSession {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  courseId!: string;

  @Column({ type: "timestamp" })
  startsAt!: Date;

  @Column({ type: "int", unsigned: true })
  capacity!: number;

  @Column({ type: "int", unsigned: true, default: 0 })
  reservedSeats!: number;

  @Column({ type: "enum", enum: CourseSessionStatus })
  status!: CourseSessionStatus;

  @ManyToOne(() => Course, (course) => course.sessions, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "courseId" })
  course!: Course;

  @OneToMany(() => CourseEnrollment, (enrollment) => enrollment.session)
  enrollments!: CourseEnrollment[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
