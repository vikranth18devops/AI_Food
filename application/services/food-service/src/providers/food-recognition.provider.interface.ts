import { FoodRecognitionResult } from '@foodlens/shared-types';

export interface FoodRecognitionProvider {
  recognizeFood(imageUrl: string, imageId: string): Promise<FoodRecognitionResult>;
}
