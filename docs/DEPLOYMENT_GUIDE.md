# Deployment Guide

## 🚀 Vidzyme Deployment Documentation

This comprehensive guide covers the deployment of the Vidzyme AI video generation platform, from local development setup to production deployment strategies.

## 📋 Prerequisites

### System Requirements

#### Minimum Requirements
- **OS**: Windows 10/11, macOS 10.15+, Ubuntu 18.04+
- **CPU**: 4 cores, 2.5GHz
- **RAM**: 8GB minimum, 16GB recommended
- **Storage**: 50GB free space
- **Network**: Stable internet connection for API calls

#### Recommended Requirements
- **CPU**: 8 cores, 3.0GHz+
- **RAM**: 32GB for optimal performance
- **Storage**: SSD with 100GB+ free space
- **GPU**: Optional, for faster video processing

### Software Dependencies

#### Core Dependencies
```bash
# Python 3.9 or higher
python --version  # Should be 3.9+

# Node.js 16 or higher (for frontend)
node --version    # Should be 16+
npm --version     # Should be 8+
```

#### External Tools

##### FFmpeg Installation

**Windows**:
```powershell
# Using Chocolatey
choco install ffmpeg

# Or download from https://ffmpeg.org/download.html
# Extract to C:\ffmpeg and add to PATH
```

**macOS**:
```bash
# Using Homebrew
brew install ffmpeg
```

**Ubuntu/Debian**:
```bash
sudo apt update
sudo apt install ffmpeg
```

##### ImageMagick Installation

**Windows**:
```powershell
# Download from https://imagemagick.org/script/download.php#windows
# Install to C:\Program Files\ImageMagick
```

**macOS**:
```bash
brew install imagemagick
```

**Ubuntu/Debian**:
```bash
sudo apt install imagemagick
```

## 🔧 Local Development Setup

### 1. Repository Setup

```bash
# Clone the repository
git clone https://github.com/your-org/vidzyme.git
cd vidzyme

# Create directory structure if not exists
mkdir -p outputs/images outputs/audio
mkdir -p docs logs
```

### 2. Backend Setup

#### Python Environment
```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows
venv\Scripts\activate
# macOS/Linux
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

#### API Keys Configuration
```bash
# Create API key files
echo "your_gemini_api_key_here" > gemini_secret.txt
echo "your_elevenlabs_api_key_here" > voice_secret.txt

# Set file permissions (Unix-like systems)
chmod 600 gemini_secret.txt voice_secret.txt
```

#### Environment Variables
```bash
# Create .env file
cat > .env << EOF
# Server Configuration
HOST=127.0.0.1
PORT=8000
DEBUG=true
ENVIRONMENT=development

# File Paths
FFMPEG_PATH=ffmpeg
IMAGEMAGICK_PATH=magick
OUTPUT_DIR=./outputs

# Logging
LOG_LEVEL=INFO
LOG_FILE=./logs/app.log
EOF
```

### 3. Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Create environment file
cat > .env << EOF
VITE_API_BASE_URL=http://localhost:8000
VITE_ENVIRONMENT=development
EOF
```

### 4. Development Server Startup

#### Backend Server
```bash
# From project root
python -m uvicorn server:app --reload --host 127.0.0.1 --port 8000
```

#### Frontend Development Server
```bash
# From frontend directory
npm run dev
```

#### Verification
```bash
# Test backend
curl http://localhost:8000/

# Test frontend
open http://localhost:5173
```

## 🐳 Docker Deployment

### 1. Docker Configuration

#### Backend Dockerfile
```dockerfile
# Dockerfile
FROM python:3.11-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    ffmpeg \
    imagemagick \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create output directories
RUN mkdir -p outputs/images outputs/audio logs

# Set permissions
RUN chmod 755 outputs logs

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/ || exit 1

# Start application
CMD ["uvicorn", "server:app", "--host", "0.0.0.0", "--port", "8000"]
```

#### Frontend Dockerfile
```dockerfile
# frontend/Dockerfile
FROM node:18-alpine as builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

#### Docker Compose
```yaml
# docker-compose.yml
version: '3.8'

services:
  backend:
    build: .
    ports:
      - "8000:8000"
    environment:
      - HOST=0.0.0.0
      - PORT=8000
      - ENVIRONMENT=production
    volumes:
      - ./outputs:/app/outputs
      - ./logs:/app/logs
      - ./gemini_secret.txt:/app/gemini_secret.txt:ro
      - ./voice_secret.txt:/app/voice_secret.txt:ro
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/"]
      interval: 30s
      timeout: 10s
      retries: 3

  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
    depends_on:
      - backend
      - frontend
    restart: unless-stopped

volumes:
  outputs:
  logs:
