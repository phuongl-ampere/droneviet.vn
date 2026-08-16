import { Injectable } from "@nestjs/common";

@Injectable()
export class AppService {
  health() {
    return {
      service: "droneviet-commerce-api",
      status: "ok",
    };
  }
}
