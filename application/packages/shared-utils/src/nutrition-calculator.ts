import { NutritionFactsDto } from '@foodlens/shared-types';

export function parseBaseServingSizeInGrams(servingSizeStr: string): number {
  if (!servingSizeStr) return 100;
  const match = servingSizeStr.match(/(\d+(?:\.\d+)?)\s*g/i);
  if (match && match[1]) {
    const val = parseFloat(match[1]);
    return val > 0 ? val : 100;
  }
  return 100;
}

export function calculateNutritionForServingSize(
  baseNutrition: NutritionFactsDto,
  targetGrams: number
): NutritionFactsDto {
  if (!baseNutrition || targetGrams <= 0) {
    return baseNutrition;
  }

  const baseGrams = parseBaseServingSizeInGrams(baseNutrition.servingSize);
  const ratio = targetGrams / baseGrams;

  const scaleValue = (val: number | null | undefined): number | null => {
    if (val === null || val === undefined || isNaN(val)) return null;
    return Math.round(val * ratio * 10) / 10;
  };

  return {
    ...baseNutrition,
    servingSize: `${targetGrams}g`,
    calories: scaleValue(baseNutrition.calories),
    protein: scaleValue(baseNutrition.protein),
    carbohydrates: scaleValue(baseNutrition.carbohydrates),
    fat: scaleValue(baseNutrition.fat),
    saturatedFat: scaleValue(baseNutrition.saturatedFat),
    fiber: scaleValue(baseNutrition.fiber),
    sugar: scaleValue(baseNutrition.sugar),
    sodium: scaleValue(baseNutrition.sodium),
  };
}
