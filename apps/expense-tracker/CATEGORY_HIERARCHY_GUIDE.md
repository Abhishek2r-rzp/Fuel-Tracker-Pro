# Category Hierarchy System

## Overview

The expense tracker now features a comprehensive **hierarchical categorization system** with:
- **Main Categories** (25 top-level categories)
- **Subcategories/Merchants** (100+ specific merchants and subcategories)

This provides granular control over transaction tracking while maintaining easy visualization.

## Main Categories

### 💰 Income
- Salary
- Freelance
- Business Income
- Interest
- Dividends
- Rental Income
- Cashback
- Refunds
- Rewards
- Others

### 🍔 Food & Dining
- Swiggy
- Zomato
- Uber Eats
- Restaurants
- Cafes
- Fast Food
- Others

### 🛒 Groceries
- BigBasket
- Blinkit
- Zepto
- Dunzo
- DMart
- JioMart
- Supermarkets
- Local Stores
- Others

### 🛍️ Shopping - Online
- Amazon
- Flipkart
- Myntra
- Ajio
- Nykaa
- Others

### 🛍️ Shopping - Retail
- Clothing
- Electronics
- Home & Garden
- Personal Care
- Others

### 🚗 Transport
- Uber
- Ola
- Rapido
- Metro
- Bus
- Train
- Auto
- Fuel
- Parking
- Others

### 🎬 Entertainment
- Netflix
- Prime Video
- Hotstar
- Spotify
- YouTube Premium
- BookMyShow
- PVR
- Movies
- Events
- Gaming
- Others

### 🏥 Healthcare
- Hospitals
- Clinics
- Medicines
- Lab Tests
- Gym
- Fitness
- Others

### 💡 Utilities
- Electricity
- Water
- Gas
- Internet
- Mobile
- DTH
- Broadband
- Others

### 📚 Education
- School Fees
- College Fees
- Courses
- Books
- Tuition
- Training
- Others

### ✈️ Travel
- MakeMyTrip
- Airbnb
- OYO
- Goibibo
- Yatra
- Flights
- Hotels
- Vacation
- Others

### 📈 Investments
- Groww
- Zerodha
- Upstox
- Mutual Funds
- Stocks
- SIP
- Gold
- Real Estate
- Crypto
- Others

### 🛡️ Insurance
- Life Insurance
- Health Insurance
- Vehicle Insurance
- Home Insurance
- Others

### 🏠 Rent & Housing
- House Rent
- Maintenance
- Property Tax
- Home Loan EMI
- Others

### 📄 Bills & Fees
- Bank Fees
- Service Charges
- Late Fees
- Legal Fees
- Government Fees
- Others

### 💳 Credit Card Bills
- HDFC
- ICICI
- SBI
- Axis
- Cred
- Amazon Pay
- Others

### 📱 Subscriptions
- Streaming Services
- Cloud Storage
- Software
- Magazines
- News
- Others

### 💆 Personal Care
- Salon
- Spa
- Grooming
- Cosmetics
- Others

### 🎁 Gifts & Donations
- Gifts
- Charity
- Religious
- Social Causes
- Others

### 💸 Transfers
- Family
- Friends
- Business
- Wallet Transfers
- Paytm
- PhonePe
- GPay
- Others

### 💼 Business
- Office Supplies
- Equipment
- Marketing
- Professional Services
- Others

### 🐾 Pets
- Pet Food
- Veterinary
- Pet Supplies
- Grooming
- Others

### 👶 Kids
- Daycare
- Toys
- Clothing
- Activities
- Others

### 🏧 ATM
- Cash Withdrawal
- ATM Fees
- Others

### 📌 Others
- Miscellaneous
- Unknown
- Uncategorized

## Features

### 1. Upload Statement View
When you upload a statement, the system now displays:
- **Total Main Categories Found** - Number of top-level categories
- **Expandable Category Breakdown** - Click to see detailed view
  - Each main category shows:
    - Category emoji and name
    - Transaction count
    - List of all subcategories/merchants found

### 2. Helper Functions

#### `getMainCategory(category)`
Returns the main category for any subcategory.
```javascript
getMainCategory("Swiggy") // Returns "Food & Dining"
getMainCategory("Income") // Returns "Income"
```

#### `getSubcategories(mainCategory)`
Returns all subcategories for a main category.
```javascript
getSubcategories("Food & Dining")
// Returns ["Swiggy", "Zomato", "Uber Eats", ...]
```

#### `getAllMainCategories()`
Returns list of all main categories.

#### `getCategoryHierarchyDisplay(category)`
Returns formatted hierarchy display.
```javascript
getCategoryHierarchyDisplay("Swiggy")
// Returns "🍔 Food & Dining → 🍽️ Swiggy"
```

## Benefits

1. **Granular Control**: Track specific merchants while maintaining category grouping
2. **Better Insights**: See which merchants you spend most on within each category
3. **Easy Management**: Main categories keep the UI clean, subcategories provide detail
4. **Flexibility**: Each transaction can be categorized at the merchant level
5. **Comprehensive**: Covers all common expense types plus income and investments

## Auto-Categorization

The system automatically:
1. Detects merchants from transaction descriptions
2. Maps them to appropriate subcategories
3. Groups them under main categories
4. Displays the hierarchy in upload preview

## Usage Example

When you upload a bank statement with transactions from:
- Swiggy (₹500)
- Zomato (₹300)
- Amazon (₹1200)
- BigBasket (₹800)

The system will show:
- **4 Main Categories Found**
  - 🍔 Food & Dining (2 transactions)
    - Swiggy
    - Zomato
  - 🛍️ Shopping - Online (1 transaction)
    - Amazon
  - 🛒 Groceries (1 transaction)
    - BigBasket

