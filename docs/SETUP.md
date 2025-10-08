# 🚀 Setup & Development Guide

Complete guide for setting up, developing, and deploying the Bill Reader monorepo.

---

## 📋 Table of Contents

1. [Quick Start](#quick-start)
2. [Prerequisites](#prerequisites)
3. [Installation](#installation)
4. [Development](#development)
5. [Firebase Setup](#firebase-setup)
6. [Deployment](#deployment)
7. [Environment Variables](#environment-variables)
8. [Troubleshooting](#troubleshooting)

---

## 🎯 Quick Start

```bash
# Clone and install
git clone <repository-url>
cd bill-reader
npm install

# Setup environment
cp env.template .env
# Edit .env with your Firebase credentials

# Start development
npm run dev
```

---

## 📦 Prerequisites

### Required:
- **Node.js**: v16+ (recommended: v18+)
- **npm**: v8+ or **pnpm**: v8+
- **Git**: Latest version
- **Firebase Account**: For backend services

### Optional:
- **Vercel CLI**: For deployment
- **VS Code**: Recommended editor

---

## 🔧 Installation

### 1. Clone Repository
```bash
git clone <repository-url>
cd bill-reader
```

### 2. Install Dependencies
```bash
# Using npm
npm install

# Or using pnpm (recommended for monorepo)
pnpm install
```

### 3. Setup Environment Variables
```bash
# Copy template
cp env.template .env

# Edit .env file with your credentials
nano .env
```

Required variables:
```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# Optional: API Keys
VITE_API_NINJAS_KEY=your_api_ninjas_key
```

### 4. Verify Installation
```bash
npm run lint
npm run build
```

---

## 🛠️ Development

### Start Development Server

```bash
# All apps
npm run dev

# Specific app only
npm run dev:expense
npm run dev:fuel
npm run dev:host
```

### Development URLs:
- **Host App**: http://localhost:3000
- **Expense Tracker**: http://localhost:3001
- **Fuel Tracker**: http://localhost:3002

### Project Structure
```
bill-reader/
├── apps/
│   ├── expense-tracker/    # Expense tracking app
│   ├── fuel-tracker/       # Fuel tracking app
│   └── host/               # Main host application
├── packages/
│   ├── shared-auth/        # Shared authentication
│   ├── shared-ui/          # Shared UI components
│   └── shared-utils/       # Shared utilities
├── docs/                   # Documentation
└── api/                    # API integrations
```

### Development Commands

```bash
# Linting
npm run lint              # Lint all packages
npm run lint:fix          # Auto-fix lint issues

# Formatting
npm run format            # Format with Prettier
npm run format:check      # Check formatting

# Building
npm run build             # Build all apps
npm run build:expense     # Build expense tracker
npm run build:fuel        # Build fuel tracker

# Testing (if configured)
npm test
```

### Development Tips

1. **Enable Feature Flags**
   - Edit `apps/*/src/config/features.js`
   - Toggle features for development

2. **Use Development Mode**
   - Faster builds
   - Hot module replacement
   - Source maps enabled

3. **Monitor Console**
   - Check for errors
   - Review network requests
   - Monitor Firebase queries

---

## 🔥 Firebase Setup

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project
3. Enable Authentication, Firestore, and Storage

### 2. Enable Authentication

```bash
# Enable Email/Password
Firebase Console → Authentication → Sign-in method → Email/Password → Enable

# Enable Google Sign-in (Optional)
Firebase Console → Authentication → Sign-in method → Google → Enable
```

### 3. Setup Firestore Database

```bash
# Create database
Firebase Console → Firestore Database → Create Database

# Mode: Production or Test (for development)
```

#### Create Indexes
```bash
# Deploy indexes
firebase deploy --only firestore:indexes

# Or manually create from firestore.indexes.json
```

#### Setup Security Rules
```bash
# Deploy rules
firebase deploy --only firestore:rules

# Or copy from firestore.rules
```

### 4. Setup Firebase Storage

```bash
# Enable Storage
Firebase Console → Storage → Get Started

# Deploy storage rules
firebase deploy --only storage

# Or use the deployment script
chmod +x deploy-storage-rules.sh
./deploy-storage-rules.sh
```

### 5. Configure Firestore Indexes

Required indexes for optimal performance:

**Expense Transactions:**
```
Collection: expenseTransactions
Fields: userId (ASC), date (DESC)
```

**Fuel Records:**
```
Collection: fuelRecords
Fields: userId (ASC), date (DESC)
```

**Statements:**
```
Collection: expenseStatements
Fields: userId (ASC), createdAt (DESC)
```

### 6. Setup Firebase in Project

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Initialize project
firebase init

# Select:
# - Firestore
# - Storage
# - Hosting (optional)
```

---

## 🚀 Deployment

### Deploy to Vercel (Recommended)

#### 1. Install Vercel CLI
```bash
npm install -g vercel
```

#### 2. Login to Vercel
```bash
vercel login
```

#### 3. Deploy
```bash
# First time deployment
vercel

# Production deployment
vercel --prod
```

#### 4. Configure Environment Variables

**Important:** Set environment variables in Vercel Dashboard, NOT in vercel.json

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add all variables from `.env`:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`

#### 5. Configure Authorized Domains

Add your Vercel domain to Firebase:
1. Firebase Console → Authentication → Settings → Authorized domains
2. Add: `your-app.vercel.app`

#### 6. Update vercel.json

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/" }
  ],
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

### Alternative: Deploy to Netlify

#### 1. Install Netlify CLI
```bash
npm install -g netlify-cli
```

#### 2. Login and Deploy
```bash
netlify login
netlify init
netlify deploy --prod
```

#### 3. Configure Build Settings

**netlify.toml:**
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
```

### Alternative: Deploy to Firebase Hosting

```bash
# Build the app
npm run build

# Deploy to Firebase
firebase deploy --only hosting

# Or deploy specific app
firebase deploy --only hosting:expense-tracker
```

---

## 🔐 Environment Variables

### Production Variables

**Never commit sensitive data!** Always use environment variables.

#### Required Variables:
```env
# Firebase - Get from Firebase Console
VITE_FIREBASE_API_KEY=your_key
VITE_FIREBASE_AUTH_DOMAIN=your_domain
VITE_FIREBASE_PROJECT_ID=your_project
VITE_FIREBASE_STORAGE_BUCKET=your_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender
VITE_FIREBASE_APP_ID=your_app_id
```

#### Optional Variables:
```env
# API Ninjas (for bike specs)
VITE_API_NINJAS_KEY=your_key

# Feature Flags
VITE_ENABLE_OCR=true
VITE_ENABLE_STATION_INFO=true
```

### How to Get Firebase Credentials

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Click ⚙️ → Project settings
4. Scroll to "Your apps" → Web app
5. Copy configuration values

---

## 🐛 Troubleshooting

### Common Issues

#### 1. Build Fails

**Error:** `Module not found`
```bash
# Solution: Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

**Error:** `Firebase not initialized`
```bash
# Solution: Check .env file
cat .env
# Verify all VITE_FIREBASE_* variables are set
```

#### 2. Authentication Issues

**Error:** `auth/unauthorized-domain`
```bash
# Solution: Add domain to Firebase
# Firebase Console → Authentication → Settings → Authorized domains
# Add: localhost, your-domain.com
```

**Error:** `auth/configuration-not-found`
```bash
# Solution: Enable authentication methods
# Firebase Console → Authentication → Sign-in method
# Enable Email/Password and Google
```

#### 3. Firestore Issues

**Error:** `Missing or insufficient permissions`
```bash
# Solution: Update Firestore rules
firebase deploy --only firestore:rules
```

**Error:** `The query requires an index`
```bash
# Solution: Create index
# Firebase Console → Firestore → Indexes
# Or deploy: firebase deploy --only firestore:indexes
```

#### 4. Storage Issues

**Error:** `storage/unauthorized`
```bash
# Solution: Update storage rules
firebase deploy --only storage
```

#### 5. Deployment Issues

**Error:** `Environment variable not found`
```bash
# Solution: Add to Vercel Dashboard
# Vercel → Project → Settings → Environment Variables
# NOT in vercel.json!
```

#### 6. Development Server Issues

**Error:** `Port already in use`
```bash
# Solution: Kill process or change port
lsof -ti:3000 | xargs kill
# Or change port in vite.config.js
```

### Performance Issues

#### Slow Build Times
```bash
# Clear Vite cache
rm -rf node_modules/.vite

# Use pnpm instead of npm
npm install -g pnpm
pnpm install
```

#### Slow Firestore Queries
```bash
# Create indexes
firebase deploy --only firestore:indexes

# Optimize queries (see ARCHITECTURE.md)
```

### Debug Mode

Enable detailed logging:

```javascript
// In main.jsx or App.jsx
if (import.meta.env.DEV) {
  console.log('🔧 Development mode enabled');
  console.log('Firebase config:', /* sanitized config */);
}
```

---

## 📚 Additional Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Vite Documentation](https://vitejs.dev)
- [React Documentation](https://react.dev)
- [Vercel Documentation](https://vercel.com/docs)

---

## 🔄 Git Hooks

Pre-commit hooks are configured to ensure code quality:

```bash
# Automatically runs on commit:
1. Prettier formatting
2. ESLint linting
3. Type checking (if configured)

# To bypass (not recommended):
git commit --no-verify
```

---

## 🎯 Next Steps

After setup:

1. ✅ Review [FEATURES.md](./FEATURES.md) - Learn about app features
2. ✅ Review [ARCHITECTURE.md](./ARCHITECTURE.md) - Understand the codebase
3. ✅ Review [CODE_QUALITY.md](./CODE_QUALITY.md) - Code standards

---

## 💡 Tips for Success

1. **Use Development Mode**
   - Faster iterations
   - Better error messages
   - Hot reload enabled

2. **Monitor Firebase Usage**
   - Check quotas regularly
   - Optimize queries
   - Use indexes

3. **Keep Dependencies Updated**
   ```bash
   npm outdated
   npm update
   ```

4. **Follow Code Standards**
   - Run `npm run lint` before commits
   - Use Prettier for formatting
   - Write clean, documented code

5. **Test Before Deploying**
   ```bash
   npm run build
   npm run preview
   ```

---

**Need help?** Check the troubleshooting section or create an issue in the repository.

