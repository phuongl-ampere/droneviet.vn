import { Injectable, ServiceUnavailableException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { createHmac } from "node:crypto";

interface VnpayPaymentInput {
  amountVnd: number;
  ipAddress: string;
  orderInfo: string;
  transactionRef: string;
}

@Injectable()
export class VnpayService {
  constructor(private readonly config: ConfigService) {}

  createPaymentUrl(input: VnpayPaymentInput): string {
    const now = new Date();
    const parameters: Record<string, string> = {
      vnp_Amount: String(Math.round(input.amountVnd) * 100),
      vnp_Command: "pay",
      vnp_CreateDate: this.formatVietnamDate(now),
      vnp_CurrCode: "VND",
      vnp_ExpireDate: this.formatVietnamDate(
        new Date(now.getTime() + 15 * 60 * 1000),
      ),
      vnp_IpAddr: this.normalizeIp(input.ipAddress),
      vnp_Locale: "vn",
      vnp_OrderInfo: this.safeOrderInfo(input.orderInfo),
      vnp_OrderType: "other",
      vnp_ReturnUrl: this.required("VNPAY_RETURN_URL"),
      vnp_TmnCode: this.required("VNPAY_TMN_CODE"),
      vnp_TxnRef: input.transactionRef,
      vnp_Version: "2.1.0",
    };
    const query = this.buildQuery(parameters);
    const signature = createHmac("sha512", this.required("VNPAY_HASH_SECRET"))
      .update(Buffer.from(query, "utf8"))
      .digest("hex");
    const endpoint = this.config.get<string>(
      "VNPAY_URL",
      "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html",
    );

    return `${endpoint}?${query}&vnp_SecureHash=${signature}`;
  }

  verifyReturn(query: Record<string, string>): {
    amountVnd: number;
    isValid: boolean;
    responseCode: string;
    transactionRef: string;
  } {
    const secureHash = query.vnp_SecureHash?.toLowerCase() ?? "";
    const signedParameters = { ...query };
    delete signedParameters.vnp_SecureHash;
    delete signedParameters.vnp_SecureHashType;
    const expected = createHmac("sha512", this.required("VNPAY_HASH_SECRET"))
      .update(Buffer.from(this.buildQuery(signedParameters), "utf8"))
      .digest("hex")
      .toLowerCase();

    return {
      amountVnd: Math.round(Number(query.vnp_Amount ?? 0) / 100),
      isValid: secureHash === expected,
      responseCode: query.vnp_ResponseCode ?? "",
      transactionRef: query.vnp_TxnRef ?? "",
    };
  }

  private buildQuery(parameters: Record<string, string>): string {
    const search = new URLSearchParams();

    Object.keys(parameters)
      .sort()
      .filter((key) => parameters[key] !== "")
      .forEach((key) => search.append(key, parameters[key]));

    return search.toString();
  }

  private formatVietnamDate(value: Date): string {
    const vietnamTime = new Date(value.getTime() + 7 * 60 * 60 * 1000);
    const pad = (part: number) => String(part).padStart(2, "0");

    return (
      vietnamTime.getUTCFullYear().toString() +
      pad(vietnamTime.getUTCMonth() + 1) +
      pad(vietnamTime.getUTCDate()) +
      pad(vietnamTime.getUTCHours()) +
      pad(vietnamTime.getUTCMinutes()) +
      pad(vietnamTime.getUTCSeconds())
    );
  }

  private normalizeIp(value: string): string {
    if (value === "::1") {
      return "127.0.0.1";
    }

    return value.replace(/^::ffff:/, "");
  }

  private required(key: string): string {
    const value = this.config.get<string>(key, "").trim();

    if (!value) {
      throw new ServiceUnavailableException(`${key} is not configured`);
    }

    return value;
  }

  private safeOrderInfo(value: string): string {
    return value
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[đĐ]/g, "d")
      .replace(/[^a-zA-Z0-9 ]/g, "")
      .slice(0, 255);
  }
}
