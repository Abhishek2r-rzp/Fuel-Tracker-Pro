#!/bin/bash

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║   🚀 Firebase Storage Rules Deployment Script               ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# Step 1: Login
echo "📝 Step 1: Logging into Firebase..."
firebase login

# Step 2: Initialize Firebase project
echo ""
echo "📝 Step 2: Initializing Firebase project..."
firebase init storage --project fuel-tracker-pro-e11be

# Step 3: Deploy storage rules
echo ""
echo "📝 Step 3: Deploying storage rules..."
firebase deploy --only storage --project fuel-tracker-pro-e11be

echo ""
echo "✅ Done! Storage rules deployed successfully!"
echo "🎉 You can now upload images in your app!"

