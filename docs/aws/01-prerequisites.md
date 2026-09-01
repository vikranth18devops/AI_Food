# 01 - Prerequisites & Tooling Setup

This guide walks through installing required CLI tools and authenticating with AWS.

---

## 1. Install Required CLI Tools

### macOS (Homebrew)
```bash
brew install awscli terraform jq
```

### Linux (Ubuntu/Debian)
```bash
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip && sudo ./aws/install
sudo apt-get update && sudo apt-get install -y terraform jq
```

---

## 2. Authenticate with AWS CLI

Configure credentials:
```bash
aws configure
```

Verify active identity:
```bash
aws sts get-caller-identity
```

---

## 3. Log in to AWS ECR

Log in to Elastic Container Registry:
```bash
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 123456789012.dkr.ecr.us-east-1.amazonaws.com
```
