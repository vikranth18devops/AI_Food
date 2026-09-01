resource "aws_s3_bucket" "uploads" {
  bucket = "${var.prefix}-uploads-bucket"
}

resource "aws_s3_bucket_ownership_controls" "controls" {
  bucket = aws_s3_bucket.uploads.id
  rule {
    object_ownership = "BucketOwnerPreferred"
  }
}

resource "aws_s3_bucket_acl" "acl" {
  depends_on = [aws_s3_bucket_ownership_controls.controls]
  bucket     = aws_s3_bucket.uploads.id
  acl        = "private"
}
