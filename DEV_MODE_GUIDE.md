# 🔧 Development Mode Guide

## OCR API in Development

### Problem
Serverless functions (like `/api/ocr.js`) **don't run** in local Vite development server. They only work when deployed to Vercel/Netlify.

### Solution
We've implemented a **smart fallback system**:

## How It Works

### 1. **In Production (Deployed)**
```
User scans bill
    ↓
Frontend calls /api/ocr
    ↓
Vercel/Netlify runs serverless function
    ↓
Google Cloud Vision API processes image
    ↓
Returns real extracted data ✅
```

### 2. **In Development (Local)**
```
User scans bill
    ↓
Frontend calls /api/ocr
    ↓
404 Not Found (no serverless function)
    ↓
Fallback to mock data
    ↓
Returns sample extracted data for testing ⚠️
```

## Development Options

### Option 1: Use Mock Data (Easiest)
**Current setup** - Already configured!

```bash
npm run dev
```

- Click "Extract Data" on any bill image
- Returns mock data automatically
- Test the UI/UX without API calls
- **No Google Cloud Vision API calls = No costs!**

**Mock Data Returned:**
```javascript
{
  date: today's date,
  time: "14:30",
  amount: "1050.00",
  fuelVolume: "10.5",
  odometerReading: "", // Empty to test partial extraction
  stationName: "Indian Oil Corporation",
  // ... more fields
}
```

### Option 2: Test Real OCR (Requires Setup)

If you want to test real OCR in development:

#### A. Use Vercel CLI (Recommended)

```bash
# Install Vercel CLI
npm install -g vercel

# Run in dev mode with serverless functions
vercel dev
```

This runs your app on `http://localhost:3000` with **real** serverless functions!

#### B. Use Netlify CLI

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Run in dev mode
netlify dev
```

## Testing Strategy

### Phase 1: Local Development (Mock Data)
```bash
npm run dev
```

**Test:**
- ✅ UI components
- ✅ Form validation
- ✅ Auto-save logic
- ✅ Missing field detection
- ✅ Data display
- ✅ Navigation flow

**Don't worry about:**
- ❌ Real OCR accuracy (use mock data)
- ❌ API costs (no real calls)

### Phase 2: Preview Deployment
```bash
# Deploy to preview
vercel --prod
# or
netlify deploy
```

**Test with REAL bills:**
- ✅ OCR extraction accuracy
- ✅ Different bill formats
- ✅ Edge cases

## File Structure

```
/api/ocr.js                 # Serverless function (production only)
/src/utils/ocrService.js    # Smart wrapper with fallback
/src/pages/ScanBill.jsx     # Uses ocrService
```

## Key Code

### ocrService.js (Smart Wrapper)
```javascript
export async function processBillImage(base64Image) {
  try {
    const response = await fetch('/api/ocr', { ... });
    
    if (response.status === 404) {
      // API not available in dev mode
      return getMockOCRResponse(); // ✨ Fallback
    }
    
    return await response.json();
  } catch (error) {
    // Network error in dev mode
    return getMockOCRResponse(); // ✨ Fallback
  }
}
```

## Console Messages

### Development Mode:
```
⚠️ OCR API not available. Using mock data for development.
```
This is **normal** and **expected**!

### Production Mode:
```
(no warnings - real OCR works)
```

## Customizing Mock Data

Edit `src/utils/ocrService.js`:

```javascript
function getMockOCRResponse() {
  return {
    date: '2025-10-04',
    amount: '1500.00',     // Change these
    fuelVolume: '15.0',    // to match your
    // ... test scenarios
  };
}
```

## Deployment Checklist

Before deploying:

- [ ] Environment variables set in Vercel/Netlify
  - [ ] `GOOGLE_CLOUD_VISION_API_KEY`
  - [ ] All Firebase vars
- [ ] Test mock data works locally
- [ ] Build succeeds: `npm run build`
- [ ] Deploy to preview first
- [ ] Test with real bills
- [ ] Monitor API usage

## API Cost Management

### Development (Mock Data)
**Cost: $0** ✅
- No API calls
- Unlimited testing
- Fast iteration

### Testing Real OCR
**Cost: Free tier (1,000 calls/month)** ⚠️
- Only test on preview/production
- Test with 5-10 real bills
- Verify accuracy
- Then deploy

### Production
**Cost: $1.50 per 1,000 calls after free tier** 💰
- Monitor usage in Google Cloud Console
- Set billing alerts
- Optimize if needed

## Troubleshooting

### "404 Not Found" in console
✅ **Normal in development!** Mock data is being used.

### Want to test real OCR locally?
```bash
vercel dev
# or
netlify dev
```

### Mock data not appearing?
Check console for errors. The fallback should always work.

### Need different mock data?
Edit `getMockOCRResponse()` in `ocrService.js`

## Best Practices

1. **Develop with mock data** - Fast and free
2. **Test real OCR on preview** - Before going live
3. **Monitor API usage** - Set alerts at 80% of free tier
4. **Cache results** - Store rawText for re-processing

## Summary

| Mode | OCR | Cost | Use For |
|------|-----|------|---------|
| **Local Dev** | Mock | $0 | UI/UX development |
| **Vercel Dev** | Real | Free tier | OCR testing |
| **Preview** | Real | Free tier | Pre-launch testing |
| **Production** | Real | Free tier | Live app |

---

**You can develop the entire app without spending a single dollar on API calls!** 🎉

