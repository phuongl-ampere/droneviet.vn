import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

export enum PromoType {
  FIXED = "fixed",
  PERCENTAGE = "percentage",
}

@Entity("promo_codes")
export class PromoCode {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ unique: true })
  code!: string;

  @Column({ type: "enum", enum: PromoType })
  type!: PromoType;

  @Column({ type: "int", unsigned: true })
  value!: number;

  @Column({ type: "bigint", unsigned: true, nullable: true })
  minimumOrderVnd!: number | null;

  @Column({ type: "bigint", unsigned: true, nullable: true })
  maxDiscountVnd!: number | null;

  @Column({ type: "int", unsigned: true, nullable: true })
  usageLimit!: number | null;

  @Column({ type: "int", unsigned: true, default: 0 })
  usageCount!: number;

  @Column({ default: true })
  isActive!: boolean;

  @Column({ type: "timestamp", nullable: true })
  startsAt!: Date | null;

  @Column({ type: "timestamp", nullable: true })
  endsAt!: Date | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
