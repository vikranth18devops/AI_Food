import { Controller, Post, Body, Get } from '@nestjs/common';
import { NutritionService } from './nutrition.service';

@Controller('nutrition')
export class NutritionController {
  constructor(private readonly nutritionService: NutritionService) {}

  @Post('lookup')
  async lookupDirectly(@Body() payload: any) {
    await this.nutritionService.processNutritionLookup(payload);
    return { success: true, message: 'Nutrition lookup triggered' };
  }

  @Get('health')
  health() {
    return { status: 'OK', service: 'nutrition-service', timestamp: new Date().toISOString() };
  }
}
