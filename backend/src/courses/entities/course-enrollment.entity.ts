import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { CourseSession } from "./course-session.entity";

@Entity("course_enrollments")
export class CourseEnrollment {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  sessionId!: string;

  @Column({ nullable: true })
  orderId!: string | null;

  @Column()
  contactName!: string;

  @Column()
  contactPhone!: string;

  @Column({ nullable: true })
  contactEmail!: string | null;

  @Column({ type: "int", unsigned: true })
  quantity!: number;

  @Column({
    type: "enum",
    enum: ["reserved", "confirmed", "cancelled"],
    default: "reserved",
  })
  status!: "reserved" | "confirmed" | "cancelled";

  @ManyToOne(() => CourseSession, (session) => session.enrollments, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "sessionId" })
  session!: CourseSession;

  @CreateDateColumn()
  createdAt!: Date;
}
