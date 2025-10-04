# 🚀 Deployment Guide - Fuel Tracker Pro

## 📱 How to Deploy Your App to Mobile

This guide will help you deploy your Fuel Tracker Pro app so you can use it on your mobile phone.

---

## ✅ Option 1: Vercel (RECOMMENDED - Easiest & Free)

### Why Vercel?
- ✅ **Completely FREE** tier
- ✅ **Automatic HTTPS** (required for PWA camera access)
- ✅ **Auto-deploys** from GitHub
- ✅ **Fast CDN** worldwide
- ✅ **Zero configuration** needed
- ✅ **Perfect for PWAs**

### Step-by-Step Deployment:

#### 1️⃣ Prepare Your Code

```bash
# Make sure all changes are committed
git add .
git commit -m "Ready for deployment"
```

#### 2️⃣ Push to GitHub

**If you haven't initialized git yet:**
```bash
# Initialize git (if not done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - Fuel Tracker Pro"

# Create a new repository on GitHub (https://github.com/new)
# Name it: fuel-tracker-pro

# Add remote and push
git remote add origin https://github.com/YOUR_USERNAME/fuel-tracker-pro.git
git branch -M main
git push -u origin main
```

**If you already have a GitHub repo:**
```bash
git push origin main
```

#### 3️⃣ Deploy to Vercel

**Method A: Using Vercel Website (Easiest)**

1. Go to **https://vercel.com**
2. Click **"Sign Up"** or **"Login"** (use GitHub account)
3. Click **"Add New Project"**
4. **Import** your `fuel-tracker-pro` repository from GitHub
5. Vercel **auto-detects** it's a Vite app ✅
6. Click **"Deploy"**
7. Wait 2-3 minutes ⏱️
8. **Done!** Your app is live! 🎉

**Method B: Using Vercel CLI**

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Follow prompts:
# - Set up and deploy? Yes
# - Which scope? Your account
# - Link to existing project? No
# - Project name? fuel-tracker-pro
# - Directory? ./
# - Override settings? No

# Deploy to production
vercel --prod
```

#### 4️⃣ Configure Environment Variables

**In Vercel Dashboard:**

1. Go to your project → **Settings** → **Environment Variables**
2. Add these variables:

```
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
API_NINJAS_KEY=your_api_ninjas_key
```

3. Click **Save**
4. **Redeploy** the project (Settings → Deployments → Redeploy)

#### 5️⃣ Access on Mobile

Your app is now live at:
```
https://fuel-tracker-pro.vercel.app
```

**On your phone:**
1. Open browser (Chrome/Safari)
2. Visit your Vercel URL
3. Use the app!
4. **Install as PWA:**
   - Chrome: Menu → "Add to Home Screen"
   - Safari: Share → "Add to Home Screen"

---

## ✅ Option 2: Netlify (Also Free & Easy)

### Step-by-Step:

#### 1️⃣ Push to GitHub
(Same as Vercel - see above)

#### 2️⃣ Deploy to Netlify

1. Go to **https://netlify.com**
2. Click **"Sign Up"** (use GitHub)
3. Click **"Add new site"** → **"Import an existing project"**
4. Select **GitHub** → Choose `fuel-tracker-pro`
5. **Build settings:**
   - Build command: `npm run build`
   - Publish directory: `dist`
6. Click **"Deploy"**

#### 3️⃣ Add Environment Variables

1. Site settings → **Environment variables**
2. Add all `VITE_*` variables (same as Vercel)
3. **Redeploy**

#### 4️⃣ Access on Mobile

Your app will be at:
```
https://fuel-tracker-pro.netlify.app
```

---

## ✅ Option 3: Firebase Hosting (Free)

### Step-by-Step:

#### 1️⃣ Install Firebase Tools

```bash
npm install -g firebase-tools
```

#### 2️⃣ Login to Firebase

```bash
firebase login
```

#### 3️⃣ Initialize Firebase Hosting

```bash
firebase init hosting

