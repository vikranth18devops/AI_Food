import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { StructuredLogger } from '@foodlens/shared-utils';

async function bootstrap() {
  const logger = new StructuredLogger('analysis-service');
  const app = await NestFactory.create(AppModule);

  const port = process.env.PORT || 3005;
  await app.listen(port);
  logger.info(`Health Analysis Service is running on port ${port}`);
}
bootstrap();
