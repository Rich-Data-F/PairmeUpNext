# PairMeUp Deployment Guide: Render + Neon + Vercel

Since Railway has resource limits on the free plan, we'll use this optimal free-tier combination:
- **Neon** - PostgreSQL database (3GB free)
- **Render** - Backend API (750 hours/month free)  
- **Vercel** - Frontend (100GB bandwidth free)

## 🚀 Quick Start Summary

**Your pre-generated secrets (save these!):**
- JWT_SECRET: `/gBquTmkMO4rAPU60o87EXa9RVXrP0fws1DAi2HsfVA=`
- ID_ENCRYPTION_KEY: `YH+f+RLculWWlo0cH9czRbPhE0Nb3eo7/3lmjIE2z5E=`
- NEXTAUTH_SECRET: `/VOFtyKTMe+jQKHcQsTTZeDoYmrpUFxZzAEsIP8xKdc=`
- DATABASE_URL: `postgresql://neondb_owner:npg_2AHXUPy0dvuV@ep-summer-king-a926bt3n-pooler.gwc.azure.neon.tech/neondb?sslmode=require&channel_binding=require`

**Steps:**
1. Your Neon database is already created ✅
2. Deploy API to Render (copy/paste the environment variables below)
3. Deploy frontend to Vercel
4. Update CORS settings
5. Test everything works

## Step 1: Set up Neon Database (5 minutes)

### 1.1 Create Account & Project
1. Go to https://neon.tech
2. Sign up with GitHub
3. Create new project: "pairmeup-database"
4. Choose region closest to you

### 1.2 Get Connection String
After creation, copy the connection string from the dashboard:
```
psql 'postgresql://neondb_owner:npg_2AHXUPy0dvuV@ep-summer-king-a926bt3n-pooler.gwc.azure.neon.tech/neondb?sslmode=require&channel_binding=require'
```

Save this - you'll need it for both Render and Vercel!

## Step 2: Deploy API to Render (10 minutes)

### 2.1 Create Account
1. Go to https://render.com
2. Sign up with GitHub
3. Connect your GitHub account

### 2.2 Deploy from GitHub
1. Click "New +" → "Web Service"
2. Connect your repository: `Rich-Data-F/PairmeUpNext`
3. Configure the service:
   - **Name**: `pairmeup-api`
   - **Root Directory**: `apps/api`
   - **Environment**: `Node`
   - **Build Command**: `npm ci && npm run build`
   - **Start Command**: `npm run start:prod`
   - **Plan**: Free

### 2.3 Set Environment Variables
In the Render dashboard, add these environment variables:

```bash
NODE_ENV=production
DATABASE_URL=postgresql://neondb_owner:npg_2AHXUPy0dvuV@ep-summer-king-a926bt3n-pooler.gwc.azure.neon.tech/neondb?sslmode=require&channel_binding=require
JWT_SECRET=/gBquTmkMO4rAPU60o87EXa9RVXrP0fws1DAi2HsfVA=
ID_ENCRYPTION_KEY=YH+f+RLculWWlo0cH9czRbPhE0Nb3eo7/3lmjIE2z5E=
CORS_ORIGINS=https://localhost:3000
GEODB_BASE_URL=https://geodb-cities-api.wirefreethought.com
```

**How to add these in Render:**
1. Go to your Render service dashboard
2. Click on "Environment" tab
3. Click "Add Environment Variable"
4. Add each variable one by one using the Name and Value from above

### 2.4 Deploy
Click "Create Web Service" - Render will build and deploy automatically.
You'll get a URL like: `https://pairmeup-api.onrender.com`

### 2.5 Run Database Migrations
After successful deployment, run migrations:
```bash
# From your local machine, temporarily set DATABASE_URL
export DATABASE_URL="your-neon-connection-string"
cd apps/api
npx prisma migrate deploy
npx prisma db seed
```

## Step 3: Deploy Frontend to Vercel (5 minutes)

### 3.1 Install Vercel CLI
```bash
# On Linux/Mac, you may need sudo for global installs
sudo npm install -g vercel

# Verify installation
vercel --version
```

### 3.2 Deploy
```bash
cd /path/to/PairAgainNext
vercel login
vercel
```

When prompted:
- **Set up and deploy**: Yes
- **Which scope**: Your account
- **Link to existing project**: No (create new)
- **Project name**: `pairmeup-frontend`
- **Directory**: `./apps/web`
- **Override settings**: Yes if needed

### 3.3 Set Environment Variables
```bash
vercel env add NEXTAUTH_URL production
# Enter: https://your-vercel-app.vercel.app

vercel env add NEXTAUTH_SECRET production
# Enter: /VOFtyKTMe+jQKHcQsTTZeDoYmrpUFxZzAEsIP8xKdc=

vercel env add API_BASE_URL production  
# Enter: https://pairmeup-api.onrender.com
https://pairmeup.onrender.com

vercel env add DATABASE_URL production
# Enter: postgresql://neondb_owner:npg_2AHXUPy0dvuV@ep-summer-king-a926bt3n-pooler.gwc.azure.neon.tech/neondb?sslmode=require&channel_binding=require
```

### 3.4 Redeploy with Environment Variables
```bash
vercel --prod
```

## Step 4: Update CORS (2 minutes)

Now that you have your Vercel URL, update the CORS in Render:

1. Go to Render dashboard
2. Find your `pairmeup-api` service
3. Go to Environment tab
4. Update `CORS_ORIGINS` to your Vercel URL:
   ```
   https://your-vercel-app.vercel.app
   ```
5. Save - Render will auto-redeploy

## Step 5: Test Everything (5 minutes)

1. Visit your Vercel URL
2. Test marketplace functionality
3. Try brand filtering
4. Check that search works
5. Verify API calls are working

## Quick Reference

### Service URLs
- **Database**: Neon dashboard
- **API**: `https://pairmeup-api.onrender.com`
- **Frontend**: `https://your-vercel-app.vercel.app`

### Environment Variables Summary

| Service | Variable | Value |
|---------|----------|--------|
| Render | `DATABASE_URL` | Neon connection string |
| Render | `CORS_ORIGINS` | Vercel app URL |
| Vercel | `API_BASE_URL` | Render API URL |
| Vercel | `NEXTAUTH_URL` | Vercel app URL |

## Troubleshooting

### Common Issues:
1. **Build fails on Render**: Check that `apps/api/package.json` has correct scripts
2. **CORS errors**: Ensure CORS_ORIGINS matches your Vercel URL exactly
3. **Database connection**: Verify Neon connection string includes `?sslmode=require`
4. **API not responding**: Check Render logs for errors

### Getting Help:
- **Render logs**: Dashboard → Service → Logs tab
- **Vercel logs**: Dashboard → Functions tab
- **Neon status**: Dashboard → Operations tab

## Cost Breakdown (All Free!)
- **Neon**: 3GB database, 100 compute hours/month
- **Render**: 750 hours/month (enough for 24/7 API)
- **Vercel**: 100GB bandwidth, unlimited static deployments
- **Total**: $0/month for development and small production apps

This setup will handle thousands of users and is perfect for getting started!
