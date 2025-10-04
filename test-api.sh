#!/bin/bash

# Test script for API Ninjas integration
# Run this after starting the dev server

echo "🧪 Testing Bike API Integration..."
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: Get all makes
echo "${YELLOW}Test 1: Get all bike makes${NC}"
curl -s http://localhost:3001/api/bikes/makes | json_pp
echo ""

# Test 2: Get Honda models
echo "${YELLOW}Test 2: Get Honda models${NC}"
curl -s http://localhost:3001/api/bikes/models/Honda | head -50
echo ""

# Test 3: Get CB Shine details
echo "${YELLOW}Test 3: Get Honda CB Shine details${NC}"
curl -s "http://localhost:3001/api/bikes/details/Honda/CB%20Shine" | json_pp
echo ""

# Test 4: Get Royal Enfield Classic details
echo "${YELLOW}Test 4: Get Royal Enfield Classic 350 details${NC}"
curl -s "http://localhost:3001/api/bikes/details/Royal%20Enfield/Classic%20350" | json_pp
echo ""

echo "${GREEN}✅ Tests complete!${NC}"

