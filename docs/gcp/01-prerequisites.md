# 01 - Prerequisites & Tooling Setup

This guide walks through installing required CLI tools and authenticating with Google Cloud Platform.

---

## 1. Install Required CLI Tools

### macOS (Homebrew)
```bash
brew install google-cloud-sdk terraform jq
```

### Linux (Ubuntu/Debian)
```bash
sudo apt-get update && sudo apt-get install -y google-cloud-sdk terraform jq
```

---

## 2. Authenticate with Google Cloud

Login to your GCP account:
```bash
gcloud auth login
gcloud auth application-default login
```

Set active GCP Project:
```bash
gcloud config set project YOUR_GCP_PROJECT_ID
```

---

## 3. Log in to GCP Artifact Registry

Authenticate Docker with Artifact Registry:
```bash
gcloud auth configure-docker us-central1-docker.pkg.dev
```
