#!/usr/bin/env bash
set -euo pipefail

# sync_envs_and_redeploy.sh
# Script: Update Vercel/Render environment variables and trigger a redeploy
# Usage:
#   VERCEL_TOKEN=<token> RENDER_API_KEY=<key> RENDER_SERVICE_ID=<id> NEXT_PUBLIC_API_URL=<url> bash ./scripts/deploy/sync_envs_and_redeploy.sh
#+ Optional args: --vercel-project=<project-id> --vercel-org=<org> --vercel-team=<teamId>

print_usage() {
  cat <<'USAGE'
Usage:
  VERCEL_TOKEN=<token> RENDER_API_KEY=<key> RENDER_SERVICE_ID=<id> NEXT_PUBLIC_API_URL=<url> bash ./scripts/deploy/sync_envs_and_redeploy.sh

This script will:
  1. Ensure NEXT_PUBLIC_API_URL and API_BASE_URL are set in Vercel for the `apps/web` project
  2. Ensure NEXT_PUBLIC_API_URL and API_BASE_URL are set in Render for the API service
  3. Trigger a redeploy on both platforms

Notes:
  - You must have the `vercel` CLI installed and authenticated (or supply VERCEL_TOKEN)
  - You must supply a RENDER_API_KEY (Render Dashboard -> Account -> API Keys) and RENDER_SERVICE_ID
  - This script uses the Render REST API and the Vercel CLI
  - This script requires `jq` and `curl`
USAGE
}

if [ "$#" -gt 0 ]; then
  case "$1" in
    -h|--help) print_usage; exit 0;;
    *) echo "Unknown argument: $1"; print_usage; exit 1;;
  esac
fi

if ! command -v jq >/dev/null 2>&1; then
  echo "Please install jq (sudo apt install jq) to use this script." >&2
  exit 1
fi

# Read environment values
VERCEL_TOKEN=${VERCEL_TOKEN:-}
RENDER_API_KEY=${RENDER_API_KEY:-}
RENDER_SERVICE_ID=${RENDER_SERVICE_ID:-}
NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL:-}
API_BASE_URL=${API_BASE_URL:-$NEXT_PUBLIC_API_URL}
VercelProject=${VERCEL_PROJECT:-}

if [ -z "$NEXT_PUBLIC_API_URL" ]; then
  echo "ERROR: NEXT_PUBLIC_API_URL must be supplied as an environment variable." >&2
  exit 1
fi

echo "▶ Using NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL"

################################################################################
# Step 1: Update Vercel environment variables (using Vercel CLI if available)
################################################################################
update_vercel_env() {
  echo "\n--- Vercel: updating env vars ---"
  if command -v vercel >/dev/null 2>&1; then
    if [ -n "$VERCEL_TOKEN" ]; then
      export VERCEL_TOKEN
    fi

    if [ -z "$VercelProject" ]; then
      echo "Please set VERCEL_PROJECT or VERCEL_PROJECT environment variable to your Vercel project id/name." >&2
      echo "Attempting to set via vercel CLI's current link..."
    fi

    set -x
    # Add or update NEXT_PUBLIC_API_URL
    # Add or update NEXT_PUBLIC_API_URL
    vercel env add NEXT_PUBLIC_API_URL "$NEXT_PUBLIC_API_URL" production || true
    # Add or update API_BASE_URL
    vercel env add API_BASE_URL "$API_BASE_URL" production || true
    set +x
    echo "Vercel: env vars added (or already present). Deploying..."
    REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
    if [ -d "$REPO_ROOT/apps/web" ]; then
      (cd "$REPO_ROOT/apps/web" && vercel --prod --confirm) || (echo "Vercel CLI deployment reported an error; please check your auth and try again." >&2)
    else
      echo "Warning: could not locate apps/web relative to repository root ($REPO_ROOT). Skipping vercel deploy." >&2
    fi
  else
    echo "Vercel CLI not found. Please install it and login (npm i -g vercel)." >&2
    echo "Skipping Vercel updates. You can run the following manually:"
    echo "vercel env add NEXT_PUBLIC_API_URL $NEXT_PUBLIC_API_URL production"
    echo "vercel env add API_BASE_URL $API_BASE_URL production"
    echo "cd apps/web && vercel --prod"
  fi
}

################################################################################
# Step 2: Update Render environment variables via Render API and trigger deploy
################################################################################
update_render_env() {
  if [ -z "$RENDER_API_KEY" ] || [ -z "$RENDER_SERVICE_ID" ]; then
    echo "Skipping Render updates: RENDER_API_KEY and/or RENDER_SERVICE_ID not set." >&2
    return
  fi

  echo "\n--- Render: updating env vars ---"
  HEADER_AUTH="Authorization: Bearer $RENDER_API_KEY"

  # Helper to find existing var id
  find_var() {
    local name="$1"
    curl -s -H "$HEADER_AUTH" "https://api.render.com/v1/services/$RENDER_SERVICE_ID/env-vars" | jq -r --arg name "$name" '.[] | select(.key == $name) | .id' | head -n1
  }

  for key in NEXT_PUBLIC_API_URL API_BASE_URL; do
    value=${!key}
    if [ -z "$value" ]; then
      echo "Skipping $key empty value"
      continue
    fi
    envId=$(find_var "$key")
    if [ -n "$envId" ] && [ "$envId" != "null" ]; then
      echo "Updating Render env var $key (id: $envId)"
      curl -s -X PATCH -H "$HEADER_AUTH" -H "Content-Type: application/json" \
        -d "{\"key\": \"$key\", \"value\": \"$value\", \"isSecret\": false}" \
        "https://api.render.com/v1/services/$RENDER_SERVICE_ID/env-vars/$envId" | jq -C '.'
    else
      echo "Creating Render env var $key"
      curl -s -X POST -H "$HEADER_AUTH" -H "Content-Type: application/json" \
        -d "{\"key\": \"$key\", \"value\": \"$value\", \"isSecret\": false}" \
        "https://api.render.com/v1/services/$RENDER_SERVICE_ID/env-vars" | jq -C '.'
    fi
  done

  echo "Triggering Render manual deploy..."
  # Trigger a deploy
  curl -s -X POST -H "$HEADER_AUTH" "https://api.render.com/v1/services/$RENDER_SERVICE_ID/deploys" | jq -C '.'
}

main() {
  echo "Starting sync of envs and redeploy..."
  update_vercel_env
  update_render_env
  echo "Done. Check Vercel and Render logs to see deployments finish." 
}

main
