output "bucket_name" {
  value       = aws_s3_bucket.uploads.bucket
  description = "S3 Bucket Name"
}

output "bucket_arn" {
  value       = aws_s3_bucket.uploads.arn
  description = "S3 Bucket ARN"
}
