import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Product } from "./product.entity";

export enum PurchaseMode {
  CHECKOUT = "checkout",
  PREORDER = "preorder",
  QUOTE_ONLY = "quote_only",
}

@Entity("product_variants")
export class ProductVariant {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  productId!: string;

  @Column({ unique: true })
  sku!: string;

  @Column()
  title!: string;

  @Column({ type: "int", unsigned: true })
  priceVnd!: number;

  @Column({ type: "int", unsigned: true, nullable: true })
  compareAtVnd!: number | null;

  @Column({ type: "enum", enum: PurchaseMode })
  purchaseMode!: PurchaseMode;

  @Column({ default: true })
  isActive!: boolean;

  @ManyToOne(() => Product, (product) => product.variants, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "productId" })
  product!: Product;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
