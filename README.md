# Next.js Frontend - Docker Setup

## 🚀 Quick Start

### Development Mode
```bash
# 1. Copy environment variables
cp .env.local.example .env.local

# 2. Edit .env.local and set your Django API URL
# NEXT_PUBLIC_API_URL=http://localhost:8000

# 3. Start with Docker
docker-compose -f docker-compose.dev.yml up --build

# Or without Docker
npm install
npm run dev
```

Access: http://localhost:3000

### Production Mode
```bash
# 1. Copy production environment
cp .env.production.example .env

# 2. Edit .env and set your production API URL
# NEXT_PUBLIC_API_URL=https://api.yourdomain.com

# 3. Build and run
docker-compose up --build -d

# Stop
docker-compose down
```

## 📁 Project Structure
```
bp-frontend/
├── src/
│   ├── app/              # Next.js 15 App Router
│   ├── components/       # React components
│   └── lib/             # Utilities
├── public/              # Static files
├── .env.local           # Development environment (gitignored)
├── .env                 # Production environment (gitignored)
├── .env.local.example   # Development template
├── .env.production.example # Production template
├── Dockerfile           # Production build
├── Dockerfile.dev       # Development build
├── docker-compose.yml   # Production compose
└── docker-compose.dev.yml # Development compose
```

## 🔧 Environment Variables

### File Structure
- **`.env.local`** → Development (used by `docker-compose.dev.yml`)
- **`.env`** → Production (used by `docker-compose.yml`)
- **`.env.local.example`** → Development template (committed to git)
- **`.env.production.example`** → Production template (committed to git)

### Important Variables
- `NEXT_PUBLIC_API_URL`: Django backend API URL
  - Development: `http://localhost:8000`
  - Production: `https://api.yourdomain.com`
- `NODE_ENV`: development/production

### Adding New Variables
```bash
# Public variables (accessible in browser)
NEXT_PUBLIC_YOUR_VAR=value

# Private variables (server-side only)
YOUR_SECRET=secret_value
```

## 🐳 Docker Commands

```bash
# Development with hot reload
docker-compose -f docker-compose.dev.yml up

# Development rebuild
docker-compose -f docker-compose.dev.yml up --build

# Production build
docker-compose up --build

# View logs
docker-compose logs -f

# Rebuild from scratch
docker-compose build --no-cache

# Stop and remove containers
docker-compose down

# Clean up volumes
docker-compose down -v
```

## 🔗 Connect to Django Backend

### Development
- Backend: http://localhost:8000
- Frontend: http://localhost:3000
- Set in `.env.local`: `NEXT_PUBLIC_API_URL=http://localhost:8000`

### Production (Different Servers)
- Backend: https://api.yourdomain.com
- Frontend: https://yourdomain.com
- Set in `.env`: `NEXT_PUBLIC_API_URL=https://api.yourdomain.com`

### CORS Configuration
Make sure Django backend allows requests from your frontend domain:
```python
# Django settings.py
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",  # Development
    "https://yourdomain.com",  # Production
]
```

## 📝 Setup Checklist

- [ ] Install Next.js 15.5.4
- [ ] Copy `.env.local.example` to `.env.local`
- [ ] Update `NEXT_PUBLIC_API_URL` in `.env.local`
- [ ] Add `output: 'standalone'` to `next.config.mjs`
- [ ] Test with `docker-compose -f docker-compose.dev.yml up`
- [ ] Configure Django CORS settings
- [ ] For production, copy `.env.production.example` to `.env`
- [ ] Update production API URL

## 🚨 Important Notes

- ✅ `.env.local` and `.env` are gitignored (secrets safe)
- ✅ Always use `NEXT_PUBLIC_` prefix for browser-accessible variables
- ✅ Variables without `NEXT_PUBLIC_` are server-side only
- ✅ Docker compose reads from `.env` file automatically
- ✅ Restart containers after changing environment variables
