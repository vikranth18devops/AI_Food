import { Controller, Post, Body, Get } from '@nestjs/common';
import { RecommendationService } from './recommendation.service';

@Controller('recommendation')
export class RecommendationController {
  constructor(private readonly recService: RecommendationService) {}

  @Post('search')
  async searchDirectly(@Body() payload: any) {
    await this.recService.processRecommendations(payload);
    return { success: true, message: 'Recommendations triggered' };
  }

  @Get('health')
  health() {
    return { status: 'OK', service: 'recommendation-service', timestamp: new Date().toISOString() };
  }
}
