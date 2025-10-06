# 🚀 Development Guide - Bill Reader Monorepo

## Quick Start

### Run All Apps (Recommended)

```bash
# Install dependencies (only needed once or after adding packages)
npm install

# Run all apps in development mode with Turborepo
npm run dev
```

This will start all apps concurrently:
- **Host App** → http://localhost:3000 (App selector)
- **Fuel Tracker** → http://localhost:3000 (integrated)
- **Expense Tracker** → http://localhost:3002

### Run Individual Apps

```bash
# Run only host app
cd apps/host
npm run dev

# Run only fuel tracker
cd apps/fuel-tracker
npm run dev

# Run only expense tracker  
cd apps/expense-tracker
npm run dev
```

### Build All Apps

```bash
# Build all packages (Turborepo orchestrates the build)
npm run build

# Build specific app
cd apps/expense-tracker
npm run build
```

---

## 📁 Monorepo Structure

```
bill-reader/
├── apps/
│   ├── host/              → Port 3000 (App selector & auth)
│   ├── fuel-tracker/      → Port 3000 (Fuel tracking PWA)
│   └── expense-tracker/   → Port 3002 (Expense management)
├── packages/
│   ├── shared-ui/         → Theme, components
│   ├── shared-auth/       → Firebase auth wrapper
│   └── shared-utils/      → Common utilities
├── api/                   → Serverless functions
└── turbo.json             → Turborepo configuration
```

---

## 🔧 Common Commands

### Development
```bash
npm run dev              # Run all apps
npm run dev:old          # Legacy: fuel tracker only
npm run build            # Build all packages
npm run lint             # Lint all packages
npm run clean            # Clean all build outputs
```

### Testing
```bash
npm run preview          # Preview production build
```

### Git
```bash
# Pre-commit hook automatically runs build
git commit -m "message"  # Will build before committing
```

---

## 📱 Accessing the Apps

### Option 1: Host App (Recommended)
1. Go to http://localhost:3000
2. Login/Register
3. Select which app to use (Fuel Tracker or Expense Tracker)

### Option 2: Direct Access
- **Fuel Tracker:** Run `cd apps/fuel-tracker && npm run dev`
- **Expense Tracker:** Run `cd apps/expense-tracker && npm run dev`

---

## 🔥 Firebase Setup

Make sure you have `.env` file in the root with:

```env
VITE_FIREBASE_API_KEY=your_key
VITE_FIREBASE_AUTH_DOMAIN=your_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
API_NINJAS_KEY=your_api_ninjas_key
```

---

## 🎨 Theme

The app uses a pastel color theme with dark/light mode support:
- Toggle theme using the floating button (bottom-right)
- Theme preference is saved to localStorage
- All apps share the same theme

---

## 📦 Adding New Packages

```bash
# Add to root (affects all packages)
npm install package-name -w root

# Add to specific app
npm install package-name -w @bill-reader/expense-tracker

# Add to shared package
npm install package-name -w @bill-reader/shared-ui
```

---

## 🔍 Troubleshooting

### Port Already in Use
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use different port
cd apps/host
PORT=3001 npm run dev
```

### Build Errors
```bash
# Clean everything and reinstall
rm -rf node_modules apps/*/node_modules packages/*/node_modules
rm -rf apps/*/dist packages/*/dist
npm install
npm run build
```

### Turborepo Cache Issues
```bash
# Clear Turborepo cache
rm -rf .turbo
npm run build
```

---

## 🚀 Deployment

### Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Production
vercel --prod
```

### Build for Production
```bash
npm run build

# Output locations:
# - apps/host/dist
# - apps/fuel-tracker/dist
# - apps/expense-tracker/dist
```

---

## 📊 Current Features

### Host App ✅
- Unified authentication
- Beautiful app selector
- Dark/light theme toggle

### Fuel Tracker ✅
- Bill scanning with OCR (Tesseract.js)
- Fuel consumption tracking
- Mileage analytics
- Fuel station history
- Manual entry
- PWA with offline support

### Expense Tracker 🚧
- ✅ File upload (PDF, Excel, CSV)
- ✅ File parsing and transaction extraction
- 🚧 Duplicate detection (Phase 8)
- 🚧 Auto-categorization (Phase 9)
- 🚧 Analytics & Charts (Phase 10)

---

## 💡 Development Tips

1. **Use Turborepo cache:** Changes to one package only rebuild affected packages
2. **Hot reload:** All apps support hot module replacement
3. **Shared packages:** Edit shared packages and see changes in all apps instantly
4. **Pre-commit hooks:** Build runs automatically before commits (can skip with `--no-verify`)
5. **Monorepo benefits:** Share code, single `npm install`, unified build

---

## 📝 Next Steps

See `MICRO_FRONTEND_MIGRATION_PLAN.md` for the complete roadmap.

**Current Status:** Phase 7 complete (70%)
**Next:** Phases 8-10 (Duplicate detection, Categorization, UI components)

---

## 🆘 Need Help?

- Check `MICRO_FRONTEND_MIGRATION_PLAN.md` for architecture details
- See `START_DEV.md` for legacy setup (fuel tracker only)
- All documentation in the root directory

