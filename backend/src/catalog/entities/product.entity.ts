import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { ProductVariant } from "./product-variant.entity";

export enum ProductKind {
  ACCESSORY = "accessory",
  BUNDLE = "bundle",
  DRONE = "drone",
  EDUCATION_KIT = "education_kit",
}

export enum ProductStatus {
  ARCHIVED = "archived",
  DRAFT = "draft",
  PUBLISHED = "published",
}

@Entity("products")
export class Product {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ unique: true })
  slug!: string;

  @Column()
  name!: string;

  @Column({ type: "text" })
  summary!: string;

  @Column({ type: "enum", enum: ProductKind })
  kind!: ProductKind;

  @Column({ type: "enum", enum: ProductStatus, default: ProductStatus.DRAFT })
  status!: ProductStatus;

  @Column({ nullable: true })
  coverImageUrl!: string | null;

  @OneToMany(() => ProductVariant, (variant) => variant.product, {
    cascade: true,
  })
  variants!: ProductVariant[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
