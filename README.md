# 🏍️ Fuel Tracker Pro

A full-stack Progressive Web App (PWA) that helps motorcycle riders track fuel consumption by scanning petrol bills and providing detailed analytics. Built entirely on free-tier services for cost-effective deployment.

## ✨ Features

### Core Functionality
- **📸 OCR-Powered Bill Scanning**: Capture fuel bills using device camera and automatically extract data using Google Cloud Vision API
- **📊 Analytics Dashboard**: View comprehensive fuel consumption statistics including:
  - Average mileage (km/l)
  - Cost per kilometer
  - Total fuel expenses
  - Historical trends with interactive charts
- **🏍️ Bike Profile Management**: Store motorcycle specifications with auto-populated data for popular models
- **📜 Fuel History**: Complete record of all fuel-ups with filtering and search capabilities
- **🔔 Push Notifications**: Browser-based notifications for fuel logging reminders (future enhancement)

### PWA Features
- **📱 Installable**: Can be installed on mobile devices like a native app
- **⚡ Offline Support**: Service worker with cache-first strategy for fast loading
- **🔄 Auto-sync**: Stale-while-revalidate strategy for API data
- **📲 Responsive Design**: Works seamlessly on desktop, tablet, and mobile

## 🛠️ Technology Stack

### Frontend
- **Framework**: React 18 with React Router
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Icons**: Lucide React
- **PWA**: vite-plugin-pwa with Workbox

### Backend (Serverless)
- **Platform**: Vercel Functions / Netlify Functions
- **OCR**: Google Cloud Vision API (free tier: 1,000 units/month)

### Database
- **Primary**: Firebase Firestore (free tier)
  - Authentication: Firebase Auth
  - Storage: Firebase Storage (optional)

### Hosting
- **Recommended**: Vercel or Netlify (free tiers with auto-deploy)

## 📦 Installation & Setup

### Prerequisites
- Node.js 18+ and npm/yarn
- Firebase account
- Google Cloud account (for Vision API)

### Step 1: Clone and Install Dependencies

```bash
git clone <your-repo-url>
cd bill-reader
npm install
```

### Step 2: Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable **Authentication** → Email/Password sign-in method
4. Enable **Firestore Database** in test mode
5. Get your Firebase configuration:
   - Go to Project Settings → General
   - Under "Your apps", click on Web app
   - Copy the configuration values

### Step 3: Google Cloud Vision API Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable the **Cloud Vision API**
4. Go to **APIs & Services → Credentials**
5. Create an **API Key** (restrict to Vision API for security)

### Step 4: Environment Configuration

Create a `.env` file in the root directory:

```bash
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# Google Cloud Vision API
GOOGLE_CLOUD_VISION_API_KEY=your_google_cloud_vision_api_key
```

### Step 5: Run Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` to see the app running.

## 🚀 Deployment

### Deploy to Vercel

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Deploy:
```bash
vercel
```

3. Set environment variables in Vercel dashboard:
   - Go to Project Settings → Environment Variables
   - Add all variables from your `.env` file

### Deploy to Netlify

1. Install Netlify CLI:
```bash
npm install -g netlify-cli
```

2. Deploy:
```bash
netlify deploy --prod
```

3. Set environment variables in Netlify dashboard:
   - Go to Site Settings → Environment Variables
   - Add all variables from your `.env` file

### Auto-Deploy with Git

Both Vercel and Netlify support automatic deployments:

1. Push your code to GitHub/GitLab
2. Import the repository in Vercel/Netlify dashboard
3. Configure environment variables
4. Every push to main branch triggers automatic deployment

## 📱 PWA Installation

### On Mobile (Android/iOS)
1. Open the app in your browser
2. Look for "Add to Home Screen" or "Install App" prompt
3. Follow the installation instructions

### On Desktop (Chrome/Edge)
1. Look for the install icon in the address bar
2. Click "Install Fuel Tracker Pro"

## 🗂️ Project Structure

