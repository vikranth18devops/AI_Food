import { Injectable } from '@nestjs/common';
import { HealthAnalysisProvider } from './health-analysis.provider.interface';
import { HealthAnalysisDto, NutritionFactsDto, SourceType } from '@foodlens/shared-types';
import { loadAppConfig } from '@foodlens/shared-config';
import { StructuredLogger } from '@foodlens/shared-utils';
import axios from 'axios';

@Injectable()
export class AIHealthAnalysisProvider implements HealthAnalysisProvider {
  private logger = new StructuredLogger('analysis-service:ai-provider');
  private config = loadAppConfig();

  async analyzeHealth(foodName: string, ingredients: string[], nutrition: NutritionFactsDto): Promise<HealthAnalysisDto> {
    const apiKey = this.config.aiApiKey;
    if (!apiKey) {
      this.logger.warn('AI_API_KEY is missing. Falling back to default provider.');
      throw new Error('AI_API_KEY environment variable is missing');
    }

    try {
      this.logger.info(`Generating AI health analysis for dish: ${foodName}`);

      const prompt = `You are a nutrition and food science educator. Analyze this food based STRICTLY on the provided structured nutrition facts:
      Dish Name: ${foodName}
      Ingredients: ${ingredients.join(', ')}
      Nutrition Facts per 100g: Calories: ${nutrition.calories ?? 'N/A'}, Protein: ${nutrition.protein ?? 'N/A'}g, Carbs: ${nutrition.carbohydrates ?? 'N/A'}g, Fat: ${nutrition.fat ?? 'N/A'}g, Fiber: ${nutrition.fiber ?? 'N/A'}g, Sugar: ${nutrition.sugar ?? 'N/A'}g, Sodium: ${nutrition.sodium ?? 'N/A'}mg.

      IMPORTANT RULES:
      1. Do NOT invent new calories or macros. Interpret ONLY the given data.
      2. Do NOT provide medical diagnosis or treatment claims.
      3. Respond ONLY in valid JSON matching this schema:
      {
        "benefits": ["educational benefit 1", "benefit 2"],
        "concerns": ["concern 1"],
        "pros": ["pro 1", "pro 2"],
        "cons": ["con 1"],
        "allergens": ["allergen 1"],
        "dietaryCompatibility": [
          { "diet": "Vegetarian", "isCompatible": true, "reason": "reason" },
          { "diet": "Vegan", "isCompatible": false, "reason": "reason" },
          { "diet": "High Protein", "isCompatible": true, "reason": "reason" },
          { "diet": "Low Carb", "isCompatible": false, "reason": "reason" }
        ],
        "recommendations": ["rec 1", "rec 2"],
        "disclaimer": "Nutrition and health information is educational and may vary based on ingredients, recipe, preparation method, and portion size. It is not medical advice.",
        "claims": [
          {
            "claim": "Factual educational claim",
            "category": "BENEFIT",
            "sources": [
              {
                "name": "Source Name",
                "url": "https://www.dietaryguidelines.gov/",
                "sourceType": "HEALTH",
                "title": "Article Title"
              }
            ]
          }
        ]
      }`;

      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: prompt }],
          response_format: { type: 'json_object' },
          temperature: 0.3,
        },
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: 15000,
        }
      );

      const content = response.data?.choices?.[0]?.message?.content;
      if (!content) {
        throw new Error('Empty AI health analysis response');
      }

      const parsed = JSON.parse(content);
      return {
        benefits: Array.isArray(parsed.benefits) ? parsed.benefits : [],
        concerns: Array.isArray(parsed.concerns) ? parsed.concerns : [],
        pros: Array.isArray(parsed.pros) ? parsed.pros : [],
        cons: Array.isArray(parsed.cons) ? parsed.cons : [],
        allergens: Array.isArray(parsed.allergens) ? parsed.allergens : [],
        dietaryCompatibility: Array.isArray(parsed.dietaryCompatibility) ? parsed.dietaryCompatibility : [],
        recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations : [],
        disclaimer: parsed.disclaimer || 'Nutrition and health information is educational and not medical advice.',
        claims: Array.isArray(parsed.claims) ? parsed.claims : [],
      };
    } catch (err: any) {
      this.logger.error('AI Health Analysis failed', err);
      throw err;
    }
  }
}
