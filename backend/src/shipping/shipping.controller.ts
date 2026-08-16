import { Body, Controller, Post } from "@nestjs/common";
import { EstimateShippingDto } from "./dto/estimate-shipping.dto";
import { ShippingService } from "./shipping.service";

@Controller("shipping")
export class ShippingController {
  constructor(private readonly shippingService: ShippingService) {}

  @Post("estimate")
  estimate(@Body() input: EstimateShippingDto) {
    return this.shippingService.estimate(input);
  }
}
