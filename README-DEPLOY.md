Deployment automation & environment sync
=====================================

This document explains how the `scripts/deploy/sync_envs_and_redeploy.sh` script works and how to use it safely.

Purpose
- Sync `NEXT_PUBLIC_API_URL` and `API_BASE_URL` env vars across Vercel and Render
- Trigger a manual deploy on both platforms

Requirements
- jq (json parser) and curl
- vercel CLI (optional but recommended)
- Environment variables: VERCEL_TOKEN, RENDER_API_KEY, RENDER_SERVICE_ID
- Your Vercel project should be linked locally via `vercel link` or you can specify VERCEL_PROJECT

Usage example
--------------
Set environment variables then run the script:

```bash
export NEXT_PUBLIC_API_URL=https://pairmeup.onrender.com
export API_BASE_URL=https://pairmeup.onrender.com
export VERCEL_TOKEN=@your-vercel-token
export RENDER_API_KEY=@your-render-api-key
export RENDER_SERVICE_ID=@your-render-service-id
bash ./scripts/deploy/sync_envs_and_redeploy.sh
```

What the script does
--------------------
- For Vercel: uses the vercel CLI to `env add` both `NEXT_PUBLIC_API_URL` and `API_BASE_URL` (production scope), then triggers a production deployment of `apps/web`.
- For Render: uses the official Render REST API to create or update the environment variables for the service and triggers a manual deploy.

Warnings & best-practices
-------------------------
- Do not run this against a primary production project unless you intend to update production env vars.
- Keep your API keys secure: use a CI secret store (GitHub Actions secrets / Render / Vercel secrets).
- If you do not have the `vercel` CLI installed or prefer not to use it, the script prints the commands you should run manually.
