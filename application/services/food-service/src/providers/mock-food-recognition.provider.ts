import { Injectable } from '@nestjs/common';
import { FoodRecognitionProvider } from './food-recognition.provider.interface';
import { FoodRecognitionResult } from '@foodlens/shared-types';

@Injectable()
export class MockFoodRecognitionProvider implements FoodRecognitionProvider {
  private sampleDishes: FoodRecognitionResult[] = [
    {
      foodName: 'Chicken Biryani',
      confidence: 0.94,
      possibleFoods: [
        { name: 'Chicken Biryani', confidence: 0.94 },
        { name: 'Mutton Pulao', confidence: 0.04 },
        { name: 'Fried Rice', confidence: 0.02 },
      ],
      ingredients: ['Basmati Rice', 'Chicken Breast', 'Onion', 'Yogurt', 'Ghee & Spices'],
    },
    {
      foodName: 'Mediterranean Salad',
      confidence: 0.92,
      possibleFoods: [
        { name: 'Mediterranean Salad', confidence: 0.92 },
        { name: 'Greek Salad', confidence: 0.06 },
        { name: 'Caesar Salad', confidence: 0.02 },
      ],
      ingredients: ['Cucumbers', 'Cherry Tomatoes', 'Feta Cheese', 'Kalamata Olives', 'Olive Oil', 'Oregano'],
    },
    {
      foodName: 'Margherita Pizza',
      confidence: 0.96,
      possibleFoods: [
        { name: 'Margherita Pizza', confidence: 0.96 },
        { name: 'Cheese Pizza', confidence: 0.03 },
        { name: 'Neapolitan Pizza', confidence: 0.01 },
      ],
      ingredients: ['Wheat Crust', 'Mozzarella Cheese', 'San Marzano Tomato Sauce', 'Fresh Basil'],
    },
    {
      foodName: 'Salmon Avocado Bowl',
      confidence: 0.89,
      possibleFoods: [
        { name: 'Salmon Avocado Bowl', confidence: 0.89 },
        { name: 'Poke Bowl', confidence: 0.08 },
        { name: 'Sushi Bowl', confidence: 0.03 },
      ],
      ingredients: ['Grilled Salmon', 'Avocado', 'Brown Rice', 'Edamame', 'Sesame Seeds', 'Soy Sauce'],
    },
  ];

  async recognizeFood(imageUrl: string, imageId: string): Promise<FoodRecognitionResult> {
    // Deterministic selection based on imageId hash code
    let hash = 0;
    for (let i = 0; i < imageId.length; i++) {
      hash = (hash << 5) - hash + imageId.charCodeAt(i);
      hash |= 0;
    }
    const index = Math.abs(hash) % this.sampleDishes.length;
    return this.sampleDishes[index];
  }
}
