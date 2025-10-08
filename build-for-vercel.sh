#!/bin/bash
set -e

echo "📦 Installing dependencies..."
npm install

echo "🏗️  Building all apps..."
npm run build

echo "📁 Creating consolidated dist directory..."
rm -rf dist
mkdir -p dist

echo "📋 Copying host app to root..."
cp -r apps/host/dist/* dist/

echo "📋 Creating subdirectories for apps..."
mkdir -p dist/fuel-tracker
mkdir -p dist/expense-tracker

echo "📋 Copying fuel-tracker app..."
cp -r apps/fuel-tracker/dist/* dist/fuel-tracker/

echo "📋 Copying expense-tracker app..."
cp -r apps/expense-tracker/dist/* dist/expense-tracker/

echo "✅ Build completed! All apps consolidated in dist/"
ls -la dist/

