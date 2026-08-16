import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { createDatabaseOptions } from "./data-source";

@Module({
  imports: [TypeOrmModule.forRoot(createDatabaseOptions(process.env))],
})
export class DatabaseModule {}