# Select:
# - Use existing project: fuel-tracker-pro
# - Public directory: dist
# - Single-page app: Yes
# - Overwrite index.html: No
# - Set up GitHub Actions: No
```

#### 4️⃣ Build Your App

```bash
npm run build
```

#### 5️⃣ Deploy

```bash
firebase deploy --only hosting
```

#### 6️⃣ Access on Mobile

Your app will be at:
```
https://your-project-id.web.app
```

---

## 📋 Pre-Deployment Checklist

### ✅ Before Deploying:

1. **Environment Variables Set**
   ```bash
   # Create .env file with all Firebase keys
   # .env should NOT be committed to git!
   ```

2. **Build Works Locally**
   ```bash
   npm run build
   npm run preview
   # Test at http://localhost:4173
   ```

3. **All Features Working**
   - ✅ Login/Register
   - ✅ Scan bills
   - ✅ Dashboard
   - ✅ History
   - ✅ Stations
   - ✅ Bike profile

4. **Git Repository Clean**
   ```bash
   git status
   # Should show "working tree clean"
   ```

5. **Firebase Console Configured**
   - ✅ Authorized domains added (your Vercel/Netlify URL)
   - ✅ Firestore indexes created

---

## 🔧 Post-Deployment Setup

### 1️⃣ Add Authorized Domains to Firebase

**Important for Authentication!**

1. Go to **Firebase Console**
2. **Authentication** → **Settings** → **Authorized domains**
3. Click **"Add domain"**
4. Add your deployment URL:
   ```
   fuel-tracker-pro.vercel.app
   OR
   fuel-tracker-pro.netlify.app
   ```
5. Click **"Add"**

### 2️⃣ Update CORS for API (if using server.js)

**Note:** Since your API is in `server.js`, you have two options:

**Option A: Deploy API Separately (Recommended)**

Deploy `server.js` to a serverless platform:
- Railway.app (free tier)
- Render.com (free tier)
- Fly.io (free tier)

**Option B: Convert to Serverless Functions**

Move API logic to Vercel/Netlify functions:
- Create `api/` directory
- Convert endpoints to serverless functions

### 3️⃣ Test on Mobile

1. **Open app on phone**
2. **Test all features:**
   - ✅ Login
   - ✅ Camera access for bill scanning
   - ✅ Save records
   - ✅ View history
3. **Install as PWA:**
   - Chrome: Menu → Add to Home Screen
   - Safari: Share → Add to Home Screen

---

## 📱 PWA Installation on Mobile

### Android (Chrome):

1. Open your app URL in Chrome
2. Tap **Menu (⋮)**
3. Tap **"Add to Home screen"**
4. Enter name: "Fuel Tracker Pro"
5. Tap **"Add"**
6. App icon appears on home screen! 📱

### iOS (Safari):

1. Open your app URL in Safari
2. Tap **Share button** (box with arrow)
3. Scroll and tap **"Add to Home Screen"**
4. Enter name: "Fuel Tracker Pro"
5. Tap **"Add"**
6. App icon appears on home screen! 📱

---

## 🐛 Troubleshooting

### Camera Not Working on Mobile

**Issue:** Camera doesn't open when scanning bills

**Solution:**
1. Make sure your app is served over **HTTPS** (Vercel/Netlify do this automatically)
2. Grant camera permissions in browser settings
3. Test in Chrome (better camera API support)

### Authentication Not Working

**Issue:** Can't login on deployed app

**Solution:**
1. Check Firebase Console → Authentication → Authorized domains
2. Make sure your Vercel/Netlify URL is added
3. Redeploy after adding domain

### Environment Variables Not Working

**Issue:** Firebase connection fails

**Solution:**
1. Double-check all `VITE_*` variables in Vercel/Netlify dashboard
2. Make sure they have `VITE_` prefix
3. Redeploy after adding variables

### Build Fails

**Issue:** Deployment fails during build

**Solution:**
```bash
# Test build locally first
npm run build

# Check for errors
# Fix any linting/TypeScript errors
# Commit and push again
```

---

## 🎯 Recommended Deployment Flow

### For First-Time Deployment:

```bash
# 1. Build locally to test
npm run build
npm run preview

# 2. Commit all changes
git add .
git commit -m "Ready for deployment"

# 3. Push to GitHub
git push origin main

# 4. Deploy to Vercel
# - Go to vercel.com
# - Import repository
# - Add environment variables
# - Deploy!

# 5. Add authorized domain to Firebase
# - Firebase Console → Authentication → Settings
# - Add: your-app.vercel.app

# 6. Test on mobile
# - Visit your Vercel URL
# - Test all features
# - Install as PWA
```

---

## 💰 Cost Breakdown (FREE Tier Limits)

### Vercel Free Tier:
- ✅ 100GB bandwidth/month
- ✅ Unlimited deployments
- ✅ Automatic HTTPS
- ✅ Custom domains
- ✅ Perfect for personal use!

### Netlify Free Tier:
- ✅ 100GB bandwidth/month
- ✅ 300 build minutes/month
- ✅ Automatic HTTPS
- ✅ Perfect for personal use!

### Firebase Free Tier:
- ✅ 10GB storage
- ✅ 50K reads/day
- ✅ 20K writes/day
- ✅ More than enough for personal use!

**Your entire app can run FREE!** 🎉

---

## 🚀 Quick Start (TL;DR)

```bash
# 1. Push to GitHub
git add .
git commit -m "Deploy"
git push origin main

# 2. Go to vercel.com
# 3. Import your repository
# 4. Add environment variables (VITE_FIREBASE_*)
# 5. Deploy (automatic)
# 6. Add your-app.vercel.app to Firebase authorized domains
# 7. Open on phone and install as PWA!
```

---

## 📖 Additional Resources

### Vercel Deployment:
https://vercel.com/docs

### Netlify Deployment:
https://docs.netlify.com

### Firebase Hosting:
https://firebase.google.com/docs/hosting

### PWA Installation:
https://web.dev/install-criteria/

---

## ✅ After Deployment Checklist

- [ ] App accessible on mobile browser
- [ ] Login/Register working
- [ ] Camera access for bill scanning
- [ ] All pages loading correctly
- [ ] Data saving to Firestore
- [ ] PWA installable on home screen
- [ ] Icon and name showing correctly
- [ ] All features functional offline (after first load)

---

**Your app is ready to use on mobile! 📱✨**

For any issues, refer to the troubleshooting section or check browser console for errors.

