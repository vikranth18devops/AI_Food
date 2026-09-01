import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { StructuredLogger } from '@foodlens/shared-utils';

async function bootstrap() {
  const logger = new StructuredLogger('recommendation-service');
  const app = await NestFactory.create(AppModule);

  const port = process.env.PORT || 3006;
  await app.listen(port);
  logger.info(`Recommendation Service is running on port ${port}`);
}
bootstrap();
