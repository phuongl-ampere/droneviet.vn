import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { Roles } from "../auth/roles.decorator";
import { RolesGuard } from "../auth/roles.guard";
import { UserRole } from "../auth/entities/user.entity";
import { TransitionOrderDto } from "./dto/transition-order.dto";
import { OrdersService } from "./orders.service";

@Controller("admin/orders")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN, UserRole.OPERATIONS)
export class AdminOrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  listOrders() {
    return this.ordersService.listForOperations();
  }

  @Post(":id/transition")
  transitionOrder(
    @Param("id") orderId: string,
    @Body() input: TransitionOrderDto,
    @Req() request: { user?: { sub?: string } },
  ) {
    return this.ordersService.transitionOrder({
      actorId: request.user?.sub,
      nextStatus: input.nextStatus,
      orderId,
      refundReference: input.refundReference,
    });
  }
}
