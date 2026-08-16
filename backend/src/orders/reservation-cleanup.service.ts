import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from "@nestjs/common";
import { OrdersService } from "./orders.service";

@Injectable()
export class ReservationCleanupService
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(ReservationCleanupService.name);
  private timer?: NodeJS.Timeout;

  constructor(private readonly ordersService: OrdersService) {}

  onModuleInit(): void {
    this.timer = setInterval(() => {
      void this.runOnce().catch((error: unknown) => {
        this.logger.error(
          error instanceof Error ? error.message : "Reservation cleanup failed",
        );
      });
    }, 60_000);
    this.timer.unref();
  }

  onModuleDestroy(): void {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }

  runOnce(): Promise<number> {
    return this.ordersService.releaseExpiredReservations();
  }
}
