import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as path from 'path';
import { loadAppConfig } from '@foodlens/shared-config';
import { StructuredLogger } from '@foodlens/shared-utils';

async function bootstrap() {
  const logger = new StructuredLogger('image-service');
  const config = loadAppConfig();
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  const uploadDir = path.resolve(config.storagePath || './uploads');
  app.useStaticAssets(uploadDir, { prefix: '/uploads/' });

  const port = process.env.PORT || 3002;
  await app.listen(port);
  logger.info(`Image Service running on port ${port}, serving files from ${uploadDir}`);
}
bootstrap();
