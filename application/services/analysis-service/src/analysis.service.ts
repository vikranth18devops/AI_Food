import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { RabbitMQService } from './rabbitmq.service';
import { MockHealthAnalysisProvider } from './providers/mock-health-analysis.provider';
import { AIHealthAnalysisProvider } from './providers/ai-health-analysis.provider';
import { loadAppConfig } from '@foodlens/shared-config';
import { StructuredLogger } from '@foodlens/shared-utils';
import { AnalysisStatus, EventType, NutritionCompletedEvent, HealthAnalysisCompletedEvent, SourceType } from '@foodlens/shared-types';

@Injectable()
export class AnalysisService implements OnModuleInit {
  private logger = new StructuredLogger('analysis-service');
  private config = loadAppConfig();

  constructor(
    private prisma: PrismaService,
    private rabbitmq: RabbitMQService,
    private mockProvider: MockHealthAnalysisProvider,
    private aiProvider: AIHealthAnalysisProvider
  ) {}

  async onModuleInit() {
    this.rabbitmq.consume(async msg => {
      const payload: NutritionCompletedEvent = JSON.parse(msg.content.toString());
      this.logger.info(`Received event NUTRITION_COMPLETED for analysis ${payload.analysisId}`, { correlationId: payload.correlationId });
      await this.processHealthAnalysis(payload);
    });
  }

  async processHealthAnalysis(payload: NutritionCompletedEvent) {
    const { analysisId, userId, correlationId, foodName, ingredients, nutrition } = payload;

    // Idempotency check
    const existingAnalysis = await this.prisma.healthAnalysis.findUnique({
      where: { analysisId },
    });

    if (existingAnalysis) {
      this.logger.info(`Health analysis already completed for analysis ${analysisId}. Skipping duplicate.`, { correlationId });
      return;
    }

    // Update status to HEALTH_ANALYSIS
    await this.prisma.foodAnalysis.update({
      where: { id: analysisId },
      data: { status: AnalysisStatus.HEALTH_ANALYSIS },
    });

    try {
      const provider = this.config.mockExternalServices ? this.mockProvider : this.aiProvider;
      this.logger.info(`Generating health analysis using ${this.config.mockExternalServices ? 'MockProvider' : 'AIProvider'}`, { correlationId });

      const healthResult = await provider.analyzeHealth(foodName, ingredients, nutrition);

      // Save HealthAnalysis, HealthClaims & Sources
      await this.prisma.healthAnalysis.create({
        data: {
          analysisId,
          benefits: healthResult.benefits,
          concerns: healthResult.concerns,
          pros: healthResult.pros,
          cons: healthResult.cons,
          allergens: healthResult.allergens,
          dietaryCompatibility: healthResult.dietaryCompatibility as any,
          recommendations: healthResult.recommendations,
          disclaimer: healthResult.disclaimer,
          claims: {
            create: (healthResult.claims || []).map(c => ({
              claim: c.claim,
              category: c.category || 'GENERAL',
              sources: {
                create: (c.sources || []).map(s => ({
                  name: s.name,
                  url: s.url,
                  sourceType: (s.sourceType as any) || SourceType.HEALTH,
                  title: s.title || s.name,
                })),
              },
            })),
          },
        },
      });

      const eventData: HealthAnalysisCompletedEvent = {
        correlationId,
        analysisId,
        userId,
        timestamp: new Date().toISOString(),
        healthAnalysis: healthResult,
      };

      await this.prisma.analysisEvent.create({
        data: {
          analysisId,
          eventType: EventType.HEALTH_ANALYSIS_COMPLETED,
          stage: AnalysisStatus.HEALTH_ANALYSIS,
          payload: eventData as any,
          correlationId,
        },
      });

      // Publish HEALTH_ANALYSIS_COMPLETED
      await this.rabbitmq.publishEvent(EventType.HEALTH_ANALYSIS_COMPLETED, eventData);
      this.logger.info(`Published event HEALTH_ANALYSIS_COMPLETED for analysis ${analysisId}`, { correlationId });
    } catch (err: any) {
      this.logger.error(`Health analysis failed for analysis ${analysisId}`, err, { correlationId });
      await this.prisma.foodAnalysis.update({
        where: { id: analysisId },
        data: {
          status: AnalysisStatus.FAILED,
          errorMessage: `Health analysis failed: ${err.message || 'Unknown error'}`,
        },
      });
    }
  }
}
