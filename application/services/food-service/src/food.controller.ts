import { Controller, Post, Body, Get } from '@nestjs/common';
import { FoodService } from './food.service';

@Controller('food')
export class FoodController {
  constructor(private readonly foodService: FoodService) {}

  @Post('recognize')
  async recognizeDirectly(@Body() payload: { analysisId: string; userId: string; imageId: string; imageUrl: string; correlationId: string }) {
    await this.foodService.processFoodRecognition(payload);
    return { success: true, message: 'Food recognition triggered' };
  }

  @Get('health')
  health() {
    return { status: 'OK', service: 'food-service', timestamp: new Date().toISOString() };
  }
}
