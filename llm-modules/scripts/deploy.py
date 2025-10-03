#!/usr/bin/env python3
"""
Deployment utilities for LLM modules.
"""

import os
import sys
import subprocess
import json
from pathlib import Path
from typing import Dict, List, Optional


def run_command(cmd: str, description: str) -> bool:
    """Run a command and return success status."""
    print(f"🔄 {description}...")
    try:
        result = subprocess.run(cmd, shell=True, check=True, capture_output=True, text=True)
        print(f"✅ {description} completed")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ {description} failed: {e}")
        print(f"Error output: {e.stderr}")
        return False


def build_package() -> bool:
    """Build the package for distribution."""
    print("📦 Building package...")
    
    # Clean previous builds
    run_command("rm -rf dist/ build/ *.egg-info/", "Cleaning previous builds")
    
    # Build package
    if not run_command("uv build", "Building package"):
        return False
    
    return True


def run_tests() -> bool:
    """Run test suite."""
    print("🧪 Running tests...")
    
    if not run_command("uv run pytest", "Running test suite"):
        return False
    
    return True


def run_linting() -> bool:
    """Run code linting."""
    print("🔍 Running linting...")
    
    # Run black
    if not run_command("uv run black --check .", "Checking code formatting"):
        print("⚠️  Code formatting issues found. Run 'uv run black .' to fix")
    
    # Run isort
    if not run_command("uv run isort --check-only .", "Checking import sorting"):
        print("⚠️  Import sorting issues found. Run 'uv run isort .' to fix")
    
    # Run flake8
    if not run_command("uv run flake8 .", "Running flake8 linting"):
        print("⚠️  Linting issues found")
    
    # Run mypy
    if not run_command("uv run mypy .", "Running type checking"):
        print("⚠️  Type checking issues found")
    
    return True


def create_docker_image() -> bool:
    """Create Docker image for deployment."""
    print("🐳 Creating Docker image...")
    
    # Create Dockerfile if it doesn't exist
    dockerfile_content = """
FROM python:3.11-slim

WORKDIR /app

# Install UV
RUN pip install uv

# Copy project files
COPY pyproject.toml ./
COPY shared/ ./shared/
COPY modules/ ./modules/
COPY scripts/ ./scripts/

# Install dependencies
RUN uv sync --frozen

# Set environment variables
ENV PYTHONPATH=/app
ENV PYTHONUNBUFFERED=1

# Expose port
EXPOSE 8000

# Default command
CMD ["uv", "run", "python", "-m", "modules.chat_bot.main", "chat"]
"""
    
    with open("Dockerfile", "w") as f:
        f.write(dockerfile_content)
    
    # Build Docker image
    if not run_command("docker build -t llm-modules .", "Building Docker image"):
        return False
    
    return True


def create_requirements() -> bool:
    """Create requirements.txt for deployment."""
    print("📋 Creating requirements.txt...")
    
    if not run_command("uv export --format requirements-txt > requirements.txt", "Exporting requirements"):
        return False
    
    return True


def create_deployment_config() -> bool:
    """Create deployment configuration files."""
    print("⚙️  Creating deployment configuration...")
    
    # Docker Compose
    docker_compose_content = """
version: '3.8'

services:
  llm-modules:
    build: .
    ports:
      - "8000:8000"
    environment:
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}
    volumes:
      - ./outputs:/app/outputs
      - ./logs:/app/logs
    restart: unless-stopped
"""
    
    with open("docker-compose.yml", "w") as f:
        f.write(docker_compose_content)
    
    # Kubernetes deployment
    k8s_deployment_content = """
apiVersion: apps/v1
kind: Deployment
metadata:
  name: llm-modules
spec:
  replicas: 1
  selector:
    matchLabels:
      app: llm-modules
  template:
    metadata:
      labels:
        app: llm-modules
    spec:
      containers:
      - name: llm-modules
        image: llm-modules:latest
        ports:
        - containerPort: 8000
        env:
        - name: OPENAI_API_KEY
          valueFrom:
            secretKeyRef:
              name: llm-secrets
              key: openai-api-key
        - name: ANTHROPIC_API_KEY
          valueFrom:
            secretKeyRef:
              name: llm-secrets
              key: anthropic-api-key
        resources:
          requests:
            memory: "512Mi"
            cpu: "250m"
          limits:
            memory: "1Gi"
            cpu: "500m"
---
apiVersion: v1
kind: Service
metadata:
  name: llm-modules-service
spec:
  selector:
    app: llm-modules
  ports:
  - port: 80
    targetPort: 8000
  type: LoadBalancer
"""
    
    Path("k8s").mkdir(exist_ok=True)
    with open("k8s/deployment.yaml", "w") as f:
        f.write(k8s_deployment_content)
    
    return True


def deploy_to_cloud(provider: str = "docker") -> bool:
    """Deploy to cloud provider."""
    print(f"☁️  Deploying to {provider}...")
    
    if provider == "docker":
        return create_docker_image()
    elif provider == "aws":
        print("🚧 AWS deployment not implemented yet")
        return False
    elif provider == "gcp":
        print("🚧 GCP deployment not implemented yet")
        return False
    elif provider == "azure":
        print("🚧 Azure deployment not implemented yet")
        return False
    else:
        print(f"❌ Unknown provider: {provider}")
        return False


def main():
    """Main deployment function."""
    import argparse
    
    parser = argparse.ArgumentParser(description="Deploy LLM modules")
    parser.add_argument("--provider", choices=["docker", "aws", "gcp", "azure"], 
                       default="docker", help="Deployment provider")
    parser.add_argument("--skip-tests", action="store_true", help="Skip running tests")
    parser.add_argument("--skip-linting", action="store_true", help="Skip linting")
    parser.add_argument("--build-only", action="store_true", help="Only build, don't deploy")
    
    args = parser.parse_args()
    
    print("🚀 Starting deployment process...")
    print("=" * 50)
    
    success = True
    
    # Run tests
    if not args.skip_tests:
        if not run_tests():
            print("⚠️  Tests failed, but continuing...")
    
    # Run linting
    if not args.skip_linting:
        if not run_linting():
            print("⚠️  Linting issues found, but continuing...")
    
    # Build package
    if not build_package():
        success = False
    
    # Create requirements
    if not create_requirements():
        success = False
    
    # Create deployment config
    if not create_deployment_config():
        success = False
    
    # Deploy if not build-only
    if not args.build_only:
        if not deploy_to_cloud(args.provider):
            success = False
    
    print("=" * 50)
    if success:
        print("🎉 Deployment completed successfully!")
        print(f"📦 Package built and ready for {args.provider} deployment")
    else:
        print("❌ Deployment completed with errors")
        print("Please check the error messages above")
        sys.exit(1)


if __name__ == "__main__":
    main()