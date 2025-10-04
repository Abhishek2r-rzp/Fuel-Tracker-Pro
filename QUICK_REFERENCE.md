# ⚡ Quick Reference Card

Fast access to common commands and configurations for Fuel Tracker Pro.

## 🚀 Essential Commands

```bash
# Development
npm install              # Install dependencies
npm run dev             # Start dev server (localhost:3000)
npm run build           # Build for production
npm run preview         # Preview production build
npm run lint            # Run ESLint

# Deployment
vercel                  # Deploy to Vercel
netlify deploy --prod   # Deploy to Netlify
```

## 🔧 Environment Variables

```bash
# Required in .env file
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
GOOGLE_CLOUD_VISION_API_KEY=
```

## 📁 Key Files

| File | Purpose |
|------|---------|
| `src/App.jsx` | Main routing |
| `src/pages/Dashboard.jsx` | Analytics |
| `src/pages/ScanBill.jsx` | OCR scanning |
| `api/ocr.js` | OCR endpoint |
| `vite.config.js` | PWA config |
| `firestore.rules` | Security rules |
| `src/data/bikeDatabase.json` | Bike data |

## 🗺️ Routes

| Path | Component | Purpose |
|------|-----------|---------|
| `/login` | Login | User login |
| `/register` | Register | User signup |
| `/` | Dashboard | Analytics & stats |
| `/scan` | ScanBill | Bill scanning |
| `/history` | FuelHistory | Records list |
| `/bike` | BikeProfile | Bike settings |

## 🎨 Tailwind Classes

```css
/* Custom classes in index.css */
.btn-primary        /* Primary button */
.btn-secondary      /* Secondary button */
.input-field        /* Form input */
.card               /* Card container */
```

## 📊 Firestore Collections

```javascript
// fuelRecords
{
  userId, date, amount, fuelVolume, 
  odometerReading, fuelType, createdAt
}

// bikeProfiles
{
  userId, make, model, year, engineCapacity,
  fuelCapacity, mileageStandard, fuelType
}
```

## 🔌 API Endpoint

```javascript
POST /api/ocr
Body: { image: "base64_string" }
Response: { date, time, amount, fuelVolume }
```

## 🔐 Security Rules Template

```javascript
// Apply in Firebase Console
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /fuelRecords/{recordId} {
      allow read, write: if request.auth.uid == resource.data.userId;
    }
    match /bikeProfiles/{userId} {
      allow read, write: if request.auth.uid == userId;
    }
  }
}
```

## 📱 PWA Manifest Location

```javascript
// Configured in vite.config.js
{
  name: 'Fuel Tracker Pro',
  short_name: 'FuelTracker',
  theme_color: '#1e40af',
  display: 'standalone'
}
```

## 🐛 Quick Fixes

### Firebase Auth Error
```bash
# Check .env has VITE_ prefix
# Restart dev server
npm run dev
```

### OCR Not Working
```bash
# Verify API key in .env
GOOGLE_CLOUD_VISION_API_KEY=your_key
# Check API is enabled in Google Cloud Console
```

### Build Error
```bash
# Clear cache and rebuild
rm -rf node_modules package-lock.json
npm install
npm run build
```

### PWA Not Installing
```bash
# Must be on HTTPS or localhost
# Check icons exist in public/icons/
# Verify manifest in vite.config.js
```

## 📦 Add New Bike Brand

Edit `src/data/bikeDatabase.json`:

```json
{
  "BrandName": [
    {
      "model": "Model Name",
      "engineCapacity": "150",
      "fuelCapacity": "12",
      "mileageStandard": "45",
      "fuelType": "Petrol"
    }
  ]
}
```

## 🎯 Firebase Console Links

- **Authentication**: https://console.firebase.google.com/project/_/authentication
- **Firestore**: https://console.firebase.google.com/project/_/firestore
- **Settings**: https://console.firebase.google.com/project/_/settings/general

## ☁️ Google Cloud Console

- **APIs**: https://console.cloud.google.com/apis/dashboard
- **Credentials**: https://console.cloud.google.com/apis/credentials
- **Vision API**: https://console.cloud.google.com/apis/library/vision.googleapis.com

## 📈 Monitoring Free Tier Usage

**Google Cloud Vision**: 
- Limit: 1,000 requests/month
- Check: Cloud Console → Billing → Reports

**Firebase Firestore**:
- Limit: 50K reads, 20K writes/day
- Check: Firebase Console → Usage

**Vercel/Netlify**:
- Limit: 100 GB bandwidth/month
- Check: Dashboard → Usage

## 🔄 Git Commands

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-repo-url>
git push -u origin main
```

## 🚀 Deploy Checklist

- [ ] `.env` configured locally
- [ ] Firebase Authentication enabled
- [ ] Firestore created
- [ ] Vision API enabled & key created
- [ ] Icons generated in `public/icons/`
- [ ] Environment variables added to hosting platform
- [ ] Firestore security rules updated
- [ ] Test all features work

## 📞 Support Resources

- **Documentation**: See README.md
- **Setup Guide**: See GETTING_STARTED.md
- **Deployment**: See DEPLOYMENT_CHECKLIST.md
- **Structure**: See PROJECT_STRUCTURE.md

## ⚙️ Configuration Quick Links

| What | Where |
|------|-------|
| Change colors | `tailwind.config.js` |
| Add routes | `src/App.jsx` |
| Modify navigation | `src/components/Layout.jsx` |
| Edit PWA settings | `vite.config.js` |
| Update security | `firestore.rules` |
| Add bikes | `src/data/bikeDatabase.json` |

## 💡 Pro Tips

1. Use `npm run build` before deploying
2. Test PWA on real device (not just dev tools)
3. Monitor API usage monthly
4. Back up Firestore data regularly
5. Use production rules in Firestore
6. Restrict API keys to specific domains
7. Enable 2FA on Firebase/Google Cloud accounts

---

**Keep this card handy for quick reference!** 📌

