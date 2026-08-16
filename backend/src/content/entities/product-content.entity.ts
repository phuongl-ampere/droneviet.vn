import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Product } from "../../catalog/entities/product.entity";

@Entity("product_content")
export class ProductContent {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  productId!: string;

  @Column({ length: 16 })
  locale!: string;

  @Column({ type: "longtext" })
  bodyMarkdown!: string;

  @Column({ type: "longtext" })
  renderedHtml!: string;

  @Column({ type: "json" })
  tableOfContents!: Array<{ depth: number; id: string; text: string }>;

  @ManyToOne(() => Product, { onDelete: "CASCADE" })
  @JoinColumn({ name: "productId" })
  product!: Product;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
