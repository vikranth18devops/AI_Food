import { Module } from '@nestjs/common';
import { NutritionController } from './nutrition.controller';
import { NutritionService } from './nutrition.service';
import { PrismaService } from './prisma.service';
import { RabbitMQService } from './rabbitmq.service';
import { RedisService } from './redis.service';
import { MockNutritionProvider } from './providers/mock-nutrition.provider';
import { ExternalNutritionProvider } from './providers/external-nutrition.provider';

@Module({
  controllers: [NutritionController],
  providers: [
    NutritionService,
    PrismaService,
    RabbitMQService,
    RedisService,
    MockNutritionProvider,
    ExternalNutritionProvider,
  ],
})
export class AppModule {}
