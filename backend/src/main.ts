import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = app.get(ConfigService);
  const allowedOrigins = '*';

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
  });

  await app.listen(3000);
}
bootstrap();
