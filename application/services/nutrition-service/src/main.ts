import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { StructuredLogger } from '@foodlens/shared-utils';

async function bootstrap() {
  const logger = new StructuredLogger('nutrition-service');
  const app = await NestFactory.create(AppModule);

  const port = process.env.PORT || 3004;
  await app.listen(port);
  logger.info(`Nutrition Service is running on port ${port}`);
}
bootstrap();
