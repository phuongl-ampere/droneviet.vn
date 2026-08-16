import { Body, Controller, Post } from "@nestjs/common";
import { PaymentsService } from "./payments.service";

@Controller("payments")
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post("payos-webhook")
  async payosWebhook(
    @Body()
    body: {
      data: {
        amount: number;
        id?: string;
        orderCode: number;
        status: string;
      };
      signature: string;
    },
  ) {
    return {
      success: await this.paymentsService.handlePayosWebhook(
        body.data,
        body.signature,
      ),
    };
  }
}
