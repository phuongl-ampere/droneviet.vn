import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Order } from "./order.entity";
import { bigintVndTransformer } from "../../common/money/bigint-vnd.transformer";

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

  @Column({ type: "bigint", unsigned: true, transformer: bigintVndTransformer })
  unitPriceVnd!: number;

  @Column({ type: "int", unsigned: true })
  quantity!: number;

  @Column({ type: "bigint", unsigned: true, transformer: bigintVndTransformer })
  subtotalVnd!: number;

  @ManyToOne(() => Order, (order) => order.lines, { onDelete: "CASCADE" })
  @JoinColumn({ name: "orderId" })
  order!: Order;

  @CreateDateColumn()
  createdAt!: Date;
}
