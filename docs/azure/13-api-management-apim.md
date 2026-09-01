# 13 - Azure API Management (APIM) Integration Guide

This guide details configuring **Azure API Management (APIM)** for enterprise API governance, subscription key management, rate limiting policies, and developer portal onboarding.

---

## 1. Azure APIM Overview & Architecture

Azure APIM acts as the central API gateway facade sitting in front of the FoodLens AI API Gateway container app:

```text
[Client / Mobile App] ---> [Azure APIM Gateway] ---> [API Gateway ACA Container App]
```

Key Capabilities Configured:
- **Consumption SKU (`Consumption_0`)**: Serverless per-request pricing model (`$0.00` idle cost).
- **Inbound Rate-Limiting Policy**: 100 requests per 60 seconds per client IP.
- **CORS Handling**: Global Cross-Origin Resource Sharing wildcard policy.
- **Developer Portal**: Self-service API key registration for external consumer apps.

---

## 2. Verify Provisioned APIM Gateway & Portal

List APIM instance status:
```bash
az apim show \
  --resource-group foodlens-dev-rg \
  --name foodlens-dev-apim \
  --output table
```

Fetch APIM Gateway URL:
```bash
az apim show \
  --resource-group foodlens-dev-rg \
  --name foodlens-dev-apim \
  --query "gatewayUrl" \
  --output tsv
```

---

## 3. APIM Policy XML Configuration

The inbound policy enforced on `/api/*` routes:
```xml
<policies>
  <inbound>
    <rate-limit calls="100" renewal-period="60" />
    <cors allow-credentials="true">
      <allowed-origins>
        <origin>*</origin>
      </allowed-origins>
      <allowed-methods>
        <method>GET</method>
        <method>POST</method>
        <method>PUT</method>
        <method>DELETE</method>
        <method>OPTIONS</method>
      </allowed-methods>
      <allowed-headers>
        <header>*</header>
      </allowed-headers>
    </cors>
    <base />
  </inbound>
</policies>
```
