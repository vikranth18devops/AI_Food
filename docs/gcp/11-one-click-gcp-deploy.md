# 11 - One-Click GCP Deployment Script

Run automated one-command GCP infrastructure deployment:

```bash
cd application/infra/terraform/gcp
terraform init
terraform apply -auto-approve
```

To destroy:
```bash
terraform destroy -auto-approve
```
