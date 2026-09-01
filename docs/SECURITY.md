# FoodLens AI Security Policy & Guidelines

## 1. Overview
FoodLens AI is built with defense-in-depth security principles across all microservices, API interfaces, user data storage, and external AI/YouTube provider integrations.

---

## 2. Key Security Controls

### 2.1 API & Network Security
- **API Gateway Scoping**: All public requests MUST flow through `API Gateway` (`port 3000`). Internal microservices are isolated from public ingress.
- **Helmet Headers**: API Gateway enables Helmet HTTP headers (`X-Frame-Options`, `X-XSS-Protection`, `Content-Security-Policy`, `Strict-Transport-Security`).
- **Rate Limiting**: Throttler limit (100 requests / minute) enforced at Gateway level to prevent Brute-Force & Denial of Service attacks.
- **CORS Constraints**: Explicit domain origin restrictions applied in production.

### 2.2 Authentication & Secret Management
- **JWT Protection**: Short-lived Access Tokens (15 minutes) and revocable Refresh Tokens (7 days).
- **Password Hashing**: User passwords hashed using `bcrypt` (10 rounds). Password hashes are NEVER returned in API DTOs or logs.
- **Backend-Only Provider Keys**: Vision AI API keys, USDA Nutrition keys, and YouTube API keys reside strictly on backend microservices. React frontend NEVER receives backend secrets.

### 2.3 Storage & File Validation
- **Path Traversal Shield**: Image Service strips directory separators and generates safe UUID filenames (`img_<uuid>.jpg`).
- **Strict Format Check**: Uploads strictly validated against allowed MIME types (`image/jpeg`, `image/png`, `image/webp`).
- **File Size Cap**: Strict 10MB maximum file size limit enforced prior to buffer processing.

---

## 3. Vulnerability Reporting
For security inquiries or vulnerability reports, please reach out to `security@foodlens.ai`.
