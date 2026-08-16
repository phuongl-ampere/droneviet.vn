import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { EntityManager, Repository } from "typeorm";
import { AuditEvent } from "./entities/audit-event.entity";

export interface RecordAuditEventInput {
  action: string;
  actorId?: string;
  aggregateId: string;
  aggregateType: string;
  nextState: Record<string, unknown>;
  previousState?: Record<string, unknown>;
}

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditEvent)
    private readonly auditRepository: Repository<AuditEvent>,
  ) {}

  record(input: RecordAuditEventInput): Promise<AuditEvent> {
    return this.auditRepository.save(
      this.auditRepository.create({
        action: input.action,
        actorId: input.actorId ?? null,
        aggregateId: input.aggregateId,
        aggregateType: input.aggregateType,
        nextState: input.nextState,
        previousState: input.previousState ?? null,
      }),
    );
  }

  recordWithManager(
    manager: EntityManager,
    input: RecordAuditEventInput,
  ): Promise<AuditEvent> {
    const repository = manager.getRepository(AuditEvent);

    return repository.save(
      repository.create({
        action: input.action,
        actorId: input.actorId ?? null,
        aggregateId: input.aggregateId,
        aggregateType: input.aggregateType,
        nextState: input.nextState,
        previousState: input.previousState ?? null,
      }),
    );
  }
}
