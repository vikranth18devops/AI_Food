import { Injectable } from '@nestjs/common';
import { NutritionProvider } from './nutrition.provider.interface';
import { NutritionFactsDto } from '@foodlens/shared-types';
import { loadAppConfig } from '@foodlens/shared-config';
import { StructuredLogger } from '@foodlens/shared-utils';
import axios from 'axios';

@Injectable()
export class ExternalNutritionProvider implements NutritionProvider {
  private logger = new StructuredLogger('nutrition-service:external-provider');
  private config = loadAppConfig();

  async getNutrition(foodName: string, ingredients: string[]): Promise<NutritionFactsDto> {
    const apiKey = this.config.nutritionApiKey;
    if (!apiKey) {
      this.logger.warn('NUTRITION_API_KEY is missing. Falling back to default provider.');
      throw new Error('NUTRITION_API_KEY environment variable missing');
    }

    try {
      this.logger.info(`Fetching external nutrition facts for: ${foodName}`);

      // Example USDA FoodData Central Search API
      const response = await axios.get('https://api.nal.usda.gov/fdc/v1/foods/search', {
        params: {
          api_key: apiKey,
          query: foodName,
          pageSize: 1,
        },
        timeout: 10000,
      });

      const item = response.data?.foods?.[0];
      if (!item) {
        throw new Error(`No nutrition data found for dish: ${foodName}`);
      }

      const getNutrient = (id: number): number | null => {
        const found = item.foodNutrients?.find((n: any) => n.nutrientId === id);
        return found && typeof found.value === 'number' ? Math.round(found.value * 10) / 10 : null;
      };

      return {
        servingSize: '100g',
        calories: getNutrient(1008), // Energy in kcal
        protein: getNutrient(1003), // Protein in g
        carbohydrates: getNutrient(1005), // Carbs in g
        fat: getNutrient(1004), // Total lipid fat in g
        saturatedFat: getNutrient(1258),
        fiber: getNutrient(1079), // Fiber in g
        sugar: getNutrient(2000), // Sugar in g
        sodium: getNutrient(1093), // Sodium in mg
        source: 'USDA FoodData Central API',
        sourceUrl: `https://fdc.nal.usda.gov/fdc-app.html#/food-details/${item.fdcId}/nutrients`,
      };
    } catch (err: any) {
      this.logger.error('External Nutrition Lookup failed', err);
      throw err;
    }
  }
}
