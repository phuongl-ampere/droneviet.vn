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

  @Column({ type: "enum", enum: OrderStatus })
  status!: OrderStatus;

  @Column({ type: "enum", enum: OrderPaymentMethod })
  paymentMethod!: OrderPaymentMethod;

  @Column({ type: "int", unsigned: true })
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

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
