# PostgreSQL Entity Relationships & Schema Summary

```
User (1) ──── (1) UserProfile
User (1) ──── (*) RefreshToken
User (1) ──── (*) FoodImage ──── (1) FoodAnalysis

FoodAnalysis (1) ──── (1) IdentifiedFood ──── (*) Ingredient
IdentifiedFood (1) ──── (1) NutritionFacts

FoodAnalysis (1) ──── (1) HealthAnalysis ──── (*) HealthClaim ──── (*) Source
FoodAnalysis (1) ──── (*) YouTubeVideo
FoodAnalysis (1) ──── (*) AnalysisEvent
```

## Key Entities:
- `users`: Account identities & password hashes.
- `user_profiles`: User dietary preferences & allergies.
- `food_images`: Image upload metadata & file URLs.
- `food_analyses`: Root analysis record tracking workflow status (`PENDING` -> `COMPLETED`).
- `identified_foods`: Recognized dish name & confidence score.
- `ingredients`: Dish ingredient breakdown.
- `nutrition_facts`: Reference 100g base macronutrient and micronutrient metrics.
- `health_analysis`: Pros, cons, benefits, concerns, dietary compatibility flags, allergen alerts.
- `health_claims` & `sources`: Factual claim assertions & external reference URLs.
- `youtube_videos`: Curated culinary & nutrition YouTube video links.
- `analysis_events`: Audit trail for idempotent event processing.
