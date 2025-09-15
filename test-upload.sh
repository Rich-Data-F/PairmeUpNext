#!/bin/bash

# Test script for upload functionality
echo "🧪 Testing File Upload System"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

API_URL="http://localhost:4000"

echo -e "\n${YELLOW}1. Creating test user and getting auth token...${NC}"

# Register a test user
REGISTER_RESPONSE=$(curl -s -X POST "$API_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testupload@example.com",
    "password": "TestPass123!",
    "firstName": "Test",
    "lastName": "Upload",
    "phoneNumber": "555-1234"
  }')

echo "Register response: $REGISTER_RESPONSE"

# Login to get token
LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testupload@example.com",
    "password": "TestPass123!"
  }')

TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo -e "${RED}❌ Failed to get auth token${NC}"
  echo "Login response: $LOGIN_RESPONSE"
  exit 1
fi

echo -e "${GREEN}✅ Got auth token: ${TOKEN:0:20}...${NC}"

echo -e "\n${YELLOW}2. Creating test image...${NC}"

# Create a simple test image using ImageMagick (if available) or download one
if command -v convert &> /dev/null; then
  convert -size 300x200 xc:skyblue -font Arial -pointsize 20 -fill black -gravity center -annotate +0+0 "Test Upload" test-image.jpg
  echo -e "${GREEN}✅ Created test image with ImageMagick${NC}"
elif command -v curl &> /dev/null; then
  # Download a small test image
  curl -s "https://picsum.photos/300/200" -o test-image.jpg
  echo -e "${GREEN}✅ Downloaded test image${NC}"
else
  echo -e "${RED}❌ Cannot create test image. Install ImageMagick or ensure curl is available${NC}"
  exit 1
fi

echo -e "\n${YELLOW}3. Testing image upload...${NC}"

UPLOAD_RESPONSE=$(curl -s -X POST "$API_URL/upload/image?category=listing" \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@test-image.jpg")

echo "Upload response: $UPLOAD_RESPONSE"

# Extract file ID from response
FILE_ID=$(echo "$UPLOAD_RESPONSE" | grep -o '"id":"[^"]*"' | cut -d'"' -f4)

if [ -z "$FILE_ID" ]; then
  echo -e "${RED}❌ Failed to upload image${NC}"
  exit 1
fi

echo -e "${GREEN}✅ Image uploaded successfully! File ID: $FILE_ID${NC}"

echo -e "\n${YELLOW}4. Testing image retrieval...${NC}"

# Test getting the uploaded image
curl -s -o downloaded-image.jpg "$API_URL/upload/image/$FILE_ID"

if [ -f "downloaded-image.jpg" ] && [ -s "downloaded-image.jpg" ]; then
  echo -e "${GREEN}✅ Image retrieval successful${NC}"
  file downloaded-image.jpg
else
  echo -e "${RED}❌ Failed to retrieve image${NC}"
fi

echo -e "\n${YELLOW}5. Testing thumbnail retrieval...${NC}"

# Test getting thumbnail
curl -s -o thumbnail-image.jpg "$API_URL/upload/thumbnail/$FILE_ID?size=medium"

if [ -f "thumbnail-image.jpg" ] && [ -s "thumbnail-image.jpg" ]; then
  echo -e "${GREEN}✅ Thumbnail retrieval successful${NC}"
  file thumbnail-image.jpg
else
  echo -e "${RED}❌ Failed to retrieve thumbnail${NC}"
fi

echo -e "\n${YELLOW}6. Testing user files listing...${NC}"

# Get user ID from token (this is a simple approach, in real app you'd decode JWT)
USER_FILES_RESPONSE=$(curl -s -H "Authorization: Bearer $TOKEN" "$API_URL/auth/profile")
USER_ID=$(echo "$USER_FILES_RESPONSE" | grep -o '"id":"[^"]*"' | cut -d'"' -f4)

if [ ! -z "$USER_ID" ]; then
  FILES_LIST=$(curl -s -H "Authorization: Bearer $TOKEN" "$API_URL/upload/user/$USER_ID")
  echo "User files: $FILES_LIST"
  echo -e "${GREEN}✅ User files listing successful${NC}"
else
  echo -e "${RED}❌ Failed to get user ID${NC}"
fi

echo -e "\n${YELLOW}7. Testing file deletion...${NC}"

DELETE_RESPONSE=$(curl -s -X DELETE "$API_URL/upload/image/$FILE_ID" \
  -H "Authorization: Bearer $TOKEN")

echo "Delete response: $DELETE_RESPONSE"

if echo "$DELETE_RESPONSE" | grep -q "success.*true"; then
  echo -e "${GREEN}✅ File deletion successful${NC}"
else
  echo -e "${RED}❌ Failed to delete file${NC}"
fi

# Cleanup
rm -f test-image.jpg downloaded-image.jpg thumbnail-image.jpg

echo -e "\n${GREEN}🎉 Upload system test completed!${NC}"
