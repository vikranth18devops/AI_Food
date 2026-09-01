resource "azurerm_log_analytics_workspace" "logs" {
  name                = "${var.prefix}-law"
  location            = var.location
  resource_group_name = var.resource_group_name
  sku                 = "PerGB2018"
  retention_in_days   = 30
}

resource "azurerm_container_app_environment" "env" {
  name                       = "${var.prefix}-aca-env"
  location                   = var.location
  resource_group_name        = var.resource_group_name
  log_analytics_workspace_id = azurerm_log_analytics_workspace.logs.id
  infrastructure_subnet_id   = var.infrastructure_subnet_id
}

# RabbitMQ Message Broker Container App
resource "azurerm_container_app" "rabbitmq" {
  name                         = "foodlens-rabbitmq"
  container_app_environment_id = azurerm_container_app_environment.env.id
  resource_group_name          = var.resource_group_name
  revision_mode                = "Single"

  ingress {
    external_enabled = false
    target_port      = 5672
    transport        = "tcp"

    traffic_weight {
      percentage      = 100
      latest_revision = true
    }
  }

  template {
    container {
      name   = "rabbitmq"
      image  = "rabbitmq:3-management-alpine"
      cpu    = 0.5
      memory = "1Gi"

      env {
        name  = "RABBITMQ_DEFAULT_USER"
        value = "guest"
      }
      env {
        name  = "RABBITMQ_DEFAULT_PASS"
        value = "guest"
      }
    }
  }
}

# API Gateway
resource "azurerm_container_app" "api_gateway" {
  name                         = "foodlens-api-gateway"
  container_app_environment_id = azurerm_container_app_environment.env.id
  resource_group_name          = var.resource_group_name
  revision_mode                = "Single"

  secret {
    name  = "registry-password"
    value = var.acr_password
  }

  secret {
    name  = "db-url"
    value = var.database_url
  }

  secret {
    name  = "jwt-access-secret"
    value = var.jwt_access_secret
  }

  secret {
    name  = "jwt-refresh-secret"
    value = var.jwt_refresh_secret
  }

  registry {
    server               = var.acr_login_server
    username             = var.acr_username
    password_secret_name = "registry-password"
  }

  ingress {
    external_enabled = true
    target_port      = 3000
    transport        = "auto"

    traffic_weight {
      percentage      = 100
      latest_revision = true
    }
  }

  template {
    container {
      name   = "api-gateway"
      image  = "${var.acr_login_server}/foodlens/api-gateway:latest"
      cpu    = 0.5
      memory = "1Gi"

      env {
        name  = "NODE_ENV"
        value = "production"
      }
      env {
        name  = "PORT"
        value = "3000"
      }
      env {
        name        = "DATABASE_URL"
        secret_name = "db-url"
      }
      env {
        name  = "REDIS_URL"
        value = var.redis_url
      }
      env {
        name  = "RABBITMQ_URL"
        value = "amqp://guest:guest@${azurerm_container_app.rabbitmq.name}:5672"
      }
      env {
        name        = "JWT_ACCESS_SECRET"
        secret_name = "jwt-access-secret"
      }
      env {
        name        = "JWT_REFRESH_SECRET"
        secret_name = "jwt-refresh-secret"
      }
      env {
        name  = "AUTH_SERVICE_URL"
        value = "http://${azurerm_container_app.auth_service.name}"
      }
      env {
        name  = "IMAGE_SERVICE_URL"
        value = "http://${azurerm_container_app.image_service.name}"
      }
    }
  }
}

