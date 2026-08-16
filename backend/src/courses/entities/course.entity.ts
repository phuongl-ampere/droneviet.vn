import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { CourseSession } from "./course-session.entity";

export enum CoursePurchaseMode {
  CHECKOUT = "checkout",
  QUOTE_ONLY = "quote_only",
}

@Entity("courses")
export class Course {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ unique: true })
  slug!: string;

  @Column({ length: 16 })
  locale!: string;

  @Column()
  title!: string;

  @Column({ type: "text" })
  summary!: string;

  @Column({ type: "enum", enum: CoursePurchaseMode })
  purchaseMode!: CoursePurchaseMode;

  @Column({ type: "bigint", unsigned: true, nullable: true })
  tuitionVnd!: number | null;

  @OneToMany(() => CourseSession, (session) => session.course)
  sessions!: CourseSession[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
