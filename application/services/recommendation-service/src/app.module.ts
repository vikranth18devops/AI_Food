import { Module } from '@nestjs/common';
import { RecommendationController } from './recommendation.controller';
import { RecommendationService } from './recommendation.service';
import { PrismaService } from './prisma.service';
import { RabbitMQService } from './rabbitmq.service';
import { RedisService } from './redis.service';
import { MockYouTubeProvider } from './providers/mock-youtube.provider';
import { YouTubeApiProvider } from './providers/youtube-api.provider';

@Module({
  controllers: [RecommendationController],
  providers: [
    RecommendationService,
    PrismaService,
    RabbitMQService,
    RedisService,
    MockYouTubeProvider,
    YouTubeApiProvider,
  ],
})
export class AppModule {}
