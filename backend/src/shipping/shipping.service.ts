import { Injectable } from "@nestjs/common";
import { EstimateShippingDto } from "./dto/estimate-shipping.dto";

export interface ShippingEstimate {
  amountVnd: null;
  carrier: "manual";
  note: string;
  pricingStatus: "manual_quote";
}

@Injectable()
export class ShippingService {
  async estimate(_: EstimateShippingDto): Promise<ShippingEstimate> {
    return {
      amountVnd: null,
      carrier: "manual",
      note: "Drone Viet will confirm delivery cost before fulfillment.",
      pricingStatus: "manual_quote",
    };
  }
}
