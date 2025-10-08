# Visual Database Architecture

## High-Level System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          EXPENSE TRACKER SYSTEM                              │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────┐         ┌──────────────────┐         ┌─────────────────┐
│   React App     │         │  Firebase Auth   │         │ Firestore DB    │
│   (Frontend)    │◄───────►│  (Identity)      │◄───────►│  (Data Store)   │
└────────┬────────┘         └──────────────────┘         └────────┬────────┘
         │                                                          │
         │                                                          │
    ┌────▼──────────────────────────────────────────────────────────▼────┐
    │                      APPLICATION LAYER                             │
    ├────────────────────────────────────────────────────────────────────┤
    │                                                                    │
    │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐           │
    │  │   Upload     │  │Transactions  │  │  Dashboard   │           │
    │  │   Manager    │  │   Manager    │  │  Analytics   │           │
    │  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘           │
    │         │                  │                  │                   │
    │  ┌──────▼──────────────────▼──────────────────▼──────┐           │
    │  │           FIRESTORE SERVICES LAYER                 │           │
    │  ├────────────────────────────────────────────────────┤           │
    │  │  • Transaction Service                             │           │
    │  │  • Statement Service                               │           │
    │  │  • Credit Card Service                             │           │
    │  │  • Tag Service                                     │           │
    │  └────────────────────────────────────────────────────┘           │
    │         │                  │                  │                   │
    │  ┌──────▼──────────────────▼──────────────────▼──────┐           │
    │  │           PROCESSING LAYER                         │           │
    │  ├────────────────────────────────────────────────────┤           │
    │  │  • File Parser (PDF/Excel/CSV)                     │           │
    │  │  • Transaction Normalizer                          │           │
    │  │  • Category Detector                               │           │
    │  │  • Duplicate Detector                              │           │
    │  └────────────────────────────────────────────────────┘           │
    │                                                                    │
    └────────────────────────────────────────────────────────────────────┘
```

## Database Collections Overview

```
┌───────────────────────── FIRESTORE DATABASE ─────────────────────────┐
│                                                                       │
│  ┌────────────────────┐  ┌────────────────────┐  ┌────────────────┐│
│  │expenseTransactions │  │ expenseStatements  │  │  creditCards   ││
│  │                    │  │                    │  │                ││
│  │  367 documents     │  │   1 document       │  │  0 documents   ││
│  │  Total: 5.2 MB     │  │   Total: 2 KB      │  │  Total: 0 KB   ││
│  └────────┬───────────┘  └─────────┬──────────┘  └────────┬───────┘│
│           │                        │                       │        │
│           └────────────────────────┴───────────────────────┘        │
│                                    │                                │
│  ┌────────────────────────────────┴──────────────────┐             │
│  │              creditCardTransactions                │             │
│  │                                                    │             │
│  │                0 documents                         │             │
│  │                Total: 0 KB                         │             │
│  └────────────────────────────────────────────────────┘             │
│                                                                     │
│  ┌────────────────────────────────────────────────────┐            │
│  │                  expenseTags                       │            │
│  │                                                    │            │
│  │                  0 documents                       │            │
│  │                  Total: 0 KB                       │            │
│  └────────────────────────────────────────────────────┘            │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## Transaction Document Structure

```
┌─────────────────── TRANSACTION DOCUMENT ───────────────────┐
│                                                             │
│  Document ID: "abc123xyz..."                               │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │            CORE FIELDS (Required)                   │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │  userId: "xR3kL9mP2Yc..."                          │   │
│  │  date: Timestamp(2025-08-29)                        │   │
│  │  description: "FT- RZP6075 SALARY AUG25..."         │   │
│  │  amount: 143358.00                                  │   │
│  │  type: "credit"                                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │         CATEGORIZATION (Auto-detected)              │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │  category: "Income"                                 │   │
│  │  merchant: "Razorpay"                               │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │          TAGGING (User-defined)                     │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │  tags: ["Work", "Salary"]                           │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │       RELATIONSHIPS (Optional)                      │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │  statementId: "stmt123abc..."                       │   │
│  │  linkedCreditCardId: null                           │   │
│  │  isCreditCardPayment: false                         │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │         METADATA (Auto-managed)                     │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │  createdAt: Timestamp(2025-10-08 10:30:00)          │   │
│  │  updatedAt: Timestamp(2025-10-08 10:30:00)          │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Complete Upload Flow (Step-by-Step)

```
USER ACTION                    PROCESSING                       DATABASE
─────────────────────────────────────────────────────────────────────────

