# EarbudHub Development Guide

## 🚀 Quick Start

### Option 1: Automated Setup (Recommended)
```bash
./dev-setup.sh
```

### Option 2: Manual Development Mode
```bash
# Start both frontend and backend
npm run dev
```

### Option 3: Individual Services
```bash
# Backend only (API server)
npm run dev:api

# Frontend only (Next.js)
npm run dev:web
```

## 🌐 Development URLs

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:4000
- **API Documentation (Swagger)**: http://localhost:4000/api/docs
- **Health Check**: http://localhost:4000/health

## 📊 Sample API Endpoints

Test these endpoints (backend must be running):

```bash
# Health check
curl http://localhost:4000/health

# Get all brands
curl http://localhost:4000/brands

# Search listings
curl http://localhost:4000/search/listings

# Get API documentation
open http://localhost:4000/api/docs
```

## 🛠 Database Commands

```bash
# Generate Prisma client
npm run db:generate

# Run migrations
npm run db:migrate

# Seed database with sample data
npm run db:seed

# Open Prisma Studio (GUI)
npm run db:studio

# Reset database (careful!)
npm run db:reset
```

## 🐳 Docker Development

```bash
# Start services (PostgreSQL, Redis, MinIO)
npm run docker:up

# Stop services
npm run docker:down
```

## 🏗 Build Commands

```bash
# Build all packages
npm run build

# Build individual components
npm run build:db
npm run build:api
npm run build:web
```

## 🧪 Testing

```bash
# Run all tests
npm run test

# Test individual apps
npm run test:api
npm run test:web
```

## 🔧 Troubleshooting

### Port Already in Use
```bash
# Kill processes on port 4000 (API)
lsof -ti:4000 | xargs kill -9

# Kill processes on port 3000 (Frontend)
lsof -ti:3000 | xargs kill -9
```

### Database Issues
```bash
# Reset PostgreSQL password
sudo -u postgres psql -c "ALTER USER postgres PASSWORD 'postgres';"

# Create database
sudo -u postgres createdb earbudhub

# Check PostgreSQL status
sudo systemctl status postgresql
```

### Fresh Install
```bash
# Clean and reinstall everything
npm run clean
npm install
./dev-setup.sh
```

## 📁 Project Structure

```
├── apps/
│   ├── api/          # NestJS backend API
│   └── web/          # Next.js frontend
├── packages/
│   └── db/           # Shared Prisma database package
├── dev-setup.sh      # Automated development setup
└── package.json      # Workspace configuration
```

## 🔥 Features Implemented

- ✅ **Prisma 6.16.1** - Latest ORM with PostgreSQL
- ✅ **NestJS API** - Advanced search, listings, brands
- ✅ **Next.js Frontend** - Modern React with TypeScript
- ✅ **Authentication** - JWT-based auth system
- ✅ **File Upload** - MinIO S3-compatible storage
- ✅ **Search Engine** - Faceted search with geographic filtering
- ✅ **Database Seeding** - Sample data for development
- ✅ **API Documentation** - Auto-generated Swagger docs
- ✅ **Type Safety** - End-to-end TypeScript

## 💡 Development Tips

1. **Always run `./dev-setup.sh` first** for automated setup
2. **Use `npm run dev`** to start both services simultaneously
3. **Check `http://localhost:4000/api/docs`** for API exploration
4. **Database changes** require running migrations
5. **Both servers auto-reload** on file changes
