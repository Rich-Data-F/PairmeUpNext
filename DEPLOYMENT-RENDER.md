# Production Deployment Guide: Render + Neon + Vercel

This guide deploys PairMeUp with:
- **Neon**: PostgreSQL database (free 3GB)
- **Render**: Backend API (free tier)
- **Vercel**: Frontend (free tier)

## Prerequisites

1. GitHub account with repository pushed
2. Neon account (https://neon.tech)
3. Render account (https://render.com)  
4. Vercel account (https://vercel.com)

## Step 1: Database Setup (Neon)

### 1.1 Create Neon Project
1. Go to https://neon.tech
2. Sign up/login with GitHub
3. Click "Create Project"
4. Name: `pairmeup-database`
5. Region: Choose closest to your users
6. PostgreSQL version: Latest (15+)

### 1.2 Get Connection String
After project creation, copy the connection string:
```
postgresql://username:password@ep-xxx.region.aws.neon.tech/neondb?sslmode=require
```

### 1.3 Test Connection (Optional)
```bash
# From your local project
cd packages/db
# Update .env with Neon DATABASE_URL
npx prisma db push
npx prisma db seed
```

## Step 2: Backend API Deployment (Render)

### 2.1 Create Render Account
1. Go to https://render.com
2. Sign up with GitHub

### 2.2 Create Web Service
1. Click "New +" → "Web Service"
2. Connect GitHub repository: `Rich-Data-F/PairmeUpNext`
3. Configure:
   - **Name**: `pairmeup-api`
   - **Root Directory**: `apps/api`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run start:prod`
   - **Plan**: Free

### 2.3 Set Environment Variables
In Render dashboard, add these environment variables:

```bash
NODE_ENV=production
DATABASE_URL=<your-neon-connection-string>
JWT_SECRET=<generate-32-char-secret>
ID_ENCRYPTION_KEY=<generate-32-char-secret>
CORS_ORIGINS=https://your-vercel-app.vercel.app
GEODB_BASE_URL=https://geodb-cities-api.wirefreethought.com
```

Generate secrets:
```bash
# Generate JWT_SECRET
openssl rand -base64 32

# Generate ID_ENCRYPTION_KEY  
openssl rand -base64 32
```

### 2.4 Deploy
Click "Create Web Service" - Render will automatically deploy from your GitHub repo.

Your API will be available at: `https://pairmeup-api.onrender.com`

## Step 3: Frontend Deployment (Vercel)

### 3.1 Install Vercel CLI
```bash
npm install -g vercel
```

### 3.2 Login and Deploy
```bash
cd /path/to/PairAgainNext
vercel login
vercel
```

Choose:
- Link to existing project: No
- Project name: `pairmeup-frontend`
- Directory: `./apps/web`
- Override settings: Yes if needed

### 3.3 Set Environment Variables
```bash
vercel env add NEXTAUTH_URL
# Enter: https://your-vercel-app.vercel.app

vercel env add NEXTAUTH_SECRET  
# Enter: 32+ character secret

vercel env add API_BASE_URL
# Enter: https://pairmeup-api.onrender.com

vercel env add DATABASE_URL
# Enter: <your-neon-connection-string>
```

### 3.4 Deploy to Production
```bash
vercel --prod
```

## Step 4: Database Migration

### 4.1 Run Migrations
```bash
# Set DATABASE_URL to your Neon connection string
export DATABASE_URL="postgresql://username:password@ep-xxx.region.aws.neon.tech/neondb?sslmode=require"

# Run migrations
cd packages/db
npx prisma migrate deploy

# Seed initial data
npx prisma db seed
```

## Step 5: Configure CORS

Update your Render environment variable:
```bash
CORS_ORIGINS=https://your-actual-vercel-domain.vercel.app
```

Redeploy the Render service after updating.

## Step 6: Production Testing

Test these endpoints:

1. **API Health**: `https://pairmeup-api.onrender.com/health`
2. **Brands**: `https://pairmeup-api.onrender.com/brands`
3. **Search**: `https://pairmeup-api.onrender.com/search/advanced`
4. **Frontend**: `https://your-vercel-app.vercel.app`

## Monitoring & Logs

### Render Logs:
- Go to Render dashboard
- Click on your service
- View "Logs" tab

### Vercel Logs:
- Go to Vercel dashboard  
- Click on your project
- View "Functions" tab for API routes

### Neon Monitoring:
- Go to Neon dashboard
- View "Monitoring" tab for database metrics

## Cost Breakdown (Free Tiers)

- **Neon**: 3GB database, 1 project (Free)
- **Render**: 750 hours/month, 512MB RAM (Free)
- **Vercel**: 100GB bandwidth, unlimited static hosting (Free)

## Troubleshooting

### Common Issues:

1. **Build Failures on Render**:
   - Check `apps/api/package.json` has all dependencies
   - Verify build command in Render settings

2. **Database Connection Issues**:
   - Verify DATABASE_URL is exactly as provided by Neon
   - Check if IP restrictions are set in Neon

3. **CORS Errors**:
   - Update CORS_ORIGINS with exact Vercel domain
   - Redeploy Render service after CORS update

4. **API Not Accessible**:
   - Check Render service status
   - Verify environment variables are set
   - Check logs for startup errors

### Free Tier Limitations:

- **Render**: Service sleeps after 15 minutes of inactivity (cold starts)
- **Neon**: 3GB storage limit
- **Vercel**: 100GB bandwidth limit

## Upgrade Paths:

When you need more resources:
- **Render**: $7/month for always-on service
- **Neon**: $19/month for 100GB storage  
- **Vercel**: $20/month for team features
