import { NutritionFactsDto } from '@foodlens/shared-types';

export interface NutritionProvider {
  getNutrition(foodName: string, ingredients: string[]): Promise<NutritionFactsDto>;
}
