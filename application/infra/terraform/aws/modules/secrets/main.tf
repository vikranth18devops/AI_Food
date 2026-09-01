resource "aws_secretsmanager_secret" "db_secret" {
  name = "${var.prefix}-db-credentials"
}

resource "aws_secretsmanager_secret_version" "db_secret_ver" {
  secret_id     = aws_secretsmanager_secret.db_secret.id
  secret_string = var.db_password
}

resource "aws_secretsmanager_secret" "jwt_access" {
  name = "${var.prefix}-jwt-access-secret"
}

resource "aws_secretsmanager_secret_version" "jwt_access_ver" {
  secret_id     = aws_secretsmanager_secret.jwt_access.id
  secret_string = var.jwt_access_secret
}

resource "aws_secretsmanager_secret" "jwt_refresh" {
  name = "${var.prefix}-jwt-refresh-secret"
}

resource "aws_secretsmanager_secret_version" "jwt_refresh_ver" {
  secret_id     = aws_secretsmanager_secret.jwt_refresh.id
  secret_string = var.jwt_refresh_secret
}
