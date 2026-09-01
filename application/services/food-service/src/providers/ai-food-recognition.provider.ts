import { Injectable } from '@nestjs/common';
import { FoodRecognitionProvider } from './food-recognition.provider.interface';
import { FoodRecognitionResult } from '@foodlens/shared-types';
import { loadAppConfig } from '@foodlens/shared-config';
import { StructuredLogger } from '@foodlens/shared-utils';
import axios from 'axios';

@Injectable()
export class AIFoodRecognitionProvider implements FoodRecognitionProvider {
  private logger = new StructuredLogger('food-service:ai-provider');
  private config = loadAppConfig();

  async recognizeFood(imageUrl: string, imageId: string): Promise<FoodRecognitionResult> {
    const apiKey = this.config.aiApiKey;
    if (!apiKey) {
      this.logger.warn('AI_API_KEY missing. Falling back to structured response.');
      throw new Error('AI API Key is missing in environment variables');
    }

    try {
      this.logger.info(`Sending image to AI Vision Provider: ${this.config.aiProvider}`, { imageId });

      // Example OpenAI GPT-4o / Vision REST API call
      const prompt = `Analyze this food image and respond ONLY with a valid JSON object matching this schema:
      {
        "foodName": "Primary Dish Name",
        "confidence": 0.95,
        "possibleFoods": [
          { "name": "Primary Dish Name", "confidence": 0.95 },
          { "name": "Alternative Dish", "confidence": 0.05 }
        ],
        "ingredients": ["ingredient1", "ingredient2"]
      }`;

      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'user',
              content: [
                { type: 'text', text: prompt },
                { type: 'image_url', image_url: { url: imageUrl } },
              ],
            },
          ],
          response_format: { type: 'json_object' },
          temperature: 0.2,
        },
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: 15000, // 15s timeout
        }
      );

      const content = response.data?.choices?.[0]?.message?.content;
      if (!content) {
        throw new Error('Empty response received from AI Provider');
      }

      const parsed = JSON.parse(content);

      // Validate JSON structure
      if (!parsed.foodName || typeof parsed.confidence !== 'number' || !Array.isArray(parsed.ingredients)) {
        throw new Error('Malformed AI response schema');
      }

      return {
        foodName: parsed.foodName,
        confidence: Math.min(1.0, Math.max(0.0, parsed.confidence)),
        possibleFoods: Array.isArray(parsed.possibleFoods) ? parsed.possibleFoods : [{ name: parsed.foodName, confidence: parsed.confidence }],
        ingredients: parsed.ingredients.map((i: any) => String(i)),
      };
    } catch (err: any) {
      this.logger.error('AI Vision Recognition failed', err);
      throw err;
    }
  }
}
