import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { StructuredLogger } from '@foodlens/shared-utils';

async function bootstrap() {
  const logger = new StructuredLogger('auth-service');
  const app = await NestFactory.create(AppModule);
  
  const port = process.env.PORT || 3001;
  await app.listen(port);
  logger.info(`Auth Service is running on port ${port}`);
}
bootstrap();
