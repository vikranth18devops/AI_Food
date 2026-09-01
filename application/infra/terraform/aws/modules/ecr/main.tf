locals {
  services = [
    "api-gateway",
    "auth-service",
    "image-service",
    "food-service",
    "nutrition-service",
    "analysis-service",
    "recommendation-service",
    "frontend"
  ]
}

resource "aws_ecr_repository" "repo" {
  for_each             = toset(local.services)
  name                 = "${var.prefix}/${each.key}"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }
}
