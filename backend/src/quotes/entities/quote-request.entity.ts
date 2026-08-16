import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

export enum QuoteStatus {
  CONVERTED = "converted",
  LOST = "lost",
  NEW = "new",
  QUALIFIED = "qualified",
  SENT = "sent",
}

@Entity("quote_requests")
export class QuoteRequest {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  organization!: string;

  @Column()
  contactName!: string;

  @Column()
  phone!: string;

  @Column({ nullable: true })
  email!: string | null;

  @Column({ type: "int", unsigned: true, nullable: true })
  budgetVnd!: number | null;

  @Column({ type: "int", unsigned: true })
  quantity!: number;

  @Column({ type: "text", nullable: true })
  requirements!: string | null;

  @Column({ type: "enum", enum: QuoteStatus, default: QuoteStatus.NEW })
  status!: QuoteStatus;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
