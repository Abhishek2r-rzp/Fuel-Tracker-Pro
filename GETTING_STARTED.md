# 🚀 Getting Started with Fuel Tracker Pro

Welcome! This guide will help you get your Fuel Tracker Pro app up and running in **15 minutes**.

## 📋 What You'll Need

Before starting, create these free accounts:
1. **Firebase Account**: https://firebase.google.com/
2. **Google Cloud Account**: https://console.cloud.google.com/
3. **GitHub Account** (optional): For deployment
4. **Vercel or Netlify Account** (optional): For hosting

## 🎯 Quick Start (5 Steps)

### Step 1: Install Dependencies

```bash
cd bill-reader
npm install
```

⏱️ **Time: 2-3 minutes**

---

### Step 2: Setup Firebase

#### 2.1 Create Firebase Project

1. Go to https://console.firebase.google.com/
2. Click **"Add project"**
3. Enter project name: `fuel-tracker-pro`
4. Disable Google Analytics (or keep it enabled)
5. Click **"Create project"**

#### 2.2 Enable Authentication

1. In Firebase Console → **Authentication**
2. Click **"Get started"**
3. Click **"Email/Password"** tab
4. Toggle **Enable**
5. Click **"Save"**

#### 2.3 Create Firestore Database

1. In Firebase Console → **Firestore Database**
2. Click **"Create database"**
3. Select **"Start in test mode"** (we'll add security rules later)
4. Choose your location (closest to your users)
5. Click **"Enable"**

#### 2.4 Get Firebase Configuration

1. Go to **Project Settings** (gear icon)
2. Scroll to **"Your apps"**
3. Click the **Web icon** (`</>`)
4. Register app name: `fuel-tracker-pro`
5. **Copy the config object** - you'll need this!

It looks like:
```javascript
{
  apiKey: "AIzaSy...",
  authDomain: "fuel-tracker-pro.firebaseapp.com",
  projectId: "fuel-tracker-pro",
  storageBucket: "fuel-tracker-pro.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456:web:abc123..."
}
```

⏱️ **Time: 3-4 minutes**

---

### Step 3: Setup Google Cloud Vision API

#### 3.1 Enable Vision API

1. Go to https://console.cloud.google.com/
2. Select your Firebase project (or create new project)
3. In search bar, type: **"Cloud Vision API"**
4. Click **"Enable"**
5. Wait for activation (~30 seconds)

#### 3.2 Create API Key

1. Go to **"APIs & Services"** → **"Credentials"**
2. Click **"Create Credentials"** → **"API Key"**
3. **Copy the API key** immediately!
4. (Recommended) Click **"Restrict Key"**:
   - Application restrictions: None (or HTTP referrers if you know your domain)
   - API restrictions: Select **"Cloud Vision API"**
   - Click **"Save"**

⏱️ **Time: 3-4 minutes**

---

### Step 4: Configure Environment Variables

#### 4.1 Create .env File

In the `bill-reader` folder, copy the template:

```bash
cp env.template .env
```

Or manually create a file named `.env`

#### 4.2 Fill in Your Credentials

Open `.env` and paste your values:

```bash
# From Firebase Config (Step 2.4)
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=fuel-tracker-pro.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=fuel-tracker-pro
VITE_FIREBASE_STORAGE_BUCKET=fuel-tracker-pro.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456:web:abc123...

# From Google Cloud (Step 3.2)
GOOGLE_CLOUD_VISION_API_KEY=AIzaSy...
```

⚠️ **Important**: Make sure to use `VITE_` prefix for frontend variables!

⏱️ **Time: 2 minutes**

---

### Step 5: Run the App

```bash
npm run dev
```

Open your browser to: **http://localhost:3000**

You should see the login page! 🎉

⏱️ **Time: 1 minute**

---

## ✅ Testing Your Setup

### Test 1: User Registration

1. Click **"Sign Up"**
2. Enter email and password
3. Click **"Sign Up"**
4. ✅ You should be redirected to the dashboard

### Test 2: Add Bike Profile

1. Click **"My Bike"** in navigation
2. Select a bike make (e.g., "Honda")
3. Select a model (e.g., "CB Shine")
4. Enter year (e.g., "2023")
5. Click **"Save Bike Profile"**
6. ✅ You should see a success message

### Test 3: Manual Fuel Entry

Since OCR requires deployment, test manual entry first:

1. Click **"Scan Bill"**
2. Fill in the form manually:
   - Date: Today
   - Fuel Volume: 5 liters
   - Amount: 500
   - Odometer: 1000 km
3. Click **"Save Fuel Record"**
4. ✅ You should be redirected to dashboard with your record

### Test 4: View Analytics

1. Go to **Dashboard**
2. ✅ You should see your fuel record
3. Add 2-3 more records with different odometer readings
4. ✅ Dashboard should show mileage calculations and charts

---

## 🎨 Generate PWA Icons (Optional but Recommended)

Your app needs icons for installation. Here's the easiest way:

### Quick Method: Use PWA Asset Generator

1. Go to: https://www.pwabuilder.com/imageGenerator
2. Upload a logo (1024x1024 recommended)
3. Download the generated pack
4. Extract all icons to: `public/icons/`

### Alternative: Online Tool

1. Use: https://realfavicongenerator.net/
2. Upload your logo
3. Generate all icons
4. Download and place in `public/icons/`

⏱️ **Time: 5 minutes**

---

## 🚀 Deploy to Production (Optional)

### Option A: Deploy to Vercel (Recommended)

#### Via Vercel Website

1. Go to https://vercel.com/
2. Sign up with GitHub
3. Click **"New Project"**
4. Import your repository
5. Configure:
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
6. Add environment variables:
   - Click **"Environment Variables"**
   - Add all variables from your `.env` file
7. Click **"Deploy"**
8. ✅ Your app is live!

⏱️ **Time: 5 minutes**

#### Via Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel

# Add environment variables (one by one)
vercel env add VITE_FIREBASE_API_KEY production
vercel env add VITE_FIREBASE_AUTH_DOMAIN production
# ... add all variables

# Deploy to production
vercel --prod
```

### Option B: Deploy to Netlify

1. Go to https://netlify.com/
2. Sign up with GitHub
3. Click **"Add new site"** → **"Import an existing project"**
4. Connect to your Git repository
5. Configure:
   - Build command: `npm run build`
   - Publish directory: `dist`
6. Add environment variables in **Site settings**
7. Click **"Deploy site"**
8. ✅ Your app is live!

---

## 🔐 Update Security Rules (Important for Production)

After deployment, update your Firestore security rules:

1. Go to Firebase Console → **Firestore Database** → **Rules**
2. Copy content from `firestore.rules` file
3. Paste into the rules editor
4. Click **"Publish"**

This ensures users can only access their own data.

---

## 🎓 Next Steps

### Learn the Features

1. **Scan Bills**: Use OCR to extract data from receipts
2. **Track History**: Filter and search your fuel records
3. **View Analytics**: See mileage trends and cost analysis
4. **Manage Bike**: Update motorcycle specifications

### Customize Your App

1. **Change Colors**: Edit `tailwind.config.js`
2. **Add Bikes**: Update `src/data/bikeDatabase.json`
3. **Modify Theme**: Edit `vite.config.js` manifest section

### Monitor Usage

Keep track of free tier limits:
- **Google Cloud Vision**: 1,000 requests/month
- **Firebase**: 50,000 reads/day, 20,000 writes/day

Set up billing alerts at 80% usage!

---

## 🐛 Troubleshooting

### "Firebase: Error (auth/...)"

**Solution**: Check your Firebase configuration in `.env`
```bash
# Make sure you have VITE_ prefix
VITE_FIREBASE_API_KEY=...
```

### "OCR API not configured"

**Solution**: 
1. Check `GOOGLE_CLOUD_VISION_API_KEY` in `.env`
2. Verify API is enabled in Google Cloud Console
3. Restart your dev server

### "Permission denied" in Firestore

**Solution**:
1. Go to Firebase Console → Firestore → Rules
2. Temporarily set to test mode:
```javascript
allow read, write: if request.time < timestamp.date(2025, 12, 31);
```
3. Later, use production rules from `firestore.rules`

### PWA not installing

**Solution**:
- PWA only works on HTTPS or localhost
- Build and deploy to test installation
- Check manifest in browser DevTools

### Dev server won't start

**Solution**:
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
npm run dev
```

---

## 📚 Documentation

- **README.md**: Complete project documentation
- **PROJECT_SUMMARY.md**: Technical overview
- **DEPLOYMENT_CHECKLIST.md**: Pre-deployment guide
- **SETUP_GUIDE.md**: Alternative setup instructions

---

## 🎉 Success!

You now have a fully functional fuel tracking PWA!

**Test it out:**
1. ✅ Register a new account
2. ✅ Add your motorcycle
3. ✅ Log your first fuel-up
4. ✅ View your analytics

**Share it:**
- Install it on your phone
- Share with fellow riders
- Track your fuel efficiency

---

## 💡 Tips

1. **Regular Backups**: Export your Firestore data periodically
2. **Monitor Costs**: Set up billing alerts in Google Cloud
3. **Security**: Use strong passwords for Firebase/Google Cloud
4. **Updates**: Keep dependencies updated with `npm update`
5. **Testing**: Test OCR with various bill formats

---

**Need help?** Check the troubleshooting section or review the documentation files.

**Happy tracking!** 🏍️⛽📊

