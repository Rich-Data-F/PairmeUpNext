# Production Deployment Guide - Railway + Neon + Vercel

This guide will help you deploy the PairMeUp marketplace using:
- **Neon** for PostgreSQL database (free tier)
- **Railway** for backend API (free tier)
- **Vercel** for frontend (free tier)

## Prerequisites

1. Neon account (https://neon.tech)
2. Railway account (https://railway.app)
3. Vercel account (https://vercel.com)
4. GitHub repository pushed with latest changes

## Step 1: Set up Neon Database

### 1.1 Create Neon Project
1. Go to https://neon.tech and sign up
2. Click "Create Project"
3. Name: `pairmeup-database`
4. Choose your preferred region
5. Leave PostgreSQL version as default

### 1.2 Get Connection String
1. After creation, go to "Connection Details"
2. Copy the connection string (it looks like):
   ```
   postgresql://username:password@ep-abc123.region.aws.neon.tech/dbname?sslmode=require
   ```
3. Save this - you'll need it for Railway and Vercel

### 1.3 Run Initial Migration (Optional - can be done after Railway deployment)
```bash
# From your local machine, set the DATABASE_URL temporarily
export DATABASE_URL="your-neon-connection-string"
cd apps/api
npx prisma migrate deploy
npx prisma db seed
```

## Step 2: Deploy Backend to Railway

### 2.1 Create New Railway Project
Since you're at your resource limit, let's try to create a new project:

```bash
cd /path/to/PairAgainNext
railway login
railway init
# If it fails due to resource limits, you may need to upgrade or clean up existing projects
```

### 2.2 Set Environment Variables
```bash
# Core variables
railway variables set NODE_ENV=production
railway variables set DATABASE_URL="your-neon-connection-string-here"
railway variables set JWT_SECRET=$(openssl rand -base64 32)
railway variables set ID_ENCRYPTION_KEY=$(openssl rand -base64 32)

# CORS - will update after Vercel deployment
railway variables set CORS_ORIGINS="https://localhost:3000"
```

### 2.3 Deploy
```bash
railway up
```

After deployment, Railway will give you a URL like: `https://your-app.up.railway.app`

### 2.4 Update CORS
```bash
# After you get your Vercel URL, update CORS
railway variables set CORS_ORIGINS="https://your-vercel-app.vercel.app"
```

### 2.5 Run Database Migrations (if not done in Step 1.3)
```bash
railway run npx prisma migrate deploy
railway run npx prisma db seed
```

## Step 3: Deploy Frontend to Vercel

### 3.1 Install Vercel CLI
```bash
npm install -g vercel
```

### 3.2 Deploy
```bash
cd /path/to/PairAgainNext
vercel login
vercel
```

Follow prompts and choose `apps/web` as the root directory when asked.

### 3.3 Set Environment Variables
```bash
# Set production environment variables
vercel env add NEXTAUTH_URL production
# Enter: https://your-vercel-app.vercel.app

vercel env add NEXTAUTH_SECRET production  
# Enter: a 32+ character random string

vercel env add API_BASE_URL production
# Enter: https://your-railway-app.up.railway.app

vercel env add DATABASE_URL production
# Enter: your-neon-connection-string (for any frontend DB operations)
```

### 3.4 Redeploy with Environment Variables
```bash
vercel --prod
```

## Step 4: Final Configuration

### 4.1 Update CORS on Railway
Now that you have your Vercel URL:
```bash
railway variables set CORS_ORIGINS="https://your-vercel-app.vercel.app"
```

### 4.2 Test the Application
1. Visit your Vercel URL
2. Test the marketplace functionality
3. Check that API calls work properly
4. Verify database operations

## Step 5: Environment Variables Summary

### Neon (Database):
- No configuration needed, just use the connection string

### Railway (Backend API):
```bash
NODE_ENV=production
PORT=<auto-set>
DATABASE_URL=<neon-connection-string>
JWT_SECRET=<32-char-random-string>
ID_ENCRYPTION_KEY=<32-char-random-string>
CORS_ORIGINS=<vercel-app-url>
```

### Vercel (Frontend):
```bash
NEXTAUTH_URL=<vercel-app-url>
NEXTAUTH_SECRET=<32-char-random-string>
API_BASE_URL=<railway-api-url>
DATABASE_URL=<neon-connection-string>
```

## Troubleshooting

### Railway Resource Limits
If you hit Railway's free tier limits:
1. Check your existing projects and delete unused ones
2. Consider upgrading to Railway's paid plan ($5/month)
3. Alternative: Use Render for the API instead

### Database Connection Issues
- Ensure the Neon connection string includes `?sslmode=require`
- Verify the DATABASE_URL is set correctly in both Railway and Vercel
- Check Neon dashboard for connection limits

### CORS Errors
- Ensure CORS_ORIGINS in Railway matches your Vercel URL exactly
- Include both www and non-www versions if using custom domain

## Cost Breakdown (Free Tiers)
- **Neon**: 3GB database, 100 hours compute/month
- **Railway**: $5 credit/month, enough for small API
- **Vercel**: 100GB bandwidth, unlimited static deployments
- **Total**: Effectively free for development/small projects
