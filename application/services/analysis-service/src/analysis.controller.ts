import { Controller, Post, Body, Get } from '@nestjs/common';
import { AnalysisService } from './analysis.service';

@Controller('analysis')
export class AnalysisController {
  constructor(private readonly analysisService: AnalysisService) {}

  @Post('health')
  async analyzeDirectly(@Body() payload: any) {
    await this.analysisService.processHealthAnalysis(payload);
    return { success: true, message: 'Health analysis triggered' };
  }

  @Get('health')
  health() {
    return { status: 'OK', service: 'analysis-service', timestamp: new Date().toISOString() };
  }
}
