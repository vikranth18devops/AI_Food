import { HealthAnalysisDto, NutritionFactsDto } from '@foodlens/shared-types';

export interface HealthAnalysisProvider {
  analyzeHealth(foodName: string, ingredients: string[], nutrition: NutritionFactsDto): Promise<HealthAnalysisDto>;
}
