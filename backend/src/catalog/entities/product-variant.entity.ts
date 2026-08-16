import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Product } from "./product.entity";
import { InventoryItem } from "../../inventory/entities/inventory-item.entity";
import { bigintVndTransformer } from "../../common/money/bigint-vnd.transformer";

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

  @Column({ type: "bigint", unsigned: true, transformer: bigintVndTransformer })
  priceVnd!: number;

  @Column({
    type: "bigint",
    unsigned: true,
    nullable: true,
    transformer: bigintVndTransformer,
  })
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

  @OneToOne(() => InventoryItem, (inventory) => inventory.productVariant)
  inventory!: InventoryItem | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
