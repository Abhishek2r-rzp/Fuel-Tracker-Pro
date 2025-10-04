# 🚀 Quick Setup Guide

This guide will help you get Fuel Tracker Pro running in under 15 minutes.

## Step-by-Step Setup

### 1️⃣ Install Dependencies (2 minutes)

```bash
cd bill-reader
npm install
```

### 2️⃣ Create Firebase Project (5 minutes)

1. Go to https://console.firebase.google.com/
2. Click "Add project"
3. Enter project name: `fuel-tracker-pro`
4. Disable Google Analytics (optional)
5. Click "Create project"

**Enable Authentication:**
- In Firebase Console → Authentication → Sign-in method
- Enable "Email/Password"

**Enable Firestore:**
- In Firebase Console → Firestore Database
- Click "Create database"
- Choose "Start in test mode"
- Select your region

**Get Firebase Config:**
- Go to Project Settings (gear icon)
- Scroll to "Your apps" → Web
- Click "Add app" or use existing
- Copy the config values

### 3️⃣ Setup Google Cloud Vision API (5 minutes)

1. Go to https://console.cloud.google.com/
2. Select your Firebase project (or create new)
3. Search for "Cloud Vision API"
4. Click "Enable"
5. Go to "Credentials" → "Create Credentials" → "API Key"
6. Copy the API key
7. (Optional) Click "Restrict Key" → Select "Cloud Vision API"

### 4️⃣ Configure Environment Variables (2 minutes)

Create `.env` file in project root:

```bash
VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_AUTH_DOMAIN=fuel-tracker-pro.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=fuel-tracker-pro
VITE_FIREBASE_STORAGE_BUCKET=fuel-tracker-pro.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456:web:abc123

GOOGLE_CLOUD_VISION_API_KEY=AIza...
```

### 5️⃣ Run the App (1 minute)

```bash
npm run dev
```

Open http://localhost:3000

### 6️⃣ Deploy to Vercel (5 minutes)

**Option A: Deploy via CLI**
```bash
npm install -g vercel
vercel
# Follow the prompts
# Add environment variables when asked
```

**Option B: Deploy via Dashboard**
1. Go to https://vercel.com/
2. Click "New Project"
3. Import your Git repository
4. Add environment variables
5. Click "Deploy"

## 🎉 You're Done!

Your app is now running both locally and in production!

## Next Steps

1. **Test OCR**: 
   - Take a photo of a fuel bill
   - Verify data extraction works

2. **Add Your Bike**:
   - Go to "My Bike" section
   - Select your motorcycle model
   - Save profile

3. **Start Tracking**:
   - Scan your first fuel bill
   - View analytics on dashboard

## 🔧 Common Issues

**"Firebase not initialized"**
- Check `.env` file exists and has all variables
- Restart dev server after creating `.env`

**"OCR API not configured"**
- Verify `GOOGLE_CLOUD_VISION_API_KEY` is set
- Check API is enabled in Google Cloud Console

**PWA not installing**
- Works only on HTTPS or localhost
- Build and deploy to test installation

## 📚 Additional Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Google Cloud Vision API](https://cloud.google.com/vision/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [PWA Documentation](https://web.dev/progressive-web-apps/)

