import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import cookieParser from "cookie-parser";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  const corsOrigin = process.env.CORS_ORIGIN?.split(",").map((origin) =>
    origin.trim(),
  );

  app.enableCors({
    credentials: true,
    origin: corsOrigin?.length ? corsOrigin : false,
  });
  app.useGlobalPipes(
    new ValidationPipe({
      forbidNonWhitelisted: true,
      transform: true,
      whitelist: true,
    }),
  );

  if (process.env.NODE_ENV !== "production") {
    const swaggerConfig = new DocumentBuilder()
      .setTitle("Drone Viet Commerce API")
      .setVersion("1.0")
      .build();
    SwaggerModule.setup("api", app, SwaggerModule.createDocument(app, swaggerConfig));
  }

  await app.listen(Number(process.env.PORT ?? 4000));
}

void bootstrap();