1. Select File
   (Excel/CSV/PDF)
         │
         ▼
2. Upload File ───────────► File Processor
   Drag & Drop                    │
                                  ▼
                          Detect File Type
                                  │
                    ┌─────────────┼─────────────┐
                    │             │             │
                    ▼             ▼             ▼
                 PDF Parser   Excel Parser  CSV Parser
                    │             │             │
                    └─────────────┴─────────────┘
                                  │
                                  ▼
                          Extract Raw Data
                          [[Row1], [Row2]...]
                                  │
                                  ▼
3. Parse & Normalize ──────► Transaction Normalizer
                                  │
                          • Detect date columns
                          • Detect amount columns
                          • Determine credit/debit
                          • Clean & format data
                                  │
                                  ▼
                          Normalized Transactions
                          [{date, amount, desc}, ...]
                                  │
                                  ▼
4. Auto-Categorize ────────► Category Detector
                                  │
                          • Match patterns
                          • Check amount type
                          • Assign category
                          • Detect merchant
                                  │
                                  ▼
                          Categorized Transactions
                          [{...prev, category, merchant}, ...]
                                  │
                                  ▼
5. Check Duplicates ───────► Duplicate Detector ──────► QUERY
                                  │                          │
                          • Fetch existing txns              ▼
                          • Compare dates              ┌─────────────┐
                          • Compare amounts            │ Firestore   │
                          • Flag matches               │ (Read)      │
                                  │                    └─────────────┘
                                  ▼
                          New + Duplicate Lists
                          {new: [...], dup: [...]}
                                  │
                                  ▼
6. Preview Display ────────► Show Category Breakdown
   • 9 Categories Found         • Income: 46 txns
   • 367 Transactions           • Transfers: 274 txns
   • Expand to see details      • Healthcare: 19 txns
                                  │
                                  ▼
7. User Reviews
   • Sees preview
   • Checks categories
   • Decides: Skip/Import duplicates
         │
         ▼
8. Click "Save" ──────────► Firestore Service
         │                         │
         │                         ▼
         │                  Create Statement Record
         │                         │                    ┌─────────────┐
         │                         ├───────────────────►│expenseStatements│
         │                         │                    │  (Write)    │
         │                         │                    └─────────────┘
         │                         │
         │                         ▼
         │                  Batch Create Transactions
         │                         │
         │                  • Clean data
         │                  • Add userId
         │                  • Add statementId
         │                  • Add timestamps
         │                         │                    ┌─────────────┐
         │                         ├───────────────────►│expenseTransactions│
         │                         │                    │  (Batch Write)│
         │                         │                    └─────────────┘
         │                         │
         │                         ▼
         │                  Return Success
         │                         │
         ▼                         ▼
9. Navigate to ────────────► Transactions List
   Transactions Page
         │
         ▼
10. View Data ─────────────► Fetch & Display ──────────► QUERY
    • Paginated                   │                           │
    • Sorted by date              ▼                           ▼
    • Filtered                Display Table             ┌─────────────┐
                              • Category badges         │ Firestore   │
                              • Amount formatting       │ (Read)      │
                              • Actions (Edit/Delete)   └─────────────┘
