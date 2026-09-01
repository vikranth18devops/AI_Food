import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { RabbitMQService } from './rabbitmq.service';
import { RedisService } from './redis.service';
import { MockYouTubeProvider } from './providers/mock-youtube.provider';
import { YouTubeApiProvider } from './providers/youtube-api.provider';
import { loadAppConfig } from '@foodlens/shared-config';
import { StructuredLogger } from '@foodlens/shared-utils';
import { AnalysisStatus, EventType, HealthAnalysisCompletedEvent, RecommendationsCompletedEvent, YouTubeVideoDto } from '@foodlens/shared-types';

@Injectable()
export class RecommendationService implements OnModuleInit {
  private logger = new StructuredLogger('recommendation-service');
  private config = loadAppConfig();

  constructor(
    private prisma: PrismaService,
    private rabbitmq: RabbitMQService,
    private redis: RedisService,
    private mockProvider: MockYouTubeProvider,
    private apiProvider: YouTubeApiProvider
  ) {}

  async onModuleInit() {
    this.rabbitmq.consume(async msg => {
      const payload: HealthAnalysisCompletedEvent = JSON.parse(msg.content.toString());
      this.logger.info(`Received event HEALTH_ANALYSIS_COMPLETED for analysis ${payload.analysisId}`, { correlationId: payload.correlationId });
      await this.processRecommendations(payload);
    });
  }

  async processRecommendations(payload: HealthAnalysisCompletedEvent) {
    const { analysisId, userId, correlationId } = payload;

    // Idempotency check: if videos already exist for this analysis, mark COMPLETED and return
    const existingVideos = await this.prisma.youTubeVideo.findMany({
      where: { analysisId },
    });

    if (existingVideos.length > 0) {
      this.logger.info(`YouTube recommendations already stored for analysis ${analysisId}. Skipping duplicate.`, { correlationId });
      await this.prisma.foodAnalysis.update({
        where: { id: analysisId },
        data: { status: AnalysisStatus.COMPLETED },
      });
      return;
    }

    // Update status to RECOMMENDATIONS
    await this.prisma.foodAnalysis.update({
      where: { id: analysisId },
      data: { status: AnalysisStatus.RECOMMENDATIONS },
    });

    try {
      const identifiedFood = await this.prisma.identifiedFood.findUnique({
        where: { analysisId },
      });

      const foodName = identifiedFood?.foodName || 'Healthy Dish';
      const cacheKey = `yt_videos:${foodName.toLowerCase().replace(/\s+/g, '_')}`;

      let videos: YouTubeVideoDto[] | null = await this.redis.get<YouTubeVideoDto[]>(cacheKey);

      if (videos) {
        this.logger.info(`Retrieved YouTube videos from Redis cache [${cacheKey}]`, { correlationId });
      } else {
        const provider = this.config.mockExternalServices ? this.mockProvider : this.apiProvider;
        this.logger.info(`Fetching YouTube recommendations using ${this.config.mockExternalServices ? 'MockProvider' : 'APIProvider'}`, { correlationId });
        
        try {
          videos = await provider.searchVideos(foodName, 3);
        } catch (apiErr: any) {
          this.logger.warn('YouTube API failed; falling back to MockYouTubeProvider', apiErr);
          videos = await this.mockProvider.searchVideos(foodName, 3);
        }

        await this.redis.set(cacheKey, videos, 86400);
      }

      // Save videos to PostgreSQL
      await this.prisma.youTubeVideo.createMany({
        data: (videos || []).map(v => ({
          analysisId,
          videoId: v.videoId,
          title: v.title,
          channelTitle: v.channelTitle,
          description: v.description,
          thumbnailUrl: v.thumbnailUrl,
          publishedAt: v.publishedAt,
          url: v.url,
        })),
      });

      // Update Analysis Status to COMPLETED!
      await this.prisma.foodAnalysis.update({
        where: { id: analysisId },
        data: { status: AnalysisStatus.COMPLETED },
      });

      const eventData: RecommendationsCompletedEvent = {
        correlationId,
        analysisId,
        userId,
        timestamp: new Date().toISOString(),
        videos: videos || [],
      };

      await this.prisma.analysisEvent.create({
        data: {
          analysisId,
          eventType: EventType.RECOMMENDATIONS_COMPLETED,
          stage: AnalysisStatus.COMPLETED,
          payload: eventData as any,
          correlationId,
        },
      });

      // Publish events
      await this.rabbitmq.publishEvent(EventType.RECOMMENDATIONS_COMPLETED, eventData);
      await this.rabbitmq.publishEvent(EventType.FOOD_ANALYSIS_COMPLETED, eventData);

      this.logger.info(`Analysis ${analysisId} FULLY COMPLETED!`, { correlationId, videoCount: videos?.length });
    } catch (err: any) {
      this.logger.error(`Recommendation processing failed for analysis ${analysisId}`, err, { correlationId });
      await this.prisma.foodAnalysis.update({
        where: { id: analysisId },
        data: {
          status: AnalysisStatus.FAILED,
          errorMessage: `Recommendation lookup failed: ${err.message || 'Unknown error'}`,
        },
      });
    }
  }
}
