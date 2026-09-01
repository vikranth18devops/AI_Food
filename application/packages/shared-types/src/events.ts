import { EventType, AnalysisStatus } from './enums';
import { FoodRecognitionResult, NutritionFactsDto, HealthAnalysisDto, YouTubeVideoDto } from './dtos';

export interface BaseEventPayload {
  correlationId: string;
  analysisId: string;
  userId: string;
  timestamp: string;
}

export interface FoodAnalysisRequestedEvent extends BaseEventPayload {
  imageId: string;
  imageUrl: string;
}

export interface FoodRecognizedEvent extends BaseEventPayload {
  recognition: FoodRecognitionResult;
}

export interface NutritionCompletedEvent extends BaseEventPayload {
  foodName: string;
  ingredients: string[];
  nutrition: NutritionFactsDto;
}

export interface HealthAnalysisCompletedEvent extends BaseEventPayload {
  healthAnalysis: HealthAnalysisDto;
}

export interface RecommendationsCompletedEvent extends BaseEventPayload {
  videos: YouTubeVideoDto[];
}

export interface FoodAnalysisFailedEvent extends BaseEventPayload {
  failedStage: AnalysisStatus;
  errorMessage: string;
}
