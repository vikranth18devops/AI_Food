# RabbitMQ Event Flow Specification

All events are published to topic exchange `foodlens.events` with correlation IDs. Dead letter queue exchange `foodlens.dlx` handles failed processing retries.

| Event Type | Producer | Consumer | Payload Highlights |
| :--- | :--- | :--- | :--- |
| `FOOD_ANALYSIS_REQUESTED` | API Gateway | Food Recognition Service | `analysisId`, `userId`, `imageId`, `imageUrl`, `correlationId` |
| `FOOD_RECOGNIZED` | Food Recognition Service | Nutrition Service | `analysisId`, `recognition: { foodName, confidence, ingredients }` |
| `NUTRITION_COMPLETED` | Nutrition Service | Health Analysis Service | `analysisId`, `foodName`, `nutrition: { calories, protein, carbs... }` |
| `HEALTH_ANALYSIS_COMPLETED` | Health Analysis Service | Recommendation Service | `analysisId`, `healthAnalysis: { benefits, concerns, pros, cons... }` |
| `RECOMMENDATIONS_COMPLETED` | Recommendation Service | API Gateway / Client SSE | `analysisId`, `videos: [...]` |
| `FOOD_ANALYSIS_COMPLETED` | Recommendation Service | Event Bus / SSE | `analysisId`, `status: COMPLETED` |
| `FOOD_ANALYSIS_FAILED` | Any Service | Event Bus / Client SSE | `analysisId`, `failedStage`, `errorMessage` |
