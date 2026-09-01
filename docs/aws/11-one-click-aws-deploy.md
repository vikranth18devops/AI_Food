# 11 - One-Click AWS Deployment Script

Run automated one-command AWS infrastructure deployment:

```bash
cd application/infra/terraform/aws
terraform init
terraform apply -auto-approve
```

To destroy:
```bash
terraform destroy -auto-approve
```
