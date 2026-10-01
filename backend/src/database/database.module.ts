import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { createDatabaseOptions } from "./data-source";

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) =>
        createDatabaseOptions({
          ...process.env,
          DATABASE_HOST: config.get<string>("DATABASE_HOST"),
          DATABASE_NAME: config.get<string>("DATABASE_NAME"),
          DATABASE_PASSWORD: config.get<string>("DATABASE_PASSWORD"),
          DATABASE_PORT: config.get<string>("DATABASE_PORT"),
          DATABASE_USER: config.get<string>("DATABASE_USER"),
        }),
    }),
  ],
})
export class DatabaseModule {}
