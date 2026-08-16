import { Injectable } from "@nestjs/common";
import { EstimateShippingDto } from "./dto/estimate-shipping.dto";

export interface ShippingEstimate {
  amountVnd: number;
  carrier: "manual";
  note: string;
}

@Injectable()
export class ShippingService {
  async estimate(_: EstimateShippingDto): Promise<ShippingEstimate> {
    return {
      amountVnd: 0,
      carrier: "manual",
      note: "Drone Viet will confirm delivery cost before fulfillment.",
    };
  }
}
