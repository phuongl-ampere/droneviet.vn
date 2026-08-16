import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CreateQuoteRequestDto } from "./dto/create-quote-request.dto";
import { QuoteRequest, QuoteStatus } from "./entities/quote-request.entity";

@Injectable()
export class QuotesService {
  constructor(
    @InjectRepository(QuoteRequest)
    private readonly quoteRepository: Repository<QuoteRequest>,
  ) {}

  async createRequest(input: CreateQuoteRequestDto): Promise<QuoteRequest> {
    return this.quoteRepository.save(
      this.quoteRepository.create({
        budgetVnd: input.budgetVnd ?? null,
        contactName: input.contactName,
        email: input.email ?? null,
        organization: input.organization,
        phone: input.phone,
        quantity: input.quantity,
        requirements: input.requirements ?? null,
        status: QuoteStatus.NEW,
      }),
    );
  }
}
