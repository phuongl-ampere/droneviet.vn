import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Order } from "./order.entity";

@Entity("order_lines")
export class OrderLine {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  orderId!: string;

  @Column()
  productVariantId!: string;

  @Column()
  sku!: string;

  @Column()
  title!: string;

  @Column({ type: "int", unsigned: true })
  unitPriceVnd!: number;

  @Column({ type: "int", unsigned: true })
  quantity!: number;

  @Column({ type: "int", unsigned: true })
  subtotalVnd!: number;

  @ManyToOne(() => Order, (order) => order.lines, { onDelete: "CASCADE" })
  @JoinColumn({ name: "orderId" })
  order!: Order;

  @CreateDateColumn()
  createdAt!: Date;
}
