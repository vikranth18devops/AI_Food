terraform {
  required_version = ">= 1.5.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.region

  default_tags {
    tags = {
      Environment = var.environment
      Project     = "FoodLens AI"
      ManagedBy   = "Terraform"
    }
  }
}

module "vpc" {
  source = "./modules/vpc"
  prefix = var.prefix
}

module "secrets" {
  source             = "./modules/secrets"
  prefix             = var.prefix
  db_password        = var.db_password
  jwt_access_secret  = var.jwt_access_secret
  jwt_refresh_secret = var.jwt_refresh_secret
}

module "ecr" {
  source = "./modules/ecr"
  prefix = var.prefix
}

module "rds" {
  source      = "./modules/rds"
  prefix      = var.prefix
  vpc_id      = module.vpc.vpc_id
  subnet_ids  = module.vpc.database_subnet_ids
  db_password = var.db_password
}

module "elasticache" {
  source     = "./modules/elasticache"
  prefix     = var.prefix
  vpc_id     = module.vpc.vpc_id
  subnet_ids = module.vpc.private_subnet_ids
}

module "s3" {
  source = "./modules/s3"
  prefix = var.prefix
}

module "ecs" {
  source              = "./modules/ecs"
  prefix              = var.prefix
  vpc_id              = module.vpc.vpc_id
  public_subnet_ids   = module.vpc.public_subnet_ids
  private_subnet_ids  = module.vpc.private_subnet_ids
  ecr_repository_urls = module.ecr.repository_urls
  database_url        = module.rds.connection_string
  redis_url           = module.elasticache.redis_url
  jwt_access_secret   = var.jwt_access_secret
  jwt_refresh_secret  = var.jwt_refresh_secret
}