```
fuel-tracker-pro/
├── api/
│   └── ocr.js              # Serverless function for OCR
├── public/
│   ├── icons/              # PWA icons (various sizes)
│   └── robots.txt
├── src/
│   ├── components/
│   │   └── Layout.jsx      # Main layout component
│   ├── config/
│   │   └── firebase.js     # Firebase configuration
│   ├── contexts/
│   │   └── AuthContext.jsx # Authentication context
│   ├── data/
│   │   └── bikeDatabase.json # Motorcycle specifications
│   ├── hooks/
│   │   └── useAuth.js      # Authentication hook
│   ├── pages/
│   │   ├── BikeProfile.jsx # Bike profile management
│   │   ├── Dashboard.jsx   # Analytics dashboard
│   │   ├── FuelHistory.jsx # Fuel records history
│   │   ├── Login.jsx       # Login page
│   │   ├── Register.jsx    # Registration page
│   │   └── ScanBill.jsx    # Bill scanning interface
│   ├── App.jsx             # Main app component
│   ├── index.css           # Global styles
│   └── main.jsx            # Entry point
├── .gitignore
├── index.html
├── netlify.toml            # Netlify configuration
├── package.json
├── postcss.config.js
├── tailwind.config.js
├── vercel.json             # Vercel configuration
└── vite.config.js          # Vite + PWA configuration
```

## 🔐 Firestore Security Rules

Apply these security rules in Firebase Console:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Fuel Records
    match /fuelRecords/{recordId} {
      allow read, write: if request.auth != null 
        && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null 
        && request.auth.uid == request.resource.data.userId;
    }
    
    // Bike Profiles
    match /bikeProfiles/{userId} {
      allow read, write: if request.auth != null 
        && request.auth.uid == userId;
    }
  }
}
```

## 📊 Database Schema

### fuelRecords Collection
```javascript
{
  userId: string,          // Firebase Auth UID
  date: string,            // ISO 8601 format
  amount: number,          // Total cost in currency
  fuelVolume: number,      // Liters
  odometerReading: number, // Kilometers
  fuelType: string,        // "Petrol" or "Diesel"
  createdAt: string        // ISO 8601 timestamp
}
```

### bikeProfiles Collection
```javascript
{
  userId: string,
  make: string,
  model: string,
  year: string,
  engineCapacity: string,  // cc
  fuelCapacity: string,    // Liters
  mileageStandard: string, // km/l
  fuelType: string,
  updatedAt: string
}
```

## 🎨 Adding Custom Bike Models

Edit `src/data/bikeDatabase.json` to add more motorcycle models:

```json
{
  "BrandName": [
    {
      "model": "Model Name",
      "engineCapacity": "150",
      "fuelCapacity": "12.5",
      "mileageStandard": "45",
      "fuelType": "Petrol"
    }
  ]
}
```

## 🔧 Customization

### Theme Colors
Edit `tailwind.config.js` to change the primary color scheme:

```javascript
theme: {
  extend: {
    colors: {
      primary: {
        // Your color palette
      }
    }
  }
}
```

### PWA Configuration
Edit `vite.config.js` to customize PWA behavior, caching strategies, and manifest details.

## 📈 Future Enhancements

- [ ] Web Push Notifications for fuel-up reminders
- [ ] Export data to CSV/PDF
- [ ] Expense categories and tags
- [ ] Multi-vehicle support
- [ ] Social features (compare with friends)
- [ ] Integration with fuel price APIs
- [ ] AI-powered fuel efficiency tips
- [ ] Dark mode support

## 🐛 Troubleshooting

### OCR Not Working
- Verify Google Cloud Vision API key is correctly set
- Check API is enabled in Google Cloud Console
- Ensure you haven't exceeded free tier limits (1,000 calls/month)

### Firebase Connection Issues
- Verify all Firebase environment variables are set correctly
- Check Firebase project configuration in Firebase Console
- Ensure Firestore and Authentication are enabled

### PWA Not Installing
- Check that the app is served over HTTPS (localhost or deployed)
- Verify service worker is registered (check browser DevTools)
- Ensure manifest.json is correctly configured

## 📝 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For issues and questions, please open an issue on GitHub.

---

Built with ❤️ for motorcycle enthusiasts

