import { Injectable } from '@nestjs/common';
import { HealthAnalysisProvider } from './health-analysis.provider.interface';
import { HealthAnalysisDto, NutritionFactsDto, SourceType } from '@foodlens/shared-types';

@Injectable()
export class MockHealthAnalysisProvider implements HealthAnalysisProvider {
  async analyzeHealth(foodName: string, ingredients: string[], nutrition: NutritionFactsDto): Promise<HealthAnalysisDto> {
    const isMeat = ingredients.some(i => /chicken|beef|pork|fish|salmon|meat|mutton/i.test(i)) || /chicken|beef|salmon|meat/i.test(foodName);
    const isDairy = ingredients.some(i => /cheese|milk|yogurt|butter|ghee|cream|feta/i.test(i)) || /cheese|pizza/i.test(foodName);
    const isHighProtein = (nutrition.protein || 0) >= 8;
    const isLowCarb = (nutrition.carbohydrates || 0) <= 10;

    return {
      benefits: [
        `Provides an abundant energy source with ~${nutrition.calories || 200} kcal per 100g base portion.`,
        `Contains ${ingredients.length} primary ingredients offering varied micronutrient profiles.`,
        isHighProtein ? 'Rich in dietary protein essential for muscle synthesis and metabolic repair.' : 'Balanced macronutrient density supporting daily metabolic functions.',
      ],
      concerns: [
        (nutrition.sodium || 0) > 400 ? 'Higher sodium concentration; monitor total daily sodium intake if managing hypertension.' : 'Moderate sodium concentration suitable for general populations.',
        (nutrition.fat || 0) > 10 ? 'Contains higher lipid content; consider portion size if adhering to low-fat dietary goals.' : 'Low to moderate lipid density.',
      ],
      pros: [
        isHighProtein ? 'High Quality Protein Source' : 'Nutrient-Dense Profile',
        'Complex Carbohydrates & Energy Support',
        'Rich Culinary Flavor Profile',
      ],
      cons: [
        (nutrition.calories || 0) > 200 ? 'Calorie Dense' : 'Moderate Energy Density',
        (nutrition.sodium || 0) > 400 ? 'Moderate to High Sodium' : 'Recipe-Dependent Sodium Variation',
      ],
      allergens: [
        ...(isDairy ? ['Dairy / Milk Derivatives'] : []),
        ...(ingredients.some(i => /wheat|crust|flour|gluten/i.test(i)) ? ['Gluten / Wheat'] : []),
        ...(ingredients.some(i => /soy|edamame/i.test(i)) ? ['Soybeans'] : []),
        ...(ingredients.some(i => /peanut|tree nut|sesame/i.test(i)) ? ['Nuts / Seeds'] : []),
      ],
      dietaryCompatibility: [
        { diet: 'Vegetarian', isCompatible: !isMeat, reason: isMeat ? `Contains ${foodName} meat components` : 'Vegetable & plant based composition' },
        { diet: 'Vegan', isCompatible: !isMeat && !isDairy, reason: isMeat || isDairy ? 'Contains animal or dairy ingredients' : 'Purely plant-derived ingredients' },
        { diet: 'High Protein', isCompatible: isHighProtein, reason: isHighProtein ? 'Delivers >= 8g protein per 100g' : 'Lower protein relative to carbohydrate content' },
        { diet: 'Low Carb', isCompatible: isLowCarb, reason: isLowCarb ? 'Carbohydrate content <= 10g per 100g' : 'Carbohydrate rich dish' },
      ],
      recommendations: [
        'Pair with fresh leafy greens or fibrous vegetables to enhance digestive speed and fiber intake.',
        'Adjust serving portion using the dynamic serving calculator to match exact daily caloric requirements.',
      ],
      disclaimer: 'Nutrition and health information is educational and may vary based on ingredients, recipe, preparation method, and portion size. It is not medical advice.',
      claims: [
        {
          claim: `Consuming whole-food ingredients like ${ingredients[0] || foodName} delivers essential macronutrients for daily metabolic support.`,
          category: 'BENEFIT',
          sources: [
            {
              name: 'USDA Dietary Guidelines for Americans',
              url: 'https://www.dietaryguidelines.gov/',
              sourceType: SourceType.NUTRITION,
              title: 'Nutritional Balance & Whole Food Consumption Principles',
            },
            {
              name: 'Harvard T.H. Chan School of Public Health',
              url: 'https://www.hsph.harvard.edu/nutritionsource/',
              sourceType: SourceType.HEALTH,
              title: 'The Nutrition Source - Macronutrients & Health',
            },
          ],
        },
      ],
    };
  }
}
