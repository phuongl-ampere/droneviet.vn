import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { OrderLine } from "./order-line.entity";
import { OrderStatus } from "../order-workflow";
import { bigintVndTransformer } from "../../common/money/bigint-vnd.transformer";
import { PaymentAttempt } from "../../payments/entities/payment-attempt.entity";

export enum OrderPaymentMethod {
  BANK_TRANSFER = "bank_transfer",
  COD = "cod",
  PAYOS = "payos",
}

@Entity("orders")
export class Order {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ unique: true })
  orderNumber!: string;

  @Column({
    type: "bigint",
    unsigned: true,
    unique: true,
    generated: "increment",
    transformer: bigintVndTransformer,
  })
  paymentOrderCode!: number;

  @Column({ type: "enum", enum: OrderStatus })
  status!: OrderStatus;

  @Column({ type: "enum", enum: OrderPaymentMethod })
  paymentMethod!: OrderPaymentMethod;

  @Column({ type: "bigint", unsigned: true, transformer: bigintVndTransformer })
  totalVnd!: number;

  @Column()
  contactName!: string;

  @Column()
  contactPhone!: string;

  @Column({ nullable: true })
  contactEmail!: string | null;

  @Column({ type: "text", nullable: true })
  shippingAddress!: string | null;

  @OneToMany(() => OrderLine, (line) => line.order)
  lines!: OrderLine[];

  @OneToMany(() => PaymentAttempt, (payment) => payment.order)
  payments!: PaymentAttempt[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