```

### 2. Docker Deployment Commands

```bash
# Build and start services
docker-compose up -d --build

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Scale backend (if needed)
docker-compose up -d --scale backend=3

# Stop services
docker-compose down

# Update and restart
docker-compose pull
docker-compose up -d --force-recreate
```

## ☁️ Cloud Deployment

### 1. AWS Deployment

#### EC2 Instance Setup
```bash
# Launch EC2 instance (Ubuntu 22.04 LTS)
# Instance type: t3.large or larger
# Security groups: HTTP (80), HTTPS (443), SSH (22)

# Connect to instance
ssh -i your-key.pem ubuntu@your-ec2-ip

# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker ubuntu

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

#### Application Deployment
```bash
# Clone repository
git clone https://github.com/your-org/vidzyme.git
cd vidzyme

# Set up secrets
echo "your_gemini_key" | sudo tee gemini_secret.txt
echo "your_elevenlabs_key" | sudo tee voice_secret.txt
sudo chmod 600 *.txt

# Deploy with Docker Compose
docker-compose -f docker-compose.prod.yml up -d
```

#### Load Balancer Configuration
```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  backend:
    build: .
    deploy:
      replicas: 3
      resources:
        limits:
          memory: 2G
        reservations:
          memory: 1G
    environment:
      - ENVIRONMENT=production
      - LOG_LEVEL=WARNING

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
    depends_on:
      - backend
```

### 2. Google Cloud Platform

#### Cloud Run Deployment
```bash
# Build and push to Container Registry
gcloud builds submit --tag gcr.io/PROJECT_ID/vidzyme-backend

# Deploy to Cloud Run
gcloud run deploy vidzyme-backend \
  --image gcr.io/PROJECT_ID/vidzyme-backend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --memory 2Gi \
  --cpu 2 \
  --timeout 900
```

#### Cloud Build Configuration
```yaml
# cloudbuild.yaml
steps:
  # Build backend
  - name: 'gcr.io/cloud-builders/docker'
    args: ['build', '-t', 'gcr.io/$PROJECT_ID/vidzyme-backend', '.']
  
  # Build frontend
  - name: 'gcr.io/cloud-builders/docker'
    args: ['build', '-t', 'gcr.io/$PROJECT_ID/vidzyme-frontend', './frontend']
  
  # Push images
  - name: 'gcr.io/cloud-builders/docker'
    args: ['push', 'gcr.io/$PROJECT_ID/vidzyme-backend']
  
  - name: 'gcr.io/cloud-builders/docker'
    args: ['push', 'gcr.io/$PROJECT_ID/vidzyme-frontend']
  
  # Deploy to Cloud Run
  - name: 'gcr.io/cloud-builders/gcloud'
    args:
      - 'run'
      - 'deploy'
      - 'vidzyme-backend'
      - '--image'
      - 'gcr.io/$PROJECT_ID/vidzyme-backend'
      - '--region'
      - 'us-central1'
      - '--platform'
      - 'managed'
      - '--allow-unauthenticated'
```

### 3. Azure Deployment

#### Container Instances
```bash
# Create resource group
az group create --name vidzyme-rg --location eastus

# Create container registry
az acr create --resource-group vidzyme-rg --name vidzyme --sku Basic

# Build and push image
az acr build --registry vidzyme --image vidzyme-backend .

# Deploy container instance
az container create \
  --resource-group vidzyme-rg \
  --name vidzyme-backend \
  --image vidzyme.azurecr.io/vidzyme-backend \
  --cpu 2 \
  --memory 4 \
  --ports 8000 \
  --dns-name-label vidzyme-app
```

## 🔒 Production Configuration

### 1. Security Hardening

#### SSL/TLS Configuration
```nginx
# nginx/nginx.conf
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;
    
    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
    
    location / {
        proxy_pass http://backend:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    location /stream {
        proxy_pass http://backend:8000/stream;
        proxy_set_header Connection '';
        proxy_http_version 1.1;
        chunked_transfer_encoding off;
        proxy_buffering off;
        proxy_cache off;
    }
}
```

#### Environment Variables
```bash
# Production environment variables
export ENVIRONMENT=production
export DEBUG=false
export LOG_LEVEL=WARNING
export ALLOWED_HOSTS=your-domain.com,www.your-domain.com
export CORS_ORIGINS=https://your-domain.com
export SECRET_KEY=your-secret-key-here
export DATABASE_URL=postgresql://user:pass@host:5432/db
```

### 2. Monitoring and Logging

#### Logging Configuration
```python
# logging_config.py
import logging
from logging.handlers import RotatingFileHandler

def setup_logging():
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        handlers=[
            RotatingFileHandler(
                'logs/app.log',
                maxBytes=10485760,  # 10MB
                backupCount=5
            ),
            logging.StreamHandler()
        ]
    )
```