# Auth Service
resource "azurerm_container_app" "auth_service" {
  name                         = "foodlens-auth-service"
  container_app_environment_id = azurerm_container_app_environment.env.id
  resource_group_name          = var.resource_group_name
  revision_mode                = "Single"

  secret {
    name  = "registry-password"
    value = var.acr_password
  }

  secret {
    name  = "db-url"
    value = var.database_url
  }

  secret {
    name  = "jwt-access-secret"
    value = var.jwt_access_secret
  }

  secret {
    name  = "jwt-refresh-secret"
    value = var.jwt_refresh_secret
  }

  registry {
    server               = var.acr_login_server
    username             = var.acr_username
    password_secret_name = "registry-password"
  }

  ingress {
    external_enabled = false
    target_port      = 3001
    transport        = "auto"

    traffic_weight {
      percentage      = 100
      latest_revision = true
    }
  }

  template {
    container {
      name   = "auth-service"
      image  = "${var.acr_login_server}/foodlens/auth-service:latest"
      cpu    = 0.25
      memory = "0.5Gi"

      env {
        name  = "NODE_ENV"
        value = "production"
      }
      env {
        name  = "PORT"
        value = "3001"
      }
      env {
        name        = "DATABASE_URL"
        secret_name = "db-url"
      }
      env {
        name        = "JWT_ACCESS_SECRET"
        secret_name = "jwt-access-secret"
      }
      env {
        name        = "JWT_REFRESH_SECRET"
        secret_name = "jwt-refresh-secret"
      }
    }
  }
}

# Image Service
resource "azurerm_container_app" "image_service" {
  name                         = "foodlens-image-service"
  container_app_environment_id = azurerm_container_app_environment.env.id
  resource_group_name          = var.resource_group_name
  revision_mode                = "Single"

  secret {
    name  = "registry-password"
    value = var.acr_password
  }

  secret {
    name  = "db-url"
    value = var.database_url
  }

  registry {
    server               = var.acr_login_server
    username             = var.acr_username
    password_secret_name = "registry-password"
  }

  ingress {
    external_enabled = false
    target_port      = 3002
    transport        = "auto"

    traffic_weight {
      percentage      = 100
      latest_revision = true
    }
  }

  template {
    container {
      name   = "image-service"
      image  = "${var.acr_login_server}/foodlens/image-service:latest"
      cpu    = 0.25
      memory = "0.5Gi"

      env {
        name  = "NODE_ENV"
        value = "production"
      }
      env {
        name  = "PORT"
        value = "3002"
      }
      env {
        name        = "DATABASE_URL"
        secret_name = "db-url"
      }
    }
  }
}

# Food Service
resource "azurerm_container_app" "food_service" {
  name                         = "foodlens-food-service"
  container_app_environment_id = azurerm_container_app_environment.env.id
  resource_group_name          = var.resource_group_name
  revision_mode                = "Single"

  secret {
    name  = "registry-password"
    value = var.acr_password
  }

  secret {
    name  = "db-url"
    value = var.database_url
  }

  registry {
    server               = var.acr_login_server
    username             = var.acr_username
    password_secret_name = "registry-password"
  }

  ingress {
    external_enabled = false
    target_port      = 3003
    transport        = "auto"

    traffic_weight {
      percentage      = 100
      latest_revision = true
    }
  }

  template {
    container {
      name   = "food-service"
      image  = "${var.acr_login_server}/foodlens/food-service:latest"
      cpu    = 0.25
      memory = "0.5Gi"

      env {
        name  = "NODE_ENV"
        value = "production"
      }
      env {
        name  = "PORT"
        value = "3003"
      }
      env {
        name        = "DATABASE_URL"
        secret_name = "db-url"
      }
      env {
        name  = "RABBITMQ_URL"
        value = "amqp://guest:guest@${azurerm_container_app.rabbitmq.name}:5672"
      }
    }
  }
}

# Nutrition Service
resource "azurerm_container_app" "nutrition_service" {
  name                         = "foodlens-nutrition-service"
  container_app_environment_id = azurerm_container_app_environment.env.id
  resource_group_name          = var.resource_group_name
  revision_mode                = "Single"

  secret {
    name  = "registry-password"
    value = var.acr_password
  }

  secret {
    name  = "db-url"
    value = var.database_url
  }

  registry {
    server               = var.acr_login_server
    username             = var.acr_username
    password_secret_name = "registry-password"
  }

  ingress {
    external_enabled = false
    target_port      = 3004
    transport        = "auto"

    traffic_weight {
      percentage      = 100
      latest_revision = true
    }
  }

  template {
    container {
      name   = "nutrition-service"
      image  = "${var.acr_login_server}/foodlens/nutrition-service:latest"
      cpu    = 0.25
      memory = "0.5Gi"

      env {
        name  = "NODE_ENV"
        value = "production"
      }
      env {
        name  = "PORT"
        value = "3004"
      }
      env {
        name        = "DATABASE_URL"
        secret_name = "db-url"
      }
      env {
        name  = "REDIS_URL"
        value = var.redis_url
      }
      env {
        name  = "RABBITMQ_URL"
        value = "amqp://guest:guest@${azurerm_container_app.rabbitmq.name}:5672"
      }
    }
  }
}

