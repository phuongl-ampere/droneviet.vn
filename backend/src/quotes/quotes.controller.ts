import { Body, Controller, Post } from "@nestjs/common";
import { CreateQuoteRequestDto } from "./dto/create-quote-request.dto";
import { QuotesService } from "./quotes.service";

@Controller("quotes")
export class QuotesController {
  constructor(private readonly quotesService: QuotesService) {}

  @Post()
  create(@Body() input: CreateQuoteRequestDto) {
    return this.quotesService.createRequest(input);
  }
}
