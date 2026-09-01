output "db_secret_arn" {
  value = aws_secretsmanager_secret.db_secret.arn
}

output "jwt_access_arn" {
  value = aws_secretsmanager_secret.jwt_access.arn
}

output "jwt_refresh_arn" {
  value = aws_secretsmanager_secret.jwt_refresh.arn
}