# Analysis Service
resource "azurerm_container_app" "analysis_service" {
  name                         = "foodlens-analysis-service"
  container_app_environment_id = azurerm_container_app_environment.env.id
  resource_group_name          = var.resource_group_name
  revision_mode                = "Single"

  secret {
    name  = "registry-password"
    value = var.acr_password
  }

  secret {
    name  = "db-url"
    value = var.database_url
  }

  registry {
    server               = var.acr_login_server
    username             = var.acr_username
    password_secret_name = "registry-password"
  }

  ingress {
    external_enabled = false
    target_port      = 3005
    transport        = "auto"

    traffic_weight {
      percentage      = 100
      latest_revision = true
    }
  }

  template {
    container {
      name   = "analysis-service"
      image  = "${var.acr_login_server}/foodlens/analysis-service:latest"
      cpu    = 0.25
      memory = "0.5Gi"

      env {
        name  = "NODE_ENV"
        value = "production"
      }
      env {
        name  = "PORT"
        value = "3005"
      }
      env {
        name        = "DATABASE_URL"
        secret_name = "db-url"
      }
      env {
        name  = "RABBITMQ_URL"
        value = "amqp://guest:guest@${azurerm_container_app.rabbitmq.name}:5672"
      }
    }
  }
}

# Recommendation Service
resource "azurerm_container_app" "recommendation_service" {
  name                         = "foodlens-recommendation-service"
  container_app_environment_id = azurerm_container_app_environment.env.id
  resource_group_name          = var.resource_group_name
  revision_mode                = "Single"

  secret {
    name  = "registry-password"
    value = var.acr_password
  }

  secret {
    name  = "db-url"
    value = var.database_url
  }

  registry {
    server               = var.acr_login_server
    username             = var.acr_username
    password_secret_name = "registry-password"
  }

  ingress {
    external_enabled = false
    target_port      = 3006
    transport        = "auto"

    traffic_weight {
      percentage      = 100
      latest_revision = true
    }
  }

  template {
    container {
      name   = "recommendation-service"
      image  = "${var.acr_login_server}/foodlens/recommendation-service:latest"
      cpu    = 0.25
      memory = "0.5Gi"

      env {
        name  = "NODE_ENV"
        value = "production"
      }
      env {
        name  = "PORT"
        value = "3006"
      }
      env {
        name        = "DATABASE_URL"
        secret_name = "db-url"
      }
      env {
        name  = "REDIS_URL"
        value = var.redis_url
      }
      env {
        name  = "RABBITMQ_URL"
        value = "amqp://guest:guest@${azurerm_container_app.rabbitmq.name}:5672"
      }
    }
  }
}

# Frontend Web Application
resource "azurerm_container_app" "frontend" {
  name                         = "foodlens-frontend"
  container_app_environment_id = azurerm_container_app_environment.env.id
  resource_group_name          = var.resource_group_name
  revision_mode                = "Single"

  secret {
    name  = "registry-password"
    value = var.acr_password
  }

  registry {
    server               = var.acr_login_server
    username             = var.acr_username
    password_secret_name = "registry-password"
  }

  ingress {
    external_enabled = true
    target_port      = 80
    transport        = "auto"

    traffic_weight {
      percentage      = 100
      latest_revision = true
    }
  }

  template {
    container {
      name   = "frontend"
      image  = "${var.acr_login_server}/foodlens/frontend:latest"
      cpu    = 0.25
      memory = "0.5Gi"
    }
  }
}
