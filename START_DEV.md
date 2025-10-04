# 🚀 Start Development

## Quick Start

### Option 1: Auto-start (Recommended)
```bash
npm run dev
```
This starts **both** servers automatically:
- ✅ API Server on `http://localhost:3001`
- ✅ Frontend on `http://localhost:3000`

### Option 2: Manual Start (for debugging)
```bash
# Terminal 1 - API Server
npm run dev:api

# Terminal 2 - Frontend
npm run dev:frontend
```

---

## ✅ What You Should See

### Terminal Output:
```
╔════════════════════════════════════════╗
║   🚀 API Server Running                ║
║   📍 http://localhost:3001             ║
║   🔧 OCR Endpoint: /api/ocr            ║
╚════════════════════════════════════════╝

✅ Ready to process fuel bills!


  VITE v5.0.8  ready in 500 ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
```

---

## 🔧 Troubleshooting

### "GOOGLE_CLOUD_VISION_API_KEY not found"
```
⚠️  WARNING: GOOGLE_CLOUD_VISION_API_KEY not found in .env
```

**Fix:**
1. Make sure `.env` file exists
2. Add your API key:
```bash
GOOGLE_CLOUD_VISION_API_KEY=your_key_here
```
3. Restart: `npm run dev`

### Port 3001 already in use
**Fix:**
```bash
# Find and kill process
lsof -ti:3001 | xargs kill -9

# Then restart
npm run dev
```

### Port 3000 already in use
**Fix:**
```bash
# Find and kill process
lsof -ti:3000 | xargs kill -9

# Then restart
npm run dev
```

---

## 📋 Pre-flight Checklist

Before starting development:
- [ ] `.env` file created with all variables
- [ ] `npm install` completed
- [ ] Firebase credentials configured
- [ ] Google Cloud Vision API key added
- [ ] Ports 3000 and 3001 available

---

## 🎯 Testing OCR

1. Start dev server: `npm run dev`
2. Go to `http://localhost:3000`
3. Navigate to "Scan Bill"
4. Upload a fuel bill image
5. Click "Extract Data"
6. Check console for: `✅ OCR extraction successful`

---

## 💡 Pro Tips

### Check API Health
```bash
curl http://localhost:3001/api/health
```
Should return: `{"status":"ok","message":"API server running"}`

### Test OCR Directly
```bash
# Save this as test-ocr.sh
curl -X POST http://localhost:3001/api/ocr \
  -H "Content-Type: application/json" \
  -d '{"image":"base64_image_here"}'
```

### View API Logs
API server logs appear in the same terminal as Vite.
Look for:
- ✅ `OCR extraction successful`
- ⚠️ `No text detected in image`
- ❌ `Vision API error`

---

## 🛑 Stopping Development

Press `Ctrl+C` in the terminal running `npm run dev`

This stops both servers.

---

**Now you're ready to develop with REAL OCR!** 🎉

