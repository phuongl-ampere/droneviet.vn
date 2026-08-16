import { Injectable, ServiceUnavailableException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { createHmac } from "node:crypto";

interface PayosPaymentLinkInput {
  amountVnd: number;
  buyerEmail?: string;
  buyerName?: string;
  buyerPhone?: string;
  description: string;
  orderCode: number;
}

interface PayosApiResponse {
  code: string;
  data?: { checkoutUrl?: string };
  desc?: string;
}

function safeTransferDescription(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[đĐ]/g, "d")
    .replace(/[^a-zA-Z0-9 ]/g, "")
    .trim()
    .slice(0, 25);
}

@Injectable()
export class PayosService {
  private readonly apiUrl = "https://api-merchant.payos.vn";

  constructor(private readonly config: ConfigService) {}

  async createPaymentLink({
    amountVnd,
    buyerEmail,
    buyerName,
    buyerPhone,
    description,
    orderCode,
  }: PayosPaymentLinkInput): Promise<string> {
    const clientId = this.required("PAYOS_CLIENT_ID");
    const apiKey = this.required("PAYOS_API_KEY");
    const amount = Math.round(amountVnd);
    const safeDescription = safeTransferDescription(description);
    const cancelUrl = this.required("PAYOS_CANCEL_URL");
    const returnUrl = this.required("PAYOS_RETURN_URL");
    const signData = [
      `amount=${amount}`,
      `cancelUrl=${cancelUrl}`,
      `description=${safeDescription}`,
      `orderCode=${orderCode}`,
      `returnUrl=${returnUrl}`,
    ].join("&");
    const body: Record<string, string | number> = {
      amount,
      cancelUrl,
      description: safeDescription,
      orderCode,
      returnUrl,
      signature: this.hmacSha256(signData),
    };

    if (buyerEmail) body.buyerEmail = buyerEmail;
    if (buyerName) body.buyerName = buyerName;
    if (buyerPhone) body.buyerPhone = buyerPhone;

    const response = await fetch(`${this.apiUrl}/v2/payment-requests`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "x-client-id": clientId,
      },
      body: JSON.stringify(body),
    });
    const payload = (await response.json()) as PayosApiResponse;

    if (!response.ok || payload.code !== "00" || !payload.data?.checkoutUrl) {
      throw new ServiceUnavailableException(
        `PayOS payment link failed: ${payload.desc ?? payload.code}`,
      );
    }

    return payload.data.checkoutUrl;
  }

  verifyWebhookSignature(
    data: Record<string, unknown>,
    signature: string,
  ): boolean {
    const signData = Object.keys(data)
      .sort()
      .filter((key) => {
        const value = data[key];
        return value !== null && value !== undefined && value !== "";
      })
      .map((key) => `${key}=${data[key]}`)
      .join("&");

    return this.hmacSha256(signData).toLowerCase() === signature.toLowerCase();
  }

  private hmacSha256(value: string): string {
    return createHmac("sha256", this.required("PAYOS_CHECKSUM_KEY"))
      .update(value)
      .digest("hex");
  }

  private required(key: string): string {
    const value = this.config.get<string>(key, "").trim();

    if (!value) {
      throw new ServiceUnavailableException(`${key} is not configured`);
    }

    return value;
  }
}
