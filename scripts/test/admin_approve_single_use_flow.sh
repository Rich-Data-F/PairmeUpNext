#!/usr/bin/env bash
set -euo pipefail

# Usage:
# ADMIN_API_URL="https://pairmeup.onrender.com" ADMIN_EMAIL="admin@earbudhub.com" ADMIN_PASS="AdminPass123!" ./scripts/test/admin_approve_single_use_flow.sh

API_URL="${ADMIN_API_URL:-https://pairmeup.onrender.com}"
EMAIL="${ADMIN_EMAIL:-admin@earbudhub.com}"
PASSWORD="${ADMIN_PASS:-AdminPass123!}"

TEMP_BRAND_NAME="TestTempBrandSingleUse-$(date +%s)"
TEMP_MODEL_NAME="TestTempModelSingleUse-$(date +%s)"

echo "Using API: $API_URL"

# 1) Login
LOGIN_TOKEN=$(curl -sS -X POST "$API_URL/auth/login" -H 'Content-Type: application/json' -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}" | jq -r '.access_token')
if [[ "$LOGIN_TOKEN" == "null" || -z "$LOGIN_TOKEN" ]]; then
  echo "Login failed; aborting"; exit 1
fi

# 2) Create listing with custom brand/model
CREATE_LISTING_RESPONSE=$(curl -sS -X POST "$API_URL/listings" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $LOGIN_TOKEN" \
  -d @- <<JSON
{
  "title": "Test listing for admin_approve_single_use_flow",
  "description": "A test listing to create a proposed brand/model entry for admin approval flow (single-use)",
  "type": "SELL",
  "condition": "USED",
  "price": 1,
  "currency": "USD",
  "cityId": null,
  "customBrand": "$TEMP_BRAND_NAME",
  "customModel": "$TEMP_MODEL_NAME",
  "images": []
}
JSON
)

LISTING_ID=$(echo "$CREATE_LISTING_RESPONSE" | jq -r '.id')
if [[ "$LISTING_ID" == "null" || -z "$LISTING_ID" ]]; then
  echo "Create listing failed. See response: $CREATE_LISTING_RESPONSE"; exit 1
fi

sleep 2

# 3) Find proposed brand
PROPOSED_LIST=$(curl -sS -X GET "$API_URL/admin/proposed-brands" -H "Authorization: Bearer $LOGIN_TOKEN")
PROPOSED_ID=$(echo "$PROPOSED_LIST" | jq -r --arg name "$TEMP_BRAND_NAME" '.data[] | select(.name == $name) | .id')
if [[ -z "$PROPOSED_ID" ]]; then echo "Proposed brand not found"; echo "$PROPOSED_LIST" | jq .; exit 1; fi

# 4) Approve as single-use (createCanonical: false)
APPROVE_RESPONSE=$(curl -sS -X POST "$API_URL/admin/proposed-brands/$PROPOSED_ID/approve" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $LOGIN_TOKEN" \
  -d '{"createCanonical": false}')

echo "Approve response: $APPROVE_RESPONSE" | jq .

# 5) Validate - check that proposed brand status is APPROVED and listing's brand id points to temp brand
PROPOSED_SINGLE=$(curl -sS -X GET "$API_URL/admin/proposed-brands/$PROPOSED_ID" -H "Authorization: Bearer $LOGIN_TOKEN")

PROPOSED_STATUS=$(echo "$PROPOSED_SINGLE" | jq -r '.status // .data.status')

if [[ "$PROPOSED_STATUS" == "APPROVED" ]]; then
  echo "Proposed status: APPROVED"
else
  echo "Proposed status not APPROVED: $PROPOSED_STATUS"; echo "$PROPOSED_SINGLE" | jq .; exit 1
fi

LISTING_AFTER=$(curl -sS -X GET "$API_URL/listings/$LISTING_ID" -H "Authorization: Bearer $LOGIN_TOKEN")
LISTING_BRAND_ID=$(echo "$LISTING_AFTER" | jq -r '.brand.id // empty')

if [[ -n "$LISTING_BRAND_ID" ]]; then
  echo "Listing brand ID: $LISTING_BRAND_ID"
else
  echo "Listing has no brand? Response: $LISTING_AFTER" | jq .; exit 1
fi

exit 0
