# 📱 Features Documentation

Complete guide to all features available in the Bill Reader monorepo applications.

---

## 📋 Table of Contents

1. [Expense Tracker Features](#expense-tracker-features)
2. [Fuel Tracker Features](#fuel-tracker-features)
3. [Smart Scanning & OCR](#smart-scanning--ocr)
4. [Merchant & Tagging System](#merchant--tagging-system)
5. [Analytics & Insights](#analytics--insights)
6. [Data Management](#data-management)

---

## 💰 Expense Tracker Features

### 1. Statement Upload & Processing

#### Supported Formats:
- **CSV** - Bank statement exports
- **PDF** - Digital bank statements
- **Excel** (.xlsx) - Exported transaction data
- **Images** - Receipt/bill photos (OCR)

#### Auto-Detection:
- Transaction dates
- Amounts (credit/debit)
- Merchant names
- Categories
- Payment methods

#### Statement History:
- View all uploaded statements
- Track processing status
- See transaction counts
- Delete statements with associated transactions
- Re-process failed uploads

### 2. Intelligent Categorization

#### Auto-Categorization:
The system automatically categorizes transactions based on merchant names and descriptions:

**Income:**
- Salary payments (RAZORPAY, SALARY credits)
- Investments returns
- Interest earned

**Shopping:**
- Online: Amazon, Flipkart, Myntra
- In-store: BigBazaar, Reliance

**Food & Dining:**
- Restaurants: Swiggy, Zomato, McDonald's
- Cafes & Quick Bites

**Transportation:**
- Fuel stations
- Uber, Ola rides
- Public transport

**Bills & Utilities:**
- Electricity, water, gas
- Internet, mobile recharge
- DTH, streaming services

**Credit Card Bills:**
- Automatic detection
- Payment tracking
- Bill amount monitoring

**Rent & Housing:**
- Rent payments
- Maintenance charges

**Investments:**
- Mutual funds
- Stocks, bonds
- SIPs

### 3. Transaction Management

#### Features:
- **Search** - Find transactions by description, amount, or merchant
- **Filter** - By category, date range, amount range
- **Bulk Operations** - Delete multiple transactions
- **Edit** - Modify category, add notes
- **Pagination** - Handle thousands of transactions efficiently

#### Views:
- **Table View** - Detailed list with all information
- **Card View** - Mobile-friendly cards (responsive)
- **Calendar View** - See transactions by date

### 4. Credit Card Management

#### Track Credit Cards:
- Add multiple credit cards
- Link card statements
- Track payment due dates
- Monitor credit utilization
- View itemized transactions

#### Features:
- Upload credit card statements separately
- Automatic categorization of card transactions
- Prevent double-counting in expenses
- Link card payments to main account

### 5. Dashboard & Analytics

#### Summary Cards:
- Total Income (this month)
- Total Expenses (this month)
- Net Savings
- Credit Card Bills due

#### Category Breakdown:
- Visual pie charts
- Spending by category
- Top merchants
- Trends over time

#### Monthly Trends:
- Income vs Expenses graph
- Category-wise spending
- Month-over-month comparison
- Year-over-year analysis

#### Custom Date Ranges:
- This Month
- Last Month
- Last 3 Months
- Custom Range

---

## ⛽ Fuel Tracker Features

### 1. Fuel Record Management

#### Add Fuel Records:
- **Manual Entry** - Quick form input
- **Scan Bill** - OCR extraction from images
- Auto-fill bike details

#### Tracked Information:
- Date & time
- Odometer reading
- Fuel quantity (liters)
- Price per liter
- Total cost
- Station name & address
- Invoice number

### 2. Smart Bill Scanning (OCR)

#### Automatic Extraction:
- Date & time from bill
- Fuel quantity
- Price per liter
- Total amount
- Station name & address
- Invoice/transaction number

#### OCR Features:
- Works with phone photos
- Handles various bill formats
- Indian fuel station bills optimized
- Real-time feedback
- Manual correction if needed

#### Supported Station Formats:
- Indian Oil
- Bharat Petroleum
- Hindustan Petroleum
- Shell
- Reliance
- Nayara Energy

### 3. Mileage Calculation

#### Automatic Calculation:
```
Mileage = Distance Traveled / Fuel Consumed
Distance = Current Odometer - Previous Odometer
```

#### Features:
- Real-time mileage tracking
- Average mileage calculation
- Compare with manufacturer's claimed mileage
- Mileage trends over time
- Best/Worst mileage records

### 4. Bike Profile Management

#### Profile Information:
- Make & Model
- Year of manufacture
- Registration number
- Current odometer reading

#### Bike Specifications (Auto-filled):
- Engine capacity
- Fuel tank capacity
- Manufacturer's mileage
- Engine type

#### API Integration:
Uses API Ninjas Motorcycle API for:
- Auto-complete bike make
- Fetch bike models
- Get specifications
- Verify bike details

### 5. Fuel Station Information

#### Station Tracking:
- Station name from OCR
- Address from bill
- Automatic saving
- History of stations used
- Most frequent stations

#### Features:
- View all stations visited
- See fuel records per station
- Compare prices across stations
- Track station quality (via mileage)

### 6. Dashboard & Analytics

#### Summary Cards:
- Total fuel expense (this month)
- Average mileage
- Total distance traveled
- Fuel efficiency trend

#### Charts & Graphs:
- Mileage over time
- Fuel price trends
- Spending analysis
- Distance covered

#### Insights:
- Best mileage achieved
- Most expensive refuel
- Average cost per km
- Monthly fuel budget

---

## 🔍 Smart Scanning & OCR

### OCR Service Features

#### Supported Document Types:
1. **Bank Statements (PDF/Images)**
   - Transaction extraction
   - Date parsing
   - Amount detection
   - Merchant identification

2. **Receipts & Bills (Images)**
   - Receipt OCR
   - Item-level parsing
   - Tax detection
   - Total amount extraction

3. **Fuel Bills (Images)**
   - Quantity extraction
   - Price per liter
   - Total cost
   - Station info
   - Invoice number

#### OCR Capabilities:
- Text extraction from images
- Pattern recognition
- Date format parsing (multiple formats)
- Currency detection (₹ symbol)
- Numeric value extraction
- Station address parsing

#### Accuracy Features:
- Multiple pattern matching
- Fallback patterns
- Error correction
- Manual review option
- Confidence scoring

### Free OCR Setup

The app uses client-side OCR (Tesseract.js) - no API key needed!

#### Benefits:
- ✅ **100% Free** - No API costs
- ✅ **Privacy** - Data stays on device
- ✅ **No Limits** - Unlimited scans
- ✅ **Offline** - Works without internet (after initial load)

#### How It Works:
1. User uploads image
2. Tesseract.js processes locally
3. Text extracted on device
4. Patterns matched for data
5. Results shown for confirmation

---

## 🏷️ Merchant & Tagging System

### Merchant-Focused Tracking

#### Automatic Merchant Detection:
- Extracts merchant name from description
- Groups transactions by merchant
- Tracks spending per merchant
- Identifies top merchants

#### Merchant Categories:
Transactions are grouped by both:
1. **Main Category** (e.g., Shopping)
2. **Sub-category/Merchant** (e.g., Amazon)

#### Hierarchical Structure:
```
Shopping
  ├── Amazon
  ├── Flipkart
  └── Myntra

Food & Dining
  ├── Swiggy
  ├── Zomato
  └── McDonald's
```

### Custom Tags

#### Tag Management:
- Create custom tags
- Assign colors & icons
- Tag multiple transactions
- Filter by tags
- Tag-based analytics

#### Use Cases:
- **Project Tags** - Track business expenses
- **Trip Tags** - Vacation spending
- **Family Tags** - Family member expenses
- **Tax Tags** - Tax-deductible expenses

#### Bulk Tagging:
- Select multiple transactions
- Apply tags in bulk
- Remove tags in bulk
- Tag search & filter

---

## 📊 Analytics & Insights

### Dashboard Analytics

#### Real-Time Metrics:
- Current month income/expense
- Net savings this month
- Category-wise breakdown
- Top spending categories

#### Trends:
- Monthly comparison
- Year-over-year growth
- Seasonal patterns
- Spending habits

### Charts & Visualizations:
- **Pie Charts** - Category distribution
- **Line Charts** - Trends over time
- **Bar Charts** - Monthly comparison
- **Area Charts** - Cumulative spending

### Custom Reports:
- Date range selection
- Category filtering
- Merchant filtering
- Export capabilities

---

## 💾 Data Management

### Bulk Operations

#### Bulk Delete:
- Select all in page
- Delete all transactions
- Delete by category
- Delete by date range
- Confirmation required

#### Bulk Categorize:
- Select multiple transactions
- Change category in bulk
- Preview changes
- Apply to similar transactions

#### Bulk Tag:
- Select transactions
- Apply tags to all
- Remove tags from all
- Manage tag assignments

### Data Export/Import

#### Export Options:
- CSV format
- Excel format
- JSON format
- Date range selection
- Category filtering

#### Import Options:
- Upload CSV files
- Upload Excel files
- Map columns
- Preview before import
- Duplicate detection

### Data Sync

#### Features:
- Real-time sync across devices
- Automatic conflict resolution
- Offline support
- Background sync
- Sync status indicator

---

## 🎨 UI/UX Features

### Responsive Design

#### Mobile-First:
- Touch-optimized controls
- Swipe gestures
- Bottom navigation
- Hamburger menu
- Card-based layout

#### Desktop Features:
- Sidebar navigation
- Table views
- Advanced filters
- Multi-column layouts
- Keyboard shortcuts

### Dark Mode

#### Features:
- System preference detection
- Manual toggle
- Persistent across sessions
- All pages supported
- Smooth transitions

### Accessibility

#### A11y Features:
- Keyboard navigation
- Screen reader support
- High contrast mode
- Focus indicators
- ARIA labels

---

## 🔔 Notifications & Alerts

### Alert Types:
- Success messages
- Error notifications
- Warning alerts
- Info messages
- Confirmation dialogs

### Use Cases:
- Upload successful
- Processing complete
- Error in categorization
- Data saved
- Sync completed

---

## 🔐 Security Features

### Authentication:
- Email/Password
- Google Sign-in
- OTP verification (if enabled)
- Password reset
- Session management

### Data Security:
- Firebase security rules
- User-specific data isolation
- Secure file uploads
- Encrypted connections
- No data sharing

### Privacy:
- Data stays in your Firebase
- No third-party analytics (optional)
- No data selling
- GDPR compliant
- User-controlled deletion

---

## 🚀 Performance Features

### Optimizations:
- Lazy loading
- Image optimization
- Code splitting
- Caching strategies
- Firestore indexes

### PWA Features:
- Installable app
- Offline support
- Background sync
- Push notifications (if enabled)
- Fast loading

---

## 📱 Mobile Features

### Native-Like Experience:
- Add to home screen
- Full-screen mode
- Splash screen
- App icons
- Touch gestures

### Mobile-Specific:
- Camera access for scanning
- Location services
- Touch-optimized forms
- Swipe actions
- Bottom sheets

---

## 🔮 Upcoming Features

### Planned:
- Budget tracking
- Recurring transactions
- Split bills
- Multi-currency support
- Investment tracking
- Tax reports
- Receipt storage
- Expense sharing

---

## 💡 Feature Flags

Enable/disable features in `config/features.js`:

```javascript
export const FEATURES = {
  ENABLE_OCR: true,
  ENABLE_STATION_INFO: true,
  ENABLE_BULK_DELETE: true,
  ENABLE_DARK_MODE: true,
  ENABLE_TAGS: true,
  ENABLE_EXPORT: true,
};
```

---

**Want to request a feature?** Open an issue or contact the development team!

