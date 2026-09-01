import { AnalysisStatus, SourceType } from './enums';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

export interface UserDto {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface PossibleFood {
  name: string;
  confidence: number;
}

export interface FoodRecognitionResult {
  foodName: string;
  confidence: number;
  possibleFoods: PossibleFood[];
  ingredients: string[];
}

export interface NutritionFactsDto {
  servingSize: string; // e.g. "100g"
  calories: number | null;
  protein: number | null; // grams
  carbohydrates: number | null; // grams
  fat: number | null; // grams
  saturatedFat?: number | null;
  fiber: number | null; // grams
  sugar: number | null; // grams
  sodium: number | null; // mg
  additionalNutrients?: Record<string, number | string>;
  source: string;
  sourceUrl?: string;
}

export interface SourceDto {
  id?: string;
  name: string;
  url: string;
  sourceType: SourceType;
  title: string;
  retrievedAt?: string;
}

export interface HealthClaimDto {
  id?: string;
  claim: string;
  category: 'BENEFIT' | 'CONCERN' | 'PRO' | 'CON' | 'GENERAL';
  sources: SourceDto[];
}

export interface HealthAnalysisDto {
  benefits: string[];
  concerns: string[];
  pros: string[];
  cons: string[];
  allergens: string[];
  dietaryCompatibility: Array<{
    diet: string;
    isCompatible: boolean;
    reason?: string;
  }>;
  recommendations: string[];
  claims: HealthClaimDto[];
  disclaimer: string;
}

export interface YouTubeVideoDto {
  videoId: string;
  title: string;
  channelTitle: string;
  description: string;
  thumbnailUrl: string;
  publishedAt: string;
  url: string;
}

export interface FoodAnalysisResultDto {
  id: string;
  userId: string;
  status: AnalysisStatus;
  imageUrl: string;
  imageId: string;
  createdAt: string;
  updatedAt: string;
  errorMessage?: string | null;
  identifiedFood?: FoodRecognitionResult | null;
  nutritionFacts?: NutritionFactsDto | null;
  healthAnalysis?: HealthAnalysisDto | null;
  youtubeVideos?: YouTubeVideoDto[] | null;
  servingSizeGrams?: number;
  calculatedNutrition?: NutritionFactsDto | null;
}
