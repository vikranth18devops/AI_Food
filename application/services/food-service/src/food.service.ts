import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { RabbitMQService } from './rabbitmq.service';
import { MockFoodRecognitionProvider } from './providers/mock-food-recognition.provider';
import { AIFoodRecognitionProvider } from './providers/ai-food-recognition.provider';
import { loadAppConfig } from '@foodlens/shared-config';
import { StructuredLogger } from '@foodlens/shared-utils';
import { AnalysisStatus, EventType, FoodRecognizedEvent } from '@foodlens/shared-types';

@Injectable()
export class FoodService implements OnModuleInit {
  private logger = new StructuredLogger('food-service');
  private config = loadAppConfig();

  constructor(
    private prisma: PrismaService,
    private rabbitmq: RabbitMQService,
    private mockProvider: MockFoodRecognitionProvider,
    private aiProvider: AIFoodRecognitionProvider
  ) {}

  async onModuleInit() {
    this.rabbitmq.consume(async msg => {
      const payload = JSON.parse(msg.content.toString());
      this.logger.info(`Received event FOOD_ANALYSIS_REQUESTED for analysis ${payload.analysisId}`, { correlationId: payload.correlationId });
      await this.processFoodRecognition(payload);
    });
  }

  async processFoodRecognition(payload: { analysisId: string; userId: string; imageId: string; imageUrl: string; correlationId: string }) {
    const { analysisId, userId, imageId, imageUrl, correlationId } = payload;

    // Idempotency check
    const existingRecognition = await this.prisma.identifiedFood.findUnique({
      where: { analysisId },
    });

    if (existingRecognition) {
      this.logger.info(`Food recognition already completed for analysis ${analysisId}. Skipping duplicate work.`, { correlationId });
      return;
    }

    // Update status to FOOD_RECOGNITION
    await this.prisma.foodAnalysis.update({
      where: { id: analysisId },
      data: { status: AnalysisStatus.FOOD_RECOGNITION },
    });

    try {
      const provider = this.config.mockExternalServices ? this.mockProvider : this.aiProvider;
      this.logger.info(`Running food recognition using ${this.config.mockExternalServices ? 'MockProvider' : 'AIProvider'}`, { correlationId });

      const recognitionResult = await provider.recognizeFood(imageUrl, imageId);

      // Save IdentifiedFood & Ingredients
      await this.prisma.identifiedFood.create({
        data: {
          analysisId,
          foodName: recognitionResult.foodName,
          confidence: recognitionResult.confidence,
          possibleFoods: recognitionResult.possibleFoods as any,
          ingredients: {
            create: recognitionResult.ingredients.map(name => ({ name })),
          },
        },
      });

      // Record AnalysisEvent
      const eventData: FoodRecognizedEvent = {
        correlationId,
        analysisId,
        userId,
        timestamp: new Date().toISOString(),
        recognition: recognitionResult,
      };

      await this.prisma.analysisEvent.create({
        data: {
          analysisId,
          eventType: EventType.FOOD_RECOGNIZED,
          stage: AnalysisStatus.FOOD_RECOGNITION,
          payload: eventData as any,
          correlationId,
        },
      });

      // Publish FOOD_RECOGNIZED event to RabbitMQ
      await this.rabbitmq.publishEvent(EventType.FOOD_RECOGNIZED, eventData);
      this.logger.info(`Published event FOOD_RECOGNIZED for analysis ${analysisId}`, { correlationId, foodName: recognitionResult.foodName });
    } catch (err: any) {
      this.logger.error(`Food recognition failed for analysis ${analysisId}`, err, { correlationId });
      await this.prisma.foodAnalysis.update({
        where: { id: analysisId },
        data: {
          status: AnalysisStatus.FAILED,
          errorMessage: `Food recognition failed: ${err.message || 'Unknown error'}`,
        },
      });
    }
  }
}
