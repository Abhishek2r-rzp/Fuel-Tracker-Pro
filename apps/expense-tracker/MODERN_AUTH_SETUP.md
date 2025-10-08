# Modern Authentication Setup Guide

## 🎯 Overview

This guide will help you enable **Google Login** and **Phone Authentication** in your Expense Tracker app.

---

## 📋 Prerequisites

- Firebase project already set up
- Firebase CLI installed
- Access to Firebase Console

---

## 🔐 Step 1: Enable Google Sign-In

### **1.1 Firebase Console Setup**

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project (`fuel-tracker-pro-e11be`)
3. Navigate to **Authentication** → **Sign-in method**
4. Click on **Google** provider
5. Click **Enable** toggle
6. Select a **Support email** (your email)
7. Click **Save**

**Screenshot locations:**
```
Firebase Console
  └─ Authentication
      └─ Sign-in method
          └─ Google (Enable this)
```

### **1.2 Configure OAuth Consent Screen (Optional but Recommended)**

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your Firebase project
3. Navigate to **APIs & Services** → **OAuth consent screen**
4. Fill in:
   - **App name**: Bill Reader
   - **User support email**: Your email
   - **App logo**: (Optional) Upload your app icon
   - **Authorized domains**: Add your domain (e.g., `yourapp.com`)
   - **Developer contact**: Your email
5. Click **Save and Continue**
6. Add scopes: `email`, `profile`
7. Click **Save and Continue**
8. Add test users if in development mode
9. Click **Save and Continue**

---

## 📱 Step 2: Enable Phone Authentication

### **2.1 Firebase Console Setup**

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Navigate to **Authentication** → **Sign-in method**
4. Click on **Phone** provider
5. Click **Enable** toggle
6. Click **Save**

### **2.2 Configure reCAPTCHA (Required for Phone Auth)**

Phone authentication uses reCAPTCHA to prevent abuse. Firebase handles this automatically, but you need to:

1. **For Development (localhost):**
   - Works automatically with invisible reCAPTCHA
   - No additional setup needed

2. **For Production:**
   - Add your domain to Firebase authorized domains:
     - Go to **Authentication** → **Settings** → **Authorized domains**
     - Click **Add domain**
     - Enter your production domain (e.g., `yourapp.com`)
     - Click **Add**

### **2.3 Enable App Verification (Optional but Recommended)**

For production apps, enable **App Check** to prevent abuse:

1. Go to **App Check** in Firebase Console
2. Register your app
3. Select **reCAPTCHA Enterprise** or **reCAPTCHA v3**
4. Follow the setup wizard

---

## 🌐 Step 3: Update Firebase Configuration

### **3.1 Check Your `.env` File**

Make sure your `.env` file in the project root has all Firebase credentials:

```env
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### **3.2 Verify Firebase Config**

The config is already set up in `/packages/shared-auth/src/firebase.js`. No changes needed!

---

## 🎨 Step 4: Test the Authentication

### **4.1 Start Development Server**

```bash
cd /Users/abhishek.kr/Downloads/dev/bill-reader/apps/expense-tracker
npm run dev
```

### **4.2 Test Google Login**

1. Navigate to `http://localhost:3004/login`
2. Click **Google** button
3. Select your Google account
4. Grant permissions
5. You should be redirected to the dashboard

**Expected Flow:**
```
Login Page → Click Google → Google Popup → Select Account → Grant Access → Dashboard
```

### **4.3 Test Phone Login**

1. Navigate to `http://localhost:3004/login`
2. Click **Phone** button
3. Enter phone number with country code (e.g., `+919876543210`)
4. Click **Send OTP**
5. Enter the 6-digit OTP received on your phone
6. Click **Verify OTP**
7. You should be redirected to the dashboard

**Expected Flow:**
```
Login Page → Click Phone → Enter Number → Send OTP → Enter OTP → Verify → Dashboard
```

---

## 🐛 Troubleshooting

### **Issue 1: Google Login Popup Blocked**

**Error:** "Popup blocked by browser"

**Solution:**
- Allow popups for your site in browser settings
- Or use redirect mode (already handled for mobile devices)

