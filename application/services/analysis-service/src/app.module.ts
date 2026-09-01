import { Module } from '@nestjs/common';
import { AnalysisController } from './analysis.controller';
import { AnalysisService } from './analysis.service';
import { PrismaService } from './prisma.service';
import { RabbitMQService } from './rabbitmq.service';
import { MockHealthAnalysisProvider } from './providers/mock-health-analysis.provider';
import { AIHealthAnalysisProvider } from './providers/ai-health-analysis.provider';

@Module({
  controllers: [AnalysisController],
  providers: [
    AnalysisService,
    PrismaService,
    RabbitMQService,
    MockHealthAnalysisProvider,
    AIHealthAnalysisProvider,
  ],
})
export class AppModule {}
