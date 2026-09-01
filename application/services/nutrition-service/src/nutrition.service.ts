import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { RabbitMQService } from './rabbitmq.service';
import { RedisService } from './redis.service';
import { MockNutritionProvider } from './providers/mock-nutrition.provider';
import { ExternalNutritionProvider } from './providers/external-nutrition.provider';
import { loadAppConfig } from '@foodlens/shared-config';
import { StructuredLogger } from '@foodlens/shared-utils';
import { AnalysisStatus, EventType, FoodRecognizedEvent, NutritionCompletedEvent, NutritionFactsDto } from '@foodlens/shared-types';

@Injectable()
export class NutritionService implements OnModuleInit {
  private logger = new StructuredLogger('nutrition-service');
  private config = loadAppConfig();

  constructor(
    private prisma: PrismaService,
    private rabbitmq: RabbitMQService,
    private redis: RedisService,
    private mockProvider: MockNutritionProvider,
    private externalProvider: ExternalNutritionProvider
  ) {}

  async onModuleInit() {
    this.rabbitmq.consume(async msg => {
      const payload: FoodRecognizedEvent = JSON.parse(msg.content.toString());
      this.logger.info(`Received event FOOD_RECOGNIZED for analysis ${payload.analysisId}`, { correlationId: payload.correlationId });
      await this.processNutritionLookup(payload);
    });
  }

  async processNutritionLookup(payload: FoodRecognizedEvent) {
    const { analysisId, userId, correlationId, recognition } = payload;

    // Idempotency check: if NutritionFacts already exists for this identified food, skip
    const identifiedFood = await this.prisma.identifiedFood.findUnique({
      where: { analysisId },
      include: { nutritionFacts: true },
    });

    if (!identifiedFood) {
      this.logger.error(`IdentifiedFood record missing for analysis ${analysisId}`, { correlationId });
      return;
    }

    if (identifiedFood.nutritionFacts) {
      this.logger.info(`Nutrition facts already stored for analysis ${analysisId}. Skipping.`, { correlationId });
      return;
    }

    // Update status to NUTRITION
    await this.prisma.foodAnalysis.update({
      where: { id: analysisId },
      data: { status: AnalysisStatus.NUTRITION },
    });

    try {
      const cacheKey = `nutrition:${recognition.foodName.toLowerCase().replace(/\s+/g, '_')}`;
      let facts: NutritionFactsDto | null = await this.redis.get<NutritionFactsDto>(cacheKey);

      if (facts) {
        this.logger.info(`Nutrition facts retrieved from Redis cache [${cacheKey}]`, { correlationId });
      } else {
        const provider = this.config.mockExternalServices ? this.mockProvider : this.externalProvider;
        this.logger.info(`Fetching nutrition facts using ${this.config.mockExternalServices ? 'MockProvider' : 'ExternalProvider'}`, { correlationId });
        facts = await provider.getNutrition(recognition.foodName, recognition.ingredients);
        await this.redis.set(cacheKey, facts, 86400); // 24h TTL
      }

      // Save NutritionFacts to PostgreSQL
      await this.prisma.nutritionFacts.create({
        data: {
          identifiedFoodId: identifiedFood.id,
          baseServingSize: facts.servingSize || '100g',
          calories: facts.calories,
          protein: facts.protein,
          carbohydrates: facts.carbohydrates,
          fat: facts.fat,
          saturatedFat: facts.saturatedFat,
          fiber: facts.fiber,
          sugar: facts.sugar,
          sodium: facts.sodium,
          source: facts.source,
          sourceUrl: facts.sourceUrl,
        },
      });

      const eventData: NutritionCompletedEvent = {
        correlationId,
        analysisId,
        userId,
        timestamp: new Date().toISOString(),
        foodName: recognition.foodName,
        ingredients: recognition.ingredients,
        nutrition: facts,
      };

      await this.prisma.analysisEvent.create({
        data: {
          analysisId,
          eventType: EventType.NUTRITION_COMPLETED,
          stage: AnalysisStatus.NUTRITION,
          payload: eventData as any,
          correlationId,
        },
      });

      // Publish NUTRITION_COMPLETED to RabbitMQ
      await this.rabbitmq.publishEvent(EventType.NUTRITION_COMPLETED, eventData);
      this.logger.info(`Published event NUTRITION_COMPLETED for analysis ${analysisId}`, { correlationId });
    } catch (err: any) {
      this.logger.error(`Nutrition lookup failed for analysis ${analysisId}`, err, { correlationId });
      await this.prisma.foodAnalysis.update({
        where: { id: analysisId },
        data: {
          status: AnalysisStatus.FAILED,
          errorMessage: `Nutrition lookup failed: ${err.message || 'Unknown error'}`,
        },
      });
    }
  }
}
