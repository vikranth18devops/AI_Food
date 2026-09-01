import { Injectable } from '@nestjs/common';
import { NutritionProvider } from './nutrition.provider.interface';
import { NutritionFactsDto } from '@foodlens/shared-types';

@Injectable()
export class MockNutritionProvider implements NutritionProvider {
  private nutritionDb: Record<string, NutritionFactsDto> = {
    'chicken biryani': {
      servingSize: '100g',
      calories: 194.3,
      protein: 8.86,
      carbohydrates: 23.43,
      fat: 7.14,
      saturatedFat: 2.1,
      fiber: 1.14,
      sugar: 1.43,
      sodium: 262.8,
      source: 'USDA FoodData Central Mock Database',
      sourceUrl: 'https://fdc.nal.usda.gov/',
    },
    'mediterranean salad': {
      servingSize: '100g',
      calories: 112.0,
      protein: 3.2,
      carbohydrates: 6.8,
      fat: 8.4,
      saturatedFat: 2.5,
      fiber: 2.1,
      sugar: 3.4,
      sodium: 320.0,
      source: 'USDA FoodData Central Mock Database',
      sourceUrl: 'https://fdc.nal.usda.gov/',
    },
    'margherita pizza': {
      servingSize: '100g',
      calories: 254.0,
      protein: 11.2,
      carbohydrates: 31.8,
      fat: 9.4,
      saturatedFat: 4.1,
      fiber: 2.3,
      sugar: 3.1,
      sodium: 580.0,
      source: 'USDA FoodData Central Mock Database',
      sourceUrl: 'https://fdc.nal.usda.gov/',
    },
    'salmon avocado bowl': {
      servingSize: '100g',
      calories: 185.0,
      protein: 12.4,
      carbohydrates: 16.2,
      fat: 8.9,
      saturatedFat: 1.4,
      fiber: 2.8,
      sugar: 1.1,
      sodium: 190.0,
      source: 'USDA FoodData Central Mock Database',
      sourceUrl: 'https://fdc.nal.usda.gov/',
    },
  };

  async getNutrition(foodName: string, ingredients: string[]): Promise<NutritionFactsDto> {
    const key = foodName.toLowerCase().trim();
    if (this.nutritionDb[key]) {
      return this.nutritionDb[key];
    }

    // Generic realistic default for unrecognized dishes
    return {
      servingSize: '100g',
      calories: 165.0,
      protein: 7.5,
      carbohydrates: 20.0,
      fat: 6.0,
      saturatedFat: null, // Left as null per requirement 5
      fiber: 1.5,
      sugar: 2.0,
      sodium: 300.0,
      source: 'FoodLens Standard Reference Database',
      sourceUrl: 'https://fdc.nal.usda.gov/',
    };
  }
}
