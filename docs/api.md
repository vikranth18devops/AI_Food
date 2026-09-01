# Public API Overview (API Gateway)

Base URL: `http://localhost:3000/api/v1`
Interactive Swagger Documentation: `http://localhost:3000/api/docs`

## 1. Authentication Endpoints
- `POST /auth/register`: Create a new user account.
- `POST /auth/login`: Authenticate credentials & receive JWT access + refresh tokens.
- `POST /auth/refresh`: Refresh expired access token.
- `POST /auth/logout`: Revoke active refresh token.
- `GET /auth/me`: Get current authenticated user profile.

## 2. Food Analysis Endpoints
- `POST /food/analyze`: Upload image file (`multipart/form-data`) & trigger async event workflow.
- `GET /food/analysis/:id`: Retrieve complete analysis result by ID. Accepts `?servingGrams=350` to dynamically recalculate macronutrient values.
- `GET /food/history`: Retrieve paginated list of past user analyses (`?page=1&limit=10`).
- `DELETE /food/analysis/:id`: Delete a food analysis record by ID.
- `GET /food/analysis/:id/status`: Real-time status update stream (`?sse=true` for Server-Sent Events).
- `GET /food/analysis/:id/videos`: Retrieve recommended YouTube videos for an analysis.
- `GET /health`: Overall system and database health check.
