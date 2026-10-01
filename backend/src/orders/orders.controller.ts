import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from "@nestjs/common";
import {
  AccessTokenPayload,
  JwtAuthGuard,
} from "../auth/jwt-auth.guard";
import { OptionalJwtAuthGuard } from "../auth/optional-jwt-auth.guard";
import { OrderPaymentMethod } from "./entities/order.entity";
import { PaymentsService } from "../payments/payments.service";
import { CreateOrderDto } from "./dto/create-order.dto";
import { ResumePaymentDto } from "./dto/resume-payment.dto";
import { OrdersService } from "./orders.service";

@Controller("orders")
export class OrdersController {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly paymentsService: PaymentsService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async createOrder(
    @Body() input: CreateOrderDto,
    @Req() request: { user: AccessTokenPayload },
  ) {
    const order = await this.ordersService.createOrder(input, request.user.sub);

    if (order.paymentMethod === OrderPaymentMethod.PAYOS) {
      const payment = await this.paymentsService.createPayosCheckout(order);
      return { order, checkoutUrl: payment.checkoutUrl };
    }

    return { order };
  }

  @Get("me")
  @UseGuards(JwtAuthGuard)
  listOwnOrders(@Req() request: { user: AccessTokenPayload }) {
    return this.ordersService.listForCustomer(request.user.sub);
  }

  @Post(":orderNumber/payment-resume")
  @UseGuards(OptionalJwtAuthGuard)
  async resumePayosPayment(
    @Param("orderNumber") orderNumber: string,
    @Body() input: ResumePaymentDto,
    @Req() request?: { user?: AccessTokenPayload },
  ) {
    const order = await this.ordersService.findForPaymentResume(
      orderNumber,
      input.phone,
      request?.user?.sub,
    );
    const payment = await this.paymentsService.resumePayosCheckout(order);

    return { checkoutUrl: payment.checkoutUrl };
  }

  @Get(":orderNumber")
  findOrder(
    @Param("orderNumber") orderNumber: string,
    @Query("phone") phone: string,
  ) {
    return this.ordersService.findOrderForContact(orderNumber, phone);
  }
}
