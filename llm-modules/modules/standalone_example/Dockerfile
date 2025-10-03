# Standalone module Dockerfile
# This module can be deployed independently

FROM python:3.11-slim

WORKDIR /app

# Install UV
RUN pip install uv

# Copy only what this module needs
COPY shared/ ./shared/
COPY modules/standalone_example/ ./modules/standalone_example/

# Copy minimal requirements
COPY modules/standalone_example/requirements.txt ./requirements.txt

# Install dependencies
RUN uv pip install -r requirements.txt

# Set environment
ENV PYTHONPATH=/app
ENV PYTHONUNBUFFERED=1

# Default command
CMD ["python", "-m", "modules.standalone_example.main", "run", "--help"]