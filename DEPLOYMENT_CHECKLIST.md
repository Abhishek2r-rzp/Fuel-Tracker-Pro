# 📋 Deployment Checklist

Use this checklist to ensure your Fuel Tracker Pro app is properly configured before deployment.

## Pre-Deployment

### ✅ Firebase Setup
- [ ] Firebase project created
- [ ] Email/Password authentication enabled
- [ ] Firestore database created (test mode initially)
- [ ] Firestore security rules configured
- [ ] Firebase config added to `.env` file

### ✅ Google Cloud Vision API
- [ ] Cloud Vision API enabled
- [ ] API key created
- [ ] API key added to `.env` file
- [ ] (Optional) API key restricted to Vision API only

### ✅ Code Configuration
- [ ] All `.env` variables configured
- [ ] Firebase config in `src/config/firebase.js` verified
- [ ] OCR endpoint in `api/ocr.js` tested
- [ ] Bike database populated with your region's models

### ✅ PWA Assets
- [ ] All icon sizes generated (72x72 to 512x512)
- [ ] Icons placed in `public/icons/` directory
- [ ] App name and description in `vite.config.js` customized
- [ ] Theme color matches your brand

### ✅ Testing
- [ ] App runs locally without errors (`npm run dev`)
- [ ] User registration works
- [ ] User login works
- [ ] Bill scanning and OCR extraction works
- [ ] Manual fuel record entry works
- [ ] Dashboard displays analytics correctly
- [ ] Fuel history filtering works
- [ ] Bike profile save/load works
- [ ] PWA installs on mobile device (test mode)

## Deployment Options

### Option 1: Vercel (Recommended)

#### Via Dashboard
- [ ] Create Vercel account
- [ ] Import Git repository
- [ ] Configure build settings:
  - Build Command: `npm run build`
  - Output Directory: `dist`
- [ ] Add environment variables in project settings
- [ ] Deploy

#### Via CLI
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Add environment variables
vercel env add VITE_FIREBASE_API_KEY
vercel env add VITE_FIREBASE_AUTH_DOMAIN
# ... add all variables

# Deploy to production
vercel --prod
```

### Option 2: Netlify

#### Via Dashboard
- [ ] Create Netlify account
- [ ] Import Git repository
- [ ] Configure build settings:
  - Build Command: `npm run build`
  - Publish Directory: `dist`
  - Functions Directory: `api`
- [ ] Add environment variables in site settings
- [ ] Deploy

#### Via CLI
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Initialize
netlify init

# Deploy
netlify deploy --prod
```

## Post-Deployment

### ✅ Verification
- [ ] Visit deployed URL
- [ ] Test user registration
- [ ] Test user login
- [ ] Test bill scanning with OCR
- [ ] Test all analytics features
- [ ] Verify PWA installation prompt appears
- [ ] Install PWA on mobile device
- [ ] Test offline functionality
- [ ] Check service worker registration in DevTools

### ✅ Security

#### Firestore Rules (Production)
Replace test mode rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /fuelRecords/{recordId} {
      allow read: if request.auth != null 
        && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null 
        && request.auth.uid == request.resource.data.userId;
      allow update, delete: if request.auth != null 
        && request.auth.uid == resource.data.userId;
    }
    
    match /bikeProfiles/{userId} {
      allow read, write: if request.auth != null 
        && request.auth.uid == userId;
    }
  }
}
```

- [ ] Update Firestore security rules to production mode
- [ ] Test that users can only access their own data
- [ ] Verify unauthorized access is blocked

#### API Security
- [ ] Google Cloud Vision API key restricted to Vision API only
- [ ] (Optional) Restrict API key to specific domains
- [ ] Environment variables secured (not committed to Git)

### ✅ Performance Optimization
- [ ] Run Lighthouse audit
- [ ] PWA score > 90
- [ ] Performance score > 90
- [ ] Accessibility score > 90
- [ ] Best Practices score > 90
- [ ] SEO score > 90

### ✅ Monitoring
- [ ] Set up Firebase Analytics (optional)
- [ ] Configure error tracking (Sentry, LogRocket, etc.)
- [ ] Monitor API usage:
  - Google Cloud Vision API usage
  - Firestore read/write counts
- [ ] Set up usage alerts for free tier limits

### ✅ Documentation
- [ ] Update README with live demo URL
- [ ] Document any custom modifications
- [ ] Create user guide (optional)
- [ ] Add screenshots to README

## Free Tier Limits

Keep track of these limits to avoid unexpected charges:

### Google Cloud Vision API
- **Free**: 1,000 requests/month
- **Action**: Set up billing alerts at 80% usage

### Firebase Firestore
- **Storage**: 1 GB
- **Reads**: 50,000/day
- **Writes**: 20,000/day
- **Deletes**: 20,000/day
- **Action**: Monitor usage in Firebase Console

### Vercel Free Tier
- **Bandwidth**: 100 GB/month
- **Serverless Function Execution**: 100 GB-hours/month
- **Builds**: Unlimited
- **Action**: Monitor in Vercel dashboard

### Netlify Free Tier
- **Bandwidth**: 100 GB/month
- **Build minutes**: 300/month
- **Serverless Functions**: 125,000 requests/month
- **Action**: Monitor in Netlify dashboard

## Scaling Beyond Free Tier

When you exceed free tier limits:

1. **Google Cloud Vision API**
   - Upgrade to paid plan: $1.50 per 1,000 requests
   - Alternative: Implement OCR caching or use Tesseract.js for offline OCR

2. **Firebase**
   - Upgrade to Blaze (pay-as-you-go)
   - Optimize queries to reduce reads
   - Implement pagination

3. **Hosting**
   - Vercel Pro: $20/month
   - Netlify Pro: $19/month
   - Alternative: Self-host on VPS

## Support & Troubleshooting

Common issues after deployment:

- **CORS errors**: Check API configuration
- **Firebase connection issues**: Verify environment variables
- **OCR not working**: Check API key and quota
- **PWA not installing**: Ensure HTTPS and valid manifest
- **Service worker errors**: Check console and rebuild

## Success Criteria

Your deployment is successful when:
- ✅ Users can register and login
- ✅ OCR extraction works from uploaded images
- ✅ Analytics display correctly
- ✅ PWA can be installed on mobile devices
- ✅ App works offline after initial load
- ✅ All features accessible and functional
- ✅ No console errors
- ✅ Lighthouse PWA score > 90

---

**Congratulations! Your Fuel Tracker Pro app is now live! 🎉**

