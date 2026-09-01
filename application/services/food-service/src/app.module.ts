import { Module } from '@nestjs/common';
import { FoodController } from './food.controller';
import { FoodService } from './food.service';
import { PrismaService } from './prisma.service';
import { RabbitMQService } from './rabbitmq.service';
import { MockFoodRecognitionProvider } from './providers/mock-food-recognition.provider';
import { AIFoodRecognitionProvider } from './providers/ai-food-recognition.provider';

@Module({
  controllers: [FoodController],
  providers: [
    FoodService,
    PrismaService,
    RabbitMQService,
    MockFoodRecognitionProvider,
    AIFoodRecognitionProvider,
  ],
})
export class AppModule {}
