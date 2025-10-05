# Feature Flags Guide

## 🎚️ Overview

Feature flags allow you to enable/disable specific features without changing code. This is useful for:
- Features that require billing (like Firebase Storage)
- Features in development
- Features you want to test gradually

---

## 📋 Available Feature Flags

### `ENABLE_IMAGE_STORAGE`

**Location:** `src/config/features.js`

**Default:** `false` (disabled)

**Purpose:** Controls whether bill images are uploaded to Firebase Storage

**Requires:**
- Firebase Storage set up in Firebase Console
- Firebase Storage billing enabled (Blaze plan)
- Storage rules deployed (`firebase deploy --only storage`)

---

## 🔧 How to Use

### Current Configuration

```javascript
// src/config/features.js
export const FEATURES = {
  ENABLE_IMAGE_STORAGE: false,  // ← Image storage is DISABLED
};
```

### To Enable Image Storage

**Step 1:** Set up Firebase Storage (see `FIREBASE_STORAGE_SETUP.md`)

**Step 2:** Change the flag to `true`:

```javascript
// src/config/features.js
export const FEATURES = {
  ENABLE_IMAGE_STORAGE: true,  // ← Image storage is ENABLED
};
```

**Step 3:** Restart your dev server:

```bash
npm run dev
```

**Step 4:** Redeploy to production:

```bash
npm run build
vercel --prod
```

---

## 🎯 What Happens When Disabled?

### ❌ When `ENABLE_IMAGE_STORAGE: false`

✅ **App works normally:**
- Bill scanning works
- OCR extracts all data
- Records are saved to Firestore
- All features work except image storage

❌ **Image features disabled:**
- Bill images are NOT uploaded
- No `billImageUrl` field in records
- "View Receipt" shows placeholder or nothing
- No Firebase Storage costs

### ✅ When `ENABLE_IMAGE_STORAGE: true`

✅ **Full features:**
- Bill images are compressed and uploaded
- `billImageUrl` saved in Firestore
- "View Receipt" shows actual bill image
- Images stored securely per user

⚠️ **Requirements:**
- Firebase Storage must be set up
- Blaze plan required (pay-as-you-go)
- Storage rules must be deployed

---

## 💰 Cost Comparison

### Free Tier (Storage Disabled)

| Feature | Status | Cost |
|---------|--------|------|
| Firestore Database | ✅ Works | **FREE** (up to 50K reads/day) |
| Authentication | ✅ Works | **FREE** (up to 10K users) |
| Bill Scanning (Tesseract.js) | ✅ Works | **FREE** (client-side) |
| Bike Data (API Ninjas) | ✅ Works | **FREE** (50K requests/month) |
| Image Storage | ❌ Disabled | **FREE** (not used) |
| **Total** | | **$0/month** 🎉 |

### With Storage Enabled

| Feature | Status | Cost |
|---------|--------|------|
| Everything above | ✅ Works | **FREE** |
| Image Storage | ✅ Enabled | **~$0.026/GB/month** |
| Storage Downloads | ✅ Enabled | **~$0.12/GB downloaded** |
| **Estimated** (100 bills/month) | | **~$0.10-$0.50/month** |

---

## 🧪 Testing Feature Flags

### Test with Storage Disabled (Current Default)

1. Open `src/config/features.js`
2. Verify `ENABLE_IMAGE_STORAGE: false`
3. Run `npm run dev`
4. Scan a bill or add manual entry
5. ✅ Should save successfully without image

### Test with Storage Enabled

1. Set up Firebase Storage first
2. Change to `ENABLE_IMAGE_STORAGE: true`
3. Restart dev server
4. Scan a bill or add manual entry with image
5. ✅ Should upload image and save URL

---

## 📁 Files Modified

### Core Files

| File | Purpose |
|------|---------|
| `src/config/features.js` | **Main config** - Enable/disable features |
| `src/pages/ScanBill.jsx` | Checks flag before uploading images |
| `src/pages/AddManual.jsx` | Checks flag before uploading images |

### How It Works

```javascript
// In ScanBill.jsx and AddManual.jsx
import { FEATURES } from '../config/features';

const saveRecord = async (data) => {
  let billImageUrl = null;
  
  // ✅ Only upload if feature is enabled
  if (FEATURES.ENABLE_IMAGE_STORAGE && image) {
    // ... compress and upload image
    billImageUrl = await uploadToStorage(image);
  }
  
  // Save record (with or without image URL)
  await saveToFirestore({
    ...data,
    ...(billImageUrl && { billImageUrl })  // Only add if exists
  });
};
```

---

## 🚀 Quick Enable/Disable

### Disable Image Storage (Default - Free)

```bash
# Edit src/config/features.js
ENABLE_IMAGE_STORAGE: false
```

```bash
# Restart
npm run dev
```

### Enable Image Storage (Requires Setup)

```bash
# 1. Set up Firebase Storage (see FIREBASE_STORAGE_SETUP.md)
# 2. Edit src/config/features.js
ENABLE_IMAGE_STORAGE: true
```

```bash
# 3. Restart
npm run dev
```

---

## ❓ FAQ

### Q: Can I use the app without enabling Storage?

**A:** Yes! The app works 100% without image storage. You just won't be able to view receipt images later.

### Q: Will old records break if I enable Storage later?

**A:** No! Old records simply won't have a `billImageUrl` field. New records will have it.

### Q: Can I delete stored images to save costs?

**A:** Yes! Go to Firebase Console → Storage → Files, and delete old images. The records will still exist in Firestore.

### Q: How do I know if the feature is enabled?

**A:** Check `src/config/features.js` or look for console logs when saving:
- Enabled: "Compressing image..." → "Image uploaded successfully"
- Disabled: No image logs, saves immediately

---

## 🎉 Summary

✅ **Current Setup:** Image storage is **DISABLED** (free)

✅ **App Status:** Fully functional without images

✅ **To Enable:** Follow `FIREBASE_STORAGE_SETUP.md` + change flag to `true`

✅ **Cost:** $0/month currently, ~$0.10-$0.50/month if enabled

---

**Need help?** Check `FIREBASE_STORAGE_SETUP.md` for Storage setup instructions.

