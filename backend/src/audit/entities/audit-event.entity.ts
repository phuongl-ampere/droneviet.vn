import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("audit_events")
export class AuditEvent {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", nullable: true })
  actorId!: string | null;

  @Column()
  action!: string;

  @Column()
  aggregateType!: string;

  @Column()
  aggregateId!: string;

  @Column({ type: "json", nullable: true })
  previousState!: Record<string, unknown> | null;

  @Column({ type: "json" })
  nextState!: Record<string, unknown>;

  @CreateDateColumn()
  createdAt!: Date;
}