### **Issue 2: "auth/unauthorized-domain"**

**Error:** "This domain is not authorized for OAuth operations"

**Solution:**
1. Go to Firebase Console → Authentication → Settings → Authorized domains
2. Add your domain (e.g., `localhost:3004` for development)
3. For production, add your actual domain

### **Issue 3: Phone OTP Not Received**

**Error:** "Failed to send OTP" or "reCAPTCHA verification failed"

**Solution:**
1. Check if Phone authentication is enabled in Firebase Console
2. Verify your phone number format includes country code (+91 for India)
3. Check browser console for reCAPTCHA errors
4. Try using a different phone number
5. Ensure you're not in private/incognito mode

### **Issue 4: "auth/invalid-phone-number"**

**Error:** "The phone number is invalid"

**Solution:**
- Phone number must be in E.164 format: `+[country code][number]`
- Examples:
  - ✅ `+919876543210` (India)
  - ✅ `+14155552671` (USA)
  - ❌ `9876543210` (Missing country code)
  - ❌ `+91 9876543210` (Has space)

### **Issue 5: reCAPTCHA Not Visible**

**Error:** Can't see reCAPTCHA or "reCAPTCHA container not found"

**Solution:**
- The reCAPTCHA is invisible by default
- Check if `<div id="recaptcha-container"></div>` exists in Login.jsx (✅ Already added)
- Clear browser cache and reload

### **Issue 6: "auth/too-many-requests"**

**Error:** "Too many requests. Try again later"

**Solution:**
- Firebase has rate limits to prevent abuse
- Wait 15-30 minutes before trying again
- In production, implement proper error handling and user feedback

---

## 🔒 Security Best Practices

### **1. Authorized Domains**

Only add domains you control:
```
✅ yourapp.com
✅ localhost (for development)
❌ Random domains
```

### **2. App Check (Production)**

Enable App Check to prevent unauthorized access:
- Protects against abuse
- Validates requests are from your app
- Free tier: 10,000 verifications/month

### **3. Phone Number Verification**

- Limit OTP requests per IP/device
- Implement cooldown periods
- Monitor for suspicious activity in Firebase Console

### **4. OAuth Scopes**

Only request necessary scopes:
```javascript
// ✅ Good - Only essential scopes
provider.addScope('profile');
provider.addScope('email');

// ❌ Bad - Requesting unnecessary scopes
provider.addScope('https://www.googleapis.com/auth/drive');
```

---

## 📱 Mobile-Specific Configuration

### **For iOS Apps (Future)**

If you build an iOS app, you'll need to:

1. Add iOS app in Firebase Console
2. Download `GoogleService-Info.plist`
3. Add URL schemes to `Info.plist`
4. Configure associated domains

### **For Android Apps (Future)**

If you build an Android app, you'll need to:

1. Add Android app in Firebase Console
2. Download `google-services.json`
3. Add SHA-1 fingerprint
4. Configure OAuth client ID

---

## 🎨 UI Features Implemented

### **Login Page Enhancements**

1. **Email/Password Login** (Existing)
   - Email input with icon
   - Password input with icon
   - Sign Up / Sign In toggle

2. **Google Login** (New)
   - Google logo button
   - Popup authentication (desktop)
   - Redirect authentication (mobile)
   - Automatic device detection

3. **Phone Login** (New)
   - Phone number input with country code
   - OTP input (6-digit)
   - Resend OTP functionality
   - Back button to return to other options

4. **Visual Improvements**
   - Icons for all inputs
   - Loading spinners
   - Better error messages
   - Responsive design
   - Dark mode support

---

## 🔄 User Flow Diagrams

### **Google Login Flow**

```
┌─────────────┐
│  Login Page │
└──────┬──────┘
       │ Click "Google"
       ▼
┌─────────────┐
│ Google Popup│
└──────┬──────┘
       │ Select Account
       ▼
┌─────────────┐
│Grant Perms  │
└──────┬──────┘
       │ Allow
       ▼
┌─────────────┐
│  Dashboard  │
└─────────────┘
```

### **Phone Login Flow**

```
┌─────────────┐
│  Login Page │
└──────┬──────┘
       │ Click "Phone"
       ▼
┌─────────────┐
│Enter Number │
└──────┬──────┘
       │ Send OTP
       ▼
┌─────────────┐
│ Enter OTP   │
└──────┬──────┘
       │ Verify
       ▼
┌─────────────┐
│  Dashboard  │
└─────────────┘
```

---

## 📊 Testing Checklist

### **Before Production**

- [ ] Test Google login on desktop
- [ ] Test Google login on mobile
- [ ] Test phone login with your number
- [ ] Test phone login with international number
- [ ] Test error handling (wrong OTP, expired OTP)
- [ ] Test logout and re-login
- [ ] Verify user data is saved correctly
- [ ] Test on different browsers (Chrome, Safari, Firefox)
- [ ] Test on different devices (iOS, Android)
- [ ] Check Firebase Console for authentication logs

### **Production Checklist**

- [ ] Enable Google Sign-In in Firebase Console
- [ ] Enable Phone Authentication in Firebase Console
- [ ] Add production domain to authorized domains
- [ ] Configure OAuth consent screen
- [ ] Enable App Check (recommended)
- [ ] Set up monitoring and alerts
- [ ] Test with real users
- [ ] Monitor Firebase quota usage

---

## 💰 Cost Considerations

### **Free Tier (Spark Plan)**

- **Google Sign-In**: Free, unlimited
- **Phone Authentication**: 
  - Free: 10,000 verifications/month
  - After: $0.06 per verification
- **App Check**: 
  - Free: 10,000 verifications/month
  - After: $0.01 per verification

### **Paid Plans**

If you exceed free tier:
- **Blaze Plan** (Pay as you go)
- Monitor usage in Firebase Console
- Set up billing alerts

---

## 🚀 Advanced Features (Future)

### **1. Multi-Factor Authentication (MFA)**

Add extra security layer:
```javascript
// Enable MFA for sensitive operations
const multiFactorUser = multiFactor(user);
```

### **2. Email Link Authentication**

Passwordless email login:
```javascript
// Send sign-in link to email
await sendSignInLinkToEmail(auth, email, actionCodeSettings);
```

### **3. Anonymous Authentication**

Let users try app before signing up:
```javascript
// Sign in anonymously
await signInAnonymously(auth);
```

### **4. Account Linking**

Link multiple auth providers to one account:
```javascript
// Link Google account to existing email account
await linkWithPopup(auth.currentUser, googleProvider);
```

---

## 📚 Additional Resources

### **Official Documentation**

- [Firebase Authentication Docs](https://firebase.google.com/docs/auth)
- [Google Sign-In](https://firebase.google.com/docs/auth/web/google-signin)
- [Phone Authentication](https://firebase.google.com/docs/auth/web/phone-auth)

### **Video Tutorials**

- "Firebase Authentication in 100 Seconds" - Fireship
- "Google Sign-In with Firebase" - Firebase Official
- "Phone Authentication with Firebase" - Firebase Official

### **Community**

- [Stack Overflow - Firebase Tag](https://stackoverflow.com/questions/tagged/firebase)
- [Firebase Discord](https://discord.gg/firebase)
- [Reddit r/Firebase](https://reddit.com/r/firebase)

---

## ✅ Summary

You now have:

1. ✅ **Google Login** - One-click sign-in with Google account
2. ✅ **Phone Authentication** - OTP-based login with phone number
3. ✅ **Modern UI** - Beautiful, responsive login page
4. ✅ **Error Handling** - Proper error messages and loading states
5. ✅ **Mobile Support** - Works seamlessly on all devices
6. ✅ **Dark Mode** - Consistent theming across auth flows

**Next Steps:**
1. Enable Google Sign-In in Firebase Console (5 minutes)
2. Enable Phone Authentication in Firebase Console (5 minutes)
3. Test both login methods (10 minutes)
4. Deploy to production (when ready)

---

**Last Updated:** 2025-01-08  
**Status:** ✅ Ready to Enable