```

## Category Hierarchy Visualization

```
┌───────────────────────── CATEGORY SYSTEM ────────────────────────┐
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │               MAIN CATEGORIES (25 total)                 │   │
│  ├──────────────────────────────────────────────────────────┤   │
│  │                                                          │   │
│  │  💰 Income                     🛒 Groceries             │   │
│  │    └─ Salary                     └─ BigBasket           │   │
│  │    └─ Freelance                  └─ Blinkit             │   │
│  │    └─ Cashback                   └─ Zepto               │   │
│  │    └─ Refunds                    └─ DMart               │   │
│  │                                                          │   │
│  │  🍔 Food & Dining              🚗 Transport             │   │
│  │    └─ Swiggy                     └─ Uber                │   │
│  │    └─ Zomato                     └─ Ola                 │   │
│  │    └─ Restaurants                └─ Rapido              │   │
│  │    └─ Cafes                      └─ Fuel                │   │
│  │                                                          │   │
│  │  🛍️ Shopping - Online          🎬 Entertainment         │   │
│  │    └─ Amazon                     └─ Netflix             │   │
│  │    └─ Flipkart                   └─ Prime Video         │   │
│  │    └─ Myntra                     └─ Spotify             │   │
│  │    └─ Ajio                       └─ BookMyShow          │   │
│  │                                                          │   │
│  │  🏥 Healthcare                  💡 Utilities            │   │
│  │    └─ Hospitals                  └─ Electricity         │   │
│  │    └─ Medicines                  └─ Water               │   │
│  │    └─ Gym                        └─ Internet            │   │
│  │    └─ Fitness                    └─ Mobile              │   │
│  │                                                          │   │
│  │  📈 Investments                 🏠 Rent & Housing       │   │
│  │    └─ Groww                      └─ House Rent          │   │
│  │    └─ Zerodha                    └─ Maintenance         │   │
│  │    └─ Mutual Funds               └─ Property Tax        │   │
│  │    └─ SIP                                               │   │
│  │                                                          │   │
│  │  💳 Credit Card Bills           💸 Transfers            │   │
│  │    └─ HDFC                       └─ Family              │   │
│  │    └─ ICICI                      └─ Friends             │   │
│  │    └─ Cred                       └─ UPI                 │   │
│  │                                                          │   │
│  │  [+ 10 more categories...]                              │   │
│  │                                                          │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘
```

## Query Performance & Indexes

```
┌──────────────────── FIRESTORE INDEXES ────────────────────┐
│                                                            │
│  Index 1: User Transactions by Date                       │
│  ┌────────────────────────────────────────────────────┐   │
│  │  Collection: expenseTransactions                   │   │
│  │  Fields:                                           │   │
│  │    • userId (Ascending)   ◄─── First filter        │   │
│  │    • date (Descending)    ◄─── Then sort           │   │
│  └────────────────────────────────────────────────────┘   │
│                                                            │
│  Query Pattern:                                            │
│  WHERE userId == "abc123"                                  │
│  ORDER BY date DESC                                        │
│  ────────────────────────────────────────────────────►    │
│  ✅ Fast: Uses index                                       │
│  ⚡ Returns: 367 docs in ~200ms                            │
│                                                            │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  Index 2: User Transactions by Category & Date            │
│  ┌────────────────────────────────────────────────────┐   │
│  │  Collection: expenseTransactions                   │   │
│  │  Fields:                                           │   │
│  │    • userId (Ascending)     ◄─── First filter      │   │
│  │    • category (Ascending)   ◄─── Second filter     │   │
│  │    • date (Descending)      ◄─── Then sort         │   │
│  └────────────────────────────────────────────────────┘   │
│                                                            │
│  Query Pattern:                                            │
│  WHERE userId == "abc123"                                  │
│  WHERE category == "Income"                                │
│  ORDER BY date DESC                                        │
│  ────────────────────────────────────────────────────►    │
│  ✅ Fast: Uses index                                       │
│  ⚡ Returns: 46 docs in ~100ms                             │
│                                                            │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  Index 3: User Tags Array Contains                        │
│  ┌────────────────────────────────────────────────────┐   │
│  │  Collection: expenseTransactions                   │   │
│  │  Fields:                                           │   │
│  │    • userId (Ascending)                            │   │
│  │    • tags (Array Contains)                         │   │
│  └────────────────────────────────────────────────────┘   │
│                                                            │
│  Query Pattern:                                            │
│  WHERE userId == "abc123"                                  │
│  WHERE tags array-contains "Work"                          │
│  ────────────────────────────────────────────────────►    │
│  ✅ Fast: Uses index                                       │
│  ⚡ Returns: filtered docs in ~150ms                       │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

