import { describe, expect, it } from "vitest";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";

describe("AppController", () => {
  it("reports the commerce API as healthy", () => {
    const controller = new AppController(new AppService());

    expect(controller.health()).toEqual({
      service: "droneviet-commerce-api",
      status: "ok",
    });
  });
});
