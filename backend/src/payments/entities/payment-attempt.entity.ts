import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { bigintVndTransformer } from "../../common/money/bigint-vnd.transformer";
import { Order } from "../../orders/entities/order.entity";

export enum PaymentProvider {
  PAYOS = "payos",
  VNPAY = "vnpay",
}

export enum PaymentStatus {
  FAILED = "failed",
  PAID = "paid",
  PENDING = "pending",
}

@Entity("payment_attempts")
export class PaymentAttempt {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  orderId!: string;

  @Column({ type: "enum", enum: PaymentProvider })
  provider!: PaymentProvider;

  @Column({ type: "bigint", unsigned: true, transformer: bigintVndTransformer })
  providerOrderCode!: number;

  @Column({ type: "enum", enum: PaymentStatus, default: PaymentStatus.PENDING })
  status!: PaymentStatus;

  @Column({ type: "bigint", unsigned: true, transformer: bigintVndTransformer })
  amountVnd!: number;

  @Column({ type: "text", nullable: true })
  checkoutUrl!: string | null;

  @Column({ type: "varchar", nullable: true })
  providerReference!: string | null;

  @Column({ type: "timestamp", nullable: true })
  paidAt!: Date | null;

  @Column({ type: "varchar", nullable: true })
  refundReference!: string | null;

  @Column({ type: "timestamp", nullable: true })
  refundedAt!: Date | null;

  @ManyToOne(() => Order, (order) => order.payments, { onDelete: "CASCADE" })
  @JoinColumn({ name: "orderId" })
  order!: Order;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