## Credit Card Linking Architecture

```
┌────────────────── CREDIT CARD SYSTEM ──────────────────┐
│                                                         │
│  Step 1: User finds payment transaction                │
│  ┌─────────────────────────────────────────────────┐   │
│  │  expenseTransactions/payment123                 │   │
│  │                                                 │   │
│  │  description: "CRED CLUB - PAYMENT"            │   │
│  │  amount: -15000                                │   │
│  │  category: "Credit Card Bills"                 │   │
│  │  linkedCreditCardId: null  ◄── Not linked yet  │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  Step 2: Upload CC statement → Creates card record     │
│  ┌─────────────────────────────────────────────────┐   │
│  │  creditCards/card456                            │   │
│  │                                                 │   │
│  │  userId: "abc123"                              │   │
│  │  paymentTransactionId: "payment123" ◄── Link!  │   │
│  │  bank: "HDFC"                                  │   │
│  │  last4: "7890"                                 │   │
│  └─────────────────────────────────────────────────┘   │
│           │                                             │
│           │ Creates                                     │
│           ▼                                             │
│  Step 3: Create CC transactions                        │
│  ┌─────────────────────────────────────────────────┐   │
│  │  creditCardTransactions/cc001                   │   │
│  │                                                 │   │
│  │  creditCardId: "card456"      ◄── Link to card │   │
│  │  paymentTransactionId: "payment123"            │   │
│  │  description: "AMAZON PURCHASE"                │   │
│  │  amount: -2500                                 │   │
│  │  excludeFromMainExpenses: true  ◄── Important! │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │  creditCardTransactions/cc002                   │   │
│  │  creditCardId: "card456"                       │   │
│  │  description: "SWIGGY ORDER"                   │   │
│  │  amount: -500                                  │   │
│  │  excludeFromMainExpenses: true                 │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  Step 4: Update payment transaction                    │
│  ┌─────────────────────────────────────────────────┐   │
│  │  expenseTransactions/payment123                 │   │
│  │                                                 │   │
│  │  linkedCreditCardId: "card456"  ◄── Now linked │   │
│  │  hasLinkedStatement: true                      │   │
│  │  linkedTransactionCount: 2                     │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  Result: No double-counting!                           │
│  • Main list shows payment: -₹15,000                   │
│  • CC transactions excluded from main list             │
│  • Detailed breakdown available on click               │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## Data Size & Scalability

```
┌─────────────── CURRENT STATE ─────────────┐
│                                            │
│  Total Transactions: 367                   │
│  Average Size: ~14 KB per doc              │
│  Total Data: ~5.2 MB                       │
│                                            │
│  Monthly Growth (estimated):               │
│  • 100 transactions/month                  │
│  • ~1.4 MB/month                           │
│                                            │
│  Projected (1 year):                       │
│  • 1,567 transactions                      │
│  • ~22 MB                                  │
│                                            │
│  Firestore Limits:                         │
│  • Max doc size: 1 MB      ✅ OK           │
│  • Max query results: 500  ✅ OK (paginated)│
│  • Daily reads: 50K free   ✅ OK           │
│  • Daily writes: 20K free  ✅ OK           │
│                                            │
└────────────────────────────────────────────┘
```

This comprehensive documentation covers the complete database schema, data flow, and architecture of your expense tracker!

