import { Body, Controller, Post } from "@nestjs/common";
import { OrderPaymentMethod } from "./entities/order.entity";
import { PaymentsService } from "../payments/payments.service";
import { CreateOrderDto } from "./dto/create-order.dto";
import { OrdersService } from "./orders.service";

@Controller("orders")
export class OrdersController {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly paymentsService: PaymentsService,
  ) {}

  @Post()
  async createOrder(@Body() input: CreateOrderDto) {
    const order = await this.ordersService.createOrder(input);

    if (order.paymentMethod === OrderPaymentMethod.PAYOS) {
      const payment = await this.paymentsService.createPayosCheckout(order);
      return { order, checkoutUrl: payment.checkoutUrl };
    }

    return { order };
  }
}
