# 🚀 Production Deployment Guide

## Overview

This guide covers deploying the LMS to production environments.

## 🔧 Pre-Deployment Checklist

- [ ] Update SECRET_KEY in environment variables
- [ ] Configure production database (PostgreSQL/MySQL)
- [ ] Set up file storage (AWS S3, local storage, etc.)
- [ ] Configure CORS for production domain
- [ ] Enable HTTPS/SSL
- [ ] Set up backup strategy
- [ ] Configure logging
- [ ] Set up monitoring

## 📦 Backend Deployment

### Option 1: Docker Deployment

#### Create Dockerfile
```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app ./app
COPY uploads ./uploads

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

#### Create docker-compose.yml
```yaml
version: '3.8'

services:
  backend:
    build: .
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://user:pass@db:5432/lms
      - SECRET_KEY=${SECRET_KEY}
    volumes:
      - ./uploads:/app/uploads
    depends_on:
      - db

  db:
    image: postgres:15
    environment:
      - POSTGRES_DB=lms
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

#### Deploy
```bash
docker-compose up -d
```

### Option 2: Traditional Server Deployment

#### 1. Install Dependencies
```bash
# On Ubuntu/Debian
sudo apt update
sudo apt install python3-pip python3-venv nginx

# Create app directory
sudo mkdir -p /var/www/lms
sudo chown $USER:$USER /var/www/lms
cd /var/www/lms

# Copy project files
# ... upload your files ...

# Create virtual environment
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

#### 2. Configure Gunicorn
```bash
# Install Gunicorn
pip install gunicorn

# Create systemd service file
sudo nano /etc/systemd/system/lms.service
```

```ini
[Unit]
Description=LMS FastAPI Application
After=network.target

[Service]
User=www-data
Group=www-data
WorkingDirectory=/var/www/lms
Environment="PATH=/var/www/lms/venv/bin"
ExecStart=/var/www/lms/venv/bin/gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker -b 0.0.0.0:8000

[Install]
WantedBy=multi-user.target
```

```bash
# Start service
sudo systemctl daemon-reload
sudo systemctl start lms
sudo systemctl enable lms
```

#### 3. Configure Nginx
```bash
sudo nano /etc/nginx/sites-available/lms
```

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    # Frontend
    location / {
        root /var/www/lms/frontend/build;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Uploads
    location /uploads {
        alias /var/www/lms/uploads;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/lms /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

#### 4. SSL with Let's Encrypt
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

## 🎨 Frontend Deployment

### Build Production Bundle
```bash
cd frontend

# Update API URL
echo "REACT_APP_API_URL=https://yourdomain.com/api" > .env.production

# Build
npm run build

