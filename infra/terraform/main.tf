terraform {
  required_version = ">= 1.6.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

module "network" {
  source = "./modules/network"
}

# Production target architecture:
# CloudFront -> Next.js service -> FastAPI ECS service -> RDS PostgreSQL with pgvector
# Redis backs rate limiting, background jobs, and AI analysis status.
