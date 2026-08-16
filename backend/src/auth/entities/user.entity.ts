import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

export enum UserRole {
  CATALOG_MANAGER = "catalog_manager",
  CUSTOMER = "customer",
  INSTRUCTOR = "instructor",
  OPERATIONS = "operations",
  SALES = "sales",
  SUPER_ADMIN = "super_admin",
  SUPPORT = "support",
}

@Entity("users")
export class User {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  passwordHash!: string;

  @Column({ type: "json" })
  roles!: UserRole[];

  @Column({ type: "varchar", nullable: true })
  displayName!: string | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