# Deploy build folder to server
scp -r build/* user@server:/var/www/lms/frontend/build/
```

### Option: Deploy to Netlify/Vercel
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
cd frontend
npm run build
netlify deploy --prod
```

Update environment variables in Netlify dashboard:
- `REACT_APP_API_URL=https://api.yourdomain.com`

## 🗄️ Database Setup

### PostgreSQL Production Setup

```bash
# Install PostgreSQL
sudo apt install postgresql postgresql-contrib

# Create database and user
sudo -u postgres psql
```

```sql
CREATE DATABASE lms_production;
CREATE USER lms_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE lms_production TO lms_user;
\q
```

```bash
# Update .env
DATABASE_URL=postgresql://lms_user:secure_password@localhost/lms_production
```

### Database Migration
```bash
# Backup SQLite data (if migrating)
sqlite3 lms.db .dump > backup.sql

# Restore to PostgreSQL (requires manual conversion)
# Or use migration tools like pgloader
```

## 🔐 Security Hardening

### 1. Environment Variables
```bash
# Create .env file (never commit to git)
cat > .env << EOF
DATABASE_URL=postgresql://user:pass@localhost/lms
SECRET_KEY=$(python -c 'import secrets; print(secrets.token_urlsafe(32))')
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
FRONTEND_URL=https://yourdomain.com
EOF
```

### 2. Update CORS Settings
In `app/main.py`:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://yourdomain.com"],  # Specific domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### 3. Rate Limiting
```bash
pip install slowapi

# Add to main.py
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Apply to routes
@app.post("/user/login")
@limiter.limit("5/minute")
async def login(...):
    ...
```

## 📊 Monitoring & Logging

### Set Up Logging
```python
# In app/main.py
import logging

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('/var/log/lms/app.log'),
        logging.StreamHandler()
    ]
)
```

### Health Check Endpoint
```python
# Add to main.py
@app.get("/health")
def health_check():
    return {"status": "healthy", "timestamp": datetime.utcnow()}
```

## 💾 Backup Strategy

### Database Backup Script
```bash
#!/bin/bash
# backup.sh

BACKUP_DIR="/var/backups/lms"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Backup database
pg_dump lms_production > "$BACKUP_DIR/db_$TIMESTAMP.sql"

# Backup uploads
tar -czf "$BACKUP_DIR/uploads_$TIMESTAMP.tar.gz" /var/www/lms/uploads

# Keep only last 7 days
find $BACKUP_DIR -type f -mtime +7 -delete

echo "Backup completed: $TIMESTAMP"
```

```bash
# Add to crontab (daily at 2 AM)
0 2 * * * /var/www/lms/backup.sh
```

## 🔍 Performance Optimization

### 1. Enable Response Caching
```python
from fastapi_cache import FastAPICache
from fastapi_cache.backends.redis import RedisBackend
from redis import asyncio as aioredis

@app.on_event("startup")
async def startup():
    redis = aioredis.from_url("redis://localhost")
    FastAPICache.init(RedisBackend(redis), prefix="lms-cache")
```

### 2. Database Connection Pooling
```python
# In app/utils/db.py
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    pool_size=20,
    max_overflow=40,
    pool_pre_ping=True
)
```

### 3. Static File Compression
In Nginx config:
```nginx
gzip on;
gzip_types text/plain text/css application/json application/javascript;
gzip_min_length 1000;
```

## 📱 Environment-Specific Configs

### Development
```env
DEBUG=True
DATABASE_URL=sqlite:///./lms.db
FRONTEND_URL=http://localhost:3000
```

### Staging
```env
DEBUG=False
DATABASE_URL=postgresql://user:pass@staging-db/lms
FRONTEND_URL=https://staging.yourdomain.com
```

### Production
```env
DEBUG=False
DATABASE_URL=postgresql://user:pass@prod-db/lms
FRONTEND_URL=https://yourdomain.com
SENTRY_DSN=your-sentry-dsn  # Error tracking
```

## 🧪 Pre-Launch Testing

```bash
# Load testing with Apache Bench
ab -n 1000 -c 10 http://yourdomain.com/api/course/

# Security scanning
pip install safety
safety check

# Check for vulnerabilities
npm audit
```

## 📋 Launch Checklist

- [ ] Database backed up
- [ ] SSL certificate installed
- [ ] Environment variables set
- [ ] Firewall configured
- [ ] Monitoring enabled
- [ ] Logs rotating properly
- [ ] Backup cron job tested
- [ ] Load testing completed
- [ ] Security scan passed
- [ ] DNS configured
- [ ] CDN setup (if using)
- [ ] Email notifications working (if implemented)

## 🆘 Troubleshooting

### Check Logs
```bash
# Application logs
tail -f /var/log/lms/app.log

# Nginx logs
tail -f /var/log/nginx/error.log

# System service
sudo journalctl -u lms -f
```

### Restart Services
```bash
sudo systemctl restart lms
sudo systemctl restart nginx
```

### Database Connection Issues
```bash
# Test connection
psql -h localhost -U lms_user -d lms_production

# Check connections
sudo -u postgres psql -c "SELECT * FROM pg_stat_activity;"
```

## 🎯 Post-Deployment

1. **Monitor first 24 hours** - Watch for errors and performance issues
2. **Set up alerts** - Email/Slack notifications for errors
3. **Document any issues** - Keep track of problems and solutions
4. **Plan maintenance window** - Schedule regular updates
5. **Gather user feedback** - Monitor usage patterns

---

**Need help?** Check server logs and ensure all services are running properly.
