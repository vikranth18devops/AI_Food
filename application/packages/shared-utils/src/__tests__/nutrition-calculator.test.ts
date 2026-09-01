import { calculateNutritionForServingSize, parseBaseServingSizeInGrams } from '../nutrition-calculator';
import { NutritionFactsDto } from '@foodlens/shared-types';

describe('Nutrition Calculator', () => {
  const baseNutrition: NutritionFactsDto = {
    servingSize: '100g',
    calories: 200,
    protein: 10,
    carbohydrates: 25,
    fat: 6,
    saturatedFat: 2,
    fiber: 3,
    sugar: 4,
    sodium: 500,
    source: 'Test DB',
  };

  test('parseBaseServingSizeInGrams parses 100g correctly', () => {
    expect(parseBaseServingSizeInGrams('100g')).toBe(100);
    expect(parseBaseServingSizeInGrams('250 g')).toBe(250);
    expect(parseBaseServingSizeInGrams('invalid')).toBe(100);
  });

  test('calculateNutritionForServingSize scales nutrients linearly for 350g', () => {
    const result = calculateNutritionForServingSize(baseNutrition, 350);
    expect(result.servingSize).toBe('350g');
    expect(result.calories).toBe(700); // 200 * 3.5
    expect(result.protein).toBe(35); // 10 * 3.5
    expect(result.carbohydrates).toBe(87.5); // 25 * 3.5
    expect(result.fat).toBe(21); // 6 * 3.5
    expect(result.sodium).toBe(1750); // 500 * 3.5
  });

  test('handles null nutrient values without inventing numbers', () => {
    const incompleteNutrition: NutritionFactsDto = {
      servingSize: '100g',
      calories: 150,
      protein: null,
      carbohydrates: 20,
      fat: null,
      fiber: null,
      sugar: 2,
      sodium: null,
      source: 'Test DB',
    };

    const result = calculateNutritionForServingSize(incompleteNutrition, 200);
    expect(result.calories).toBe(300);
    expect(result.protein).toBeNull();
    expect(result.fat).toBeNull();
    expect(result.sodium).toBeNull();
  });
});
