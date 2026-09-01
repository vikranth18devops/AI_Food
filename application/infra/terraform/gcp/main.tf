terraform {
  required_version = ">= 1.5.0"

  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }
}

provider "google" {
  project = var.project_id
  region  = var.region
}

module "vpc" {
  source     = "./modules/vpc"
  project_id = var.project_id
  region     = var.region
  prefix     = var.prefix
}

module "secrets" {
  source             = "./modules/secrets"
  project_id         = var.project_id
  prefix             = var.prefix
  db_password        = var.db_password
  jwt_access_secret  = var.jwt_access_secret
  jwt_refresh_secret = var.jwt_refresh_secret
}

module "artifact_registry" {
  source     = "./modules/artifact_registry"
  project_id = var.project_id
  location   = var.region
  prefix     = var.prefix
}

module "cloud_sql" {
  source      = "./modules/cloud_sql"
  project_id  = var.project_id
  region      = var.region
  prefix      = var.prefix
  db_password = var.db_password
}

module "memorystore" {
  source     = "./modules/memorystore"
  project_id = var.project_id
  region     = var.region
  prefix     = var.prefix
}

module "gcs" {
  source     = "./modules/gcs"
  project_id = var.project_id
  location   = var.region
  prefix     = var.prefix
}

module "cloud_run" {
  source             = "./modules/cloud_run"
  project_id         = var.project_id
  location           = var.region
  prefix             = var.prefix
  repository_id      = module.artifact_registry.repository_id
  database_url       = module.cloud_sql.connection_string
  redis_url          = module.memorystore.redis_url
  jwt_access_secret  = var.jwt_access_secret
  jwt_refresh_secret = var.jwt_refresh_secret
}
