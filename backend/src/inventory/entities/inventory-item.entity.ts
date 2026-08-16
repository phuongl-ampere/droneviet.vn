import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { ProductVariant } from "../../catalog/entities/product-variant.entity";

@Entity("inventory_items")
export class InventoryItem {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ unique: true })
  productVariantId!: string;

  @Column({ type: "int", unsigned: true, default: 0 })
  onHand!: number;

  @Column({ type: "int", unsigned: true, default: 0 })
  reserved!: number;

  @OneToOne(() => ProductVariant, (variant) => variant.inventory, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "productVariantId" })
  productVariant!: ProductVariant;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