#### Health Check Endpoint
```python
# Add to server.py
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "version": "1.0.0",
        "dependencies": {
            "ffmpeg": check_ffmpeg(),
            "imagemagick": check_imagemagick(),
            "gemini_api": check_gemini_api(),
            "elevenlabs_api": check_elevenlabs_api()
        }
    }
```

### 3. Performance Optimization

#### Caching Strategy
```python
# Redis caching (future enhancement)
import redis
from functools import wraps

redis_client = redis.Redis(host='localhost', port=6379, db=0)

def cache_result(expiration=3600):
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            cache_key = f"{func.__name__}:{hash(str(args) + str(kwargs))}"
            cached = redis_client.get(cache_key)
            if cached:
                return json.loads(cached)
            
            result = func(*args, **kwargs)
            redis_client.setex(cache_key, expiration, json.dumps(result))
            return result
        return wrapper
    return decorator
```

#### Database Integration
```python
# database.py (future enhancement)
from sqlalchemy import create_engine, Column, Integer, String, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

Base = declarative_base()

class Video(Base):
    __tablename__ = "videos"
    
    id = Column(Integer, primary_key=True)
    title = Column(String(255))
    topic = Column(String(500))
    voice_id = Column(String(100))
    file_path = Column(String(500))
    created_at = Column(DateTime)
    status = Column(String(50))
```

## 📊 Monitoring and Maintenance

### 1. Application Monitoring

#### Prometheus Metrics
```python
# metrics.py
from prometheus_client import Counter, Histogram, Gauge

video_generation_counter = Counter(
    'video_generations_total',
    'Total number of video generations'
)

video_generation_duration = Histogram(
    'video_generation_duration_seconds',
    'Time spent generating videos'
)

active_generations = Gauge(
    'active_video_generations',
    'Number of currently active video generations'
)
```

#### Grafana Dashboard
```json
{
  "dashboard": {
    "title": "Vidzyme Monitoring",
    "panels": [
      {
        "title": "Video Generations per Hour",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(video_generations_total[1h])"
          }
        ]
      },
      {
        "title": "Average Generation Time",
        "type": "singlestat",
        "targets": [
          {
            "expr": "avg(video_generation_duration_seconds)"
          }
        ]
      }
    ]
  }
}
```

### 2. Backup Strategy

#### Automated Backups
```bash
#!/bin/bash
# backup.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/vidzyme_$DATE"

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup application files
tar -czf $BACKUP_DIR/app_files.tar.gz /app --exclude=/app/outputs

# Backup database (if applicable)
pg_dump vidzyme > $BACKUP_DIR/database.sql

# Backup configuration
cp /app/*.txt $BACKUP_DIR/
cp /app/.env $BACKUP_DIR/

# Upload to cloud storage
aws s3 sync $BACKUP_DIR s3://vidzyme-backups/$(basename $BACKUP_DIR)

# Cleanup old backups (keep last 7 days)
find /backups -name "vidzyme_*" -mtime +7 -exec rm -rf {} \;
```

### 3. Update Procedures

#### Rolling Updates
```bash
#!/bin/bash
# update.sh

# Pull latest code
git pull origin main

# Build new images
docker-compose build

# Update services one by one
docker-compose up -d --no-deps backend

# Wait for health check
while ! curl -f http://localhost:8000/health; do
    sleep 5
done

# Update frontend
docker-compose up -d --no-deps frontend

echo "Update completed successfully"
```

## 🚨 Troubleshooting

### Common Issues

#### 1. FFmpeg Not Found
```bash
# Check FFmpeg installation
which ffmpeg
ffmpeg -version

# Fix PATH issues
export PATH=$PATH:/usr/local/bin
```

#### 2. API Key Issues
```bash
# Verify API key files
ls -la *_secret.txt
cat gemini_secret.txt | wc -c  # Should be > 30 characters
```

#### 3. Memory Issues
```bash
# Monitor memory usage
free -h
docker stats

# Increase swap if needed
sudo fallocate -l 4G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

#### 4. Port Conflicts
```bash
# Check port usage
sudo netstat -tulpn | grep :8000

# Kill conflicting processes
sudo kill -9 $(sudo lsof -t -i:8000)
```

### Log Analysis
```bash
# View application logs
tail -f logs/app.log

# Docker logs
docker-compose logs -f backend

# System logs
sudo journalctl -u docker -f
```

This deployment guide provides comprehensive instructions for setting up Vidzyme in various environments, from local development to production cloud deployments, ensuring reliable and scalable operation of the AI video generation platform.