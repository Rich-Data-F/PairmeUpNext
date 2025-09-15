# Neon PostgreSQL Setup for PairMeUp

## 1. Create Neon Account and Database

1. Go to https://neon.tech
2. Sign up with your GitHub account
3. Create a new project called "pairmeup-db"
4. Choose region closest to you
5. Copy the connection string

## 2. Database Connection String Format

Your Neon connection string will look like:
```
postgresql://username:password@ep-abc123.us-east-1.aws.neon.tech/dbname?sslmode=require
```

## 3. Environment Variables

Use this connection string in:
- Railway (for the API backend)
- Vercel (for any frontend database operations)

## 4. Prisma Configuration

Your `DATABASE_URL` in environment variables should be the Neon connection string.

## 5. Running Migrations

After deployment, run:
```bash
npx prisma migrate deploy
npx prisma db seed
```

This can be done from your local machine pointing to the Neon database, or from Railway after deployment.
