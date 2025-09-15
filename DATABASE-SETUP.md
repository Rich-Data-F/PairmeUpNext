# Alternative Database Setup with Neon

Since Railway free plan has resource limits, we'll use Neon for the PostgreSQL database.

## 1. Create Neon Account

1. Go to https://neon.tech
2. Sign up with GitHub (recommended)
3. Create a new project called "pairmeup-db"

## 2. Get Database Connection String

After creating the project, Neon will provide you with a connection string like:
```
postgresql://username:password@ep-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require
```

## 3. Update Environment Variables

### For Local Development (.env):
```bash
DATABASE_URL="postgresql://username:password@ep-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require"
```

### For Render (Production API):
Set the DATABASE_URL environment variable in Render dashboard

### For Vercel (Frontend):
Set the DATABASE_URL environment variable in Vercel dashboard

## 4. Run Migrations

```bash
# From the packages/db directory
npx prisma migrate deploy
npx prisma db seed
```

## Alternative: Use Existing Railway Database

If you prefer to use your existing Railway PostgreSQL:

1. Connect to your existing Railway database
2. Create a separate database for PairMeUp:
   ```sql
   CREATE DATABASE pairmeup;
   ```
3. Update the DATABASE_URL to point to the new database:
   ```
   postgresql://username:password@host:port/pairmeup
   ```

## Benefits of Neon:
- ✅ 3GB free storage (more than Railway)
- ✅ PostgreSQL compatible
- ✅ Automatic scaling
- ✅ Built-in connection pooling
- ✅ Branching (database git-like features)
- ✅ No resource conflicts with existing projects
