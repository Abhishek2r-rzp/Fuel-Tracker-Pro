# Database Schema & Data Flow Documentation

## Table of Contents
1. [Database Overview](#database-overview)
2. [Schema Diagrams](#schema-diagrams)
3. [Collection Details](#collection-details)
4. [Data Flow Diagrams](#data-flow-diagrams)
5. [Relationships](#relationships)
6. [Query Patterns](#query-patterns)

---

## Database Overview

**Database Type:** Firebase Firestore (NoSQL Document Database)  
**Authentication:** Firebase Authentication  
**Storage:** Firebase Storage (for uploaded files)

### Collections

| Collection Name | Purpose | Key Fields |
|----------------|---------|------------|
| `expenseTransactions` | Store all user transactions | userId, date, amount, category |
| `expenseStatements` | Metadata about uploaded files | userId, fileName, transactionCount |
| `expenseCategories` | Custom user categories (future) | userId, name, rules |
| `creditCards` | Credit card statement metadata | userId, bank, cardType |
| `creditCardTransactions` | Transactions from credit cards | creditCardId, paymentTransactionId |
| `expenseTags` | User-defined tags | userId, name, color, icon |

---

## Schema Diagrams

### 1. Core Transaction Schema

```
┌─────────────────────────────────────────────────────────────┐
│                    expenseTransactions                       │
├──────────────────┬──────────────────────────────────────────┤
│ Field            │ Type                 │ Description       │
├──────────────────┼──────────────────────┼──────────────────┤
│ id               │ string (auto)        │ Firestore doc ID  │
│ userId           │ string               │ FK to Auth user   │
│ date             │ Timestamp            │ Transaction date  │
│ description      │ string               │ Full description  │
│ amount           │ number               │ Amount (+ or -)   │
│ type             │ string               │ 'credit'/'debit'  │
│ category         │ string               │ Main category     │
│ merchant         │ string               │ Merchant/subcategory │
│ tags             │ array<string>        │ User-defined tags │
│ statementId      │ string (optional)    │ FK to statement   │
│ isCreditCardPayment │ boolean          │ Is CC payment?    │
│ creditCardInfo   │ object (optional)    │ CC details if applicable │
│ linkedCreditCardId │ string (optional)  │ FK to creditCards │
│ hasLinkedStatement │ boolean            │ Has CC statement? │
│ linkedTransactionCount │ number        │ # of linked txns  │
│ originalData     │ object               │ Raw parsed data   │
│ createdAt        │ Timestamp            │ Record creation   │
│ updatedAt        │ Timestamp            │ Last update       │
└──────────────────┴──────────────────────┴───────────────────┘
```

### 2. Statement Metadata Schema

```
┌─────────────────────────────────────────────────────────────┐
│                    expenseStatements                         │
├──────────────────┬──────────────────────────────────────────┤
│ Field            │ Type                 │ Description       │
├──────────────────┼──────────────────────┼──────────────────┤
│ id               │ string (auto)        │ Firestore doc ID  │
│ userId           │ string               │ FK to Auth user   │
│ fileName         │ string               │ Original filename │
│ fileType         │ string               │ 'pdf'/'excel'/'csv'│
│ fileSize         │ number               │ File size (bytes) │
│ transactionCount │ number               │ # of transactions │
│ duplicateCount   │ number               │ # of duplicates   │
│ uploadedAt       │ Timestamp            │ Upload timestamp  │
└──────────────────┴──────────────────────┴───────────────────┘
```

### 3. Credit Card Schema

```
┌─────────────────────────────────────────────────────────────┐
│                      creditCards                             │
├──────────────────┬──────────────────────────────────────────┤
│ Field            │ Type                 │ Description       │
├──────────────────┼──────────────────────┼──────────────────┤
│ id               │ string (auto)        │ Firestore doc ID  │
│ userId           │ string               │ FK to Auth user   │
│ paymentTransactionId │ string           │ FK to transaction │
│ bank             │ string               │ Bank name         │
│ cardType         │ string               │ Card type         │
│ last4            │ string               │ Last 4 digits     │
│ displayName      │ string               │ Display name      │
│ fileName         │ string               │ Statement filename│
│ uploadDate       │ Timestamp            │ Upload time       │
│ createdAt        │ Timestamp            │ Record creation   │
└──────────────────┴──────────────────────┴───────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                creditCardTransactions                        │
├──────────────────┬──────────────────────────────────────────┤
│ Field            │ Type                 │ Description       │
├──────────────────┼──────────────────────┼──────────────────┤
│ id               │ string (auto)        │ Firestore doc ID  │
│ creditCardId     │ string               │ FK to creditCards │
│ paymentTransactionId │ string           │ FK to transaction │
│ date             │ Timestamp            │ Transaction date  │
│ description      │ string               │ Description       │
│ amount           │ number               │ Amount            │
│ category         │ string               │ Category          │
│ merchant         │ string               │ Merchant          │
│ isCreditCardTransaction │ boolean       │ Always true       │
│ excludeFromMainExpenses │ boolean       │ Always true       │
│ createdAt        │ Timestamp            │ Record creation   │
└──────────────────┴──────────────────────┴───────────────────┘
```

### 4. Tags Schema

```
┌─────────────────────────────────────────────────────────────┐
│                       expenseTags                            │
├──────────────────┬──────────────────────────────────────────┤
│ Field            │ Type                 │ Description       │
├──────────────────┼──────────────────────┼──────────────────┤
│ id               │ string (auto)        │ Firestore doc ID  │
│ userId           │ string               │ FK to Auth user   │
│ name             │ string               │ Tag name          │
│ color            │ string               │ Hex color code    │
│ icon             │ string               │ Emoji icon        │
│ description      │ string               │ Tag description   │
│ createdAt        │ Timestamp            │ Record creation   │
│ updatedAt        │ Timestamp            │ Last update       │
└──────────────────┴──────────────────────┴───────────────────┘
```

---

## Entity-Relationship Diagram

```
┌─────────────────┐
│  Firebase Auth  │
│     (User)      │
└────────┬────────┘
         │ 1
         │
         │ *
    ┌────┴─────────────────┬─────────────────┬────────────────┐
    │                      │                 │                │
┌───▼──────────────┐  ┌───▼──────────┐  ┌───▼─────────┐  ┌──▼─────────┐
│expenseTransactions│  │expenseStatements│ │creditCards │  │expenseTags │
│                  │  │                │  │            │  │            │
│ • id             │  │ • id           │  │ • id       │  │ • id       │
│ • userId         │  │ • userId       │  │ • userId   │  │ • userId   │
│ • date           │  │ • fileName     │  │ • bank     │  │ • name     │
│ • description    │  │ • fileType     │  │ • last4    │  │ • color    │
│ • amount         │  │ • uploadedAt   │  └────┬───────┘  │ • icon     │
│ • category       │  └────────────────┘       │          └────────────┘
│ • merchant       │                           │ 1
│ • tags[]         │                           │
│ • statementId ───┼────────┐                  │ *
│ • linkedCCId ────┼────────┼──────────────────┘
└──────────────────┘        │              ┌───────────────────────┐
         │ 1                └──────────────│creditCardTransactions │
         │                                 │                       │
         │ *                               │ • id                  │
    ┌────▼────────────┐                   │ • creditCardId        │
    │   Tag Values    │                   │ • paymentTransactionId│
    │  (Array Join)   │                   │ • date                │
    └─────────────────┘                   │ • amount              │
                                          │ • category            │
                                          └───────────────────────┘
```

---

## Data Flow Diagrams

### 1. File Upload & Processing Flow

```
┌──────────────┐
│   User       │
└──────┬───────┘
       │ 1. Upload File (PDF/Excel/CSV)
       ▼
┌──────────────────────────────────────┐
│    UploadStatement Component         │
│  (pages/UploadStatement.jsx)         │
└──────────────┬───────────────────────┘
               │ 2. Process File
               ▼
┌──────────────────────────────────────┐
│      File Processor Service          │
│   (services/fileProcessor.js)        │
│                                      │
│  • Detect file type                 │
│  • Route to appropriate parser      │
└──────────────┬───────────────────────┘
               │
       ┌───────┴────────┬──────────────┐
       │                │              │
       ▼                ▼              ▼
┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│ PDF Parser  │  │Excel Parser │  │ CSV Parser  │
│  (pdf)      │  │  (xlsx/xls) │  │   (csv)     │
└──────┬──────┘  └──────┬──────┘  └──────┬──────┘
       │                │              │
       └────────────────┴──────────────┘
                        │ 3. Raw Data Array
                        ▼
┌──────────────────────────────────────┐
│   Transaction Normalizer             │
│ (services/transactionNormalizer.js)  │
│                                      │
│  • Detect date columns              │
│  • Detect amount columns            │
│  • Detect credit/debit              │
│  • Clean data                       │
└──────────────┬───────────────────────┘
               │ 4. Normalized Transactions
               ▼
┌──────────────────────────────────────┐
│   Category Detection                 │
│ (services/categoryMappingService.js) │
│                                      │
│  • Match description patterns       │
│  • Check amount type                │
│  • Assign category                  │
└──────────────┬───────────────────────┘
               │ 5. Categorized Transactions
               ▼
┌──────────────────────────────────────┐
│   Duplicate Detection                │
│ (utils/duplicateDetection.js)        │
│                                      │
│  • Fetch existing transactions      │
│  • Compare dates & amounts          │
│  • Flag duplicates                  │
└──────────────┬───────────────────────┘
               │ 6. New + Duplicate Lists
               ▼
┌──────────────────────────────────────┐
│   Preview Display                    │
│  • Show category breakdown          │
│  • Display sample transactions      │
│  • Allow user to review             │
└──────────────┬───────────────────────┘
               │ 7. User Confirms
               ▼
┌──────────────────────────────────────┐
│   Firestore Service                  │
│ (services/firestoreService.js)       │
│                                      │
│  • addStatement() - metadata        │
│  • addTransactionsBatch() - data    │
└──────────────┬───────────────────────┘
               │ 8. Write to Firestore
               ▼
┌──────────────────────────────────────┐
│      Firestore Database              │
│                                      │
│  • expenseStatements collection     │
│  • expenseTransactions collection   │
└──────────────────────────────────────┘
```

### 2. Transaction Query & Display Flow

```
┌──────────────┐
│   User       │
└──────┬───────┘
       │ 1. Navigate to Transactions
       ▼
┌──────────────────────────────────────┐
│   Transactions Component             │
│  (pages/Transactions.jsx)            │
│                                      │
│  • useState for filters              │
│  • useState for pagination           │
│  • useState for sorting              │
└──────────────┬───────────────────────┘
               │ 2. Call getTransactions()
               ▼
┌──────────────────────────────────────┐
│   Firestore Service                  │
│ (services/firestoreService.js)       │
│                                      │
│  Query:                              │
│  • WHERE userId == currentUser.uid  │
│  • WHERE date >= startDate (if set) │
│  • WHERE date <= endDate (if set)   │
│  • ORDER BY date DESC               │
└──────────────┬───────────────────────┘
               │ 3. Return transactions[]
               ▼
┌──────────────────────────────────────┐
│   Component State Update             │
│  • setTransactions(data)            │
│  • Filter by search term            │
│  • Filter by category               │
│  • Sort by field & direction        │
│  • Paginate results                 │
└──────────────┬───────────────────────┘
               │ 4. Render UI
               ▼
┌──────────────────────────────────────┐
│   Display Table                      │
│  • Show paginated transactions      │
│  • Category badges                  │
│  • Edit/Delete actions              │
│  • Bulk selection                   │
└──────────────────────────────────────┘
```

### 3. Category Mapping Flow

```
┌──────────────────────────┐
│  Transaction Description │
│  "SALARY - RAZORPAY..."  │
└──────────┬───────────────┘
           │
           ▼
┌──────────────────────────────────────┐
│  detectCategoryFromDescription()     │
│  (categoryMappingService.js)         │
└──────────┬───────────────────────────┘
           │
           ▼
┌──────────────────────────────────────┐
│  1. Check Amount Type                │
│     amount > 0 → credit              │
│     amount < 0 → debit               │
└──────────┬───────────────────────────┘
           │
           ▼
┌──────────────────────────────────────┐
│  2. Loop through CATEGORY_MAPPINGS   │
│                                      │
│  INCOME: {                           │
│    patterns: [                       │
│      'RAZORPAY SOFTWARE...',        │
│      'SALARY',                       │
│      ...                             │
│    ],                                │
│    type: 'credit'                    │
│  }                                   │
└──────────┬───────────────────────────┘
           │
           ▼
┌──────────────────────────────────────┐
│  3. Check Type Match                 │
│     mapping.type === 'credit'        │
│     && isCredit === true             │
│     ✅ Continue                       │
└──────────┬───────────────────────────┘
           │
           ▼
┌──────────────────────────────────────┐
│  4. Check Pattern Match              │
│     descUpper.includes(              │
│       'RAZORPAY SOFTWARE'            │
│     )                                │
│     ✅ Match found!                   │
└──────────┬───────────────────────────┘
           │
           ▼
┌──────────────────────────────────────┐
│  5. Return Category                  │
│     → "Income"                       │
└──────────────────────────────────────┘
```

### 4. Credit Card Linking Flow

```
┌──────────────┐
│   User       │
└──────┬───────┘
       │ 1. Find CC payment transaction
       │    (e.g., "CRED CLUB PAYMENT")
       ▼
┌──────────────────────────────────────┐
│   Transactions Page                  │
│  • Click "Link Statement" button    │
└──────────────┬───────────────────────┘
               │ 2. Upload CC statement
               ▼
┌──────────────────────────────────────┐
│   Credit Card Upload Modal           │
│  • Parse CC statement               │
│  • Extract transactions             │
└──────────────┬───────────────────────┘
               │ 3. Submit
               ▼
┌──────────────────────────────────────┐
│   linkCreditCardStatement()          │
│  (creditCardService.js)              │
│                                      │
│  Creates:                            │
│  • creditCards document             │
└──────────────┬───────────────────────┘
               │ 4. Get creditCardId
               ▼
┌──────────────────────────────────────┐
│   addCreditCardTransactions()        │
│  (creditCardService.js)              │
│                                      │
│  Batch Write:                        │
│  • Create creditCardTransactions    │
│  • Update payment transaction       │
│    with linkedCreditCardId          │
└──────────────┬───────────────────────┘
               │ 5. Complete
               ▼
┌──────────────────────────────────────┐
│      Result                          │
│  • Payment txn shows link icon      │
│  • Can view detailed breakdown      │
│  • CC txns excluded from main list  │
└──────────────────────────────────────┘
```

### 5. Dashboard Analytics Flow

```
┌──────────────┐
│   User       │
└──────┬───────┘
       │ 1. Open Dashboard
       ▼
┌──────────────────────────────────────┐
│   Dashboard Component                │
│  (pages/Dashboard.jsx)               │
└──────────────┬───────────────────────┘
               │ 2. Fetch data
               ▼
┌──────────────────────────────────────┐
│   getTransactionStats()              │
│  (firestoreService.js)               │
│                                      │
│  • Get all transactions              │
│  • Calculate total income            │
│  • Calculate total expenses          │
│  • Calculate net savings             │
│  • Group by category                │
└──────────────┬───────────────────────┘
               │ 3. Return stats{}
               ▼
┌──────────────────────────────────────┐
│   getMonthlyTrends()                 │
│  (firestoreService.js)               │
│                                      │
│  • Get last 6 months data           │
│  • Group by month                   │
│  • Calculate income/expenses/month  │
└──────────────┬───────────────────────┘
               │ 4. Return trends[]
               ▼
┌──────────────────────────────────────┐
│   getCategoryWithMapping()           │
│  (categoryMappingService.js)         │
│                                      │
│  • Apply smart categorization       │
│  • Use hierarchical categories      │
└──────────────┬───────────────────────┘
               │ 5. Categorized data
               ▼
┌──────────────────────────────────────┐
│   Render Charts & Cards              │
│  • Income/Expense cards             │
│  • Category breakdown chart         │
│  • Monthly trend chart              │
│  • Recent transactions              │
└──────────────────────────────────────┘
```

---

## Relationships

### One-to-Many Relationships

1. **User → Transactions**
   - One user can have many transactions
   - Query: `WHERE userId == currentUser.uid`

2. **User → Statements**
   - One user can upload many statements
   - Query: `WHERE userId == currentUser.uid`

3. **User → Credit Cards**
   - One user can have many credit cards
   - Query: `WHERE userId == currentUser.uid`

4. **User → Tags**
   - One user can create many tags
   - Query: `WHERE userId == currentUser.uid`

5. **Statement → Transactions**
   - One statement can have many transactions
   - Link: `transaction.statementId → statement.id`
   - Query: `WHERE statementId == statementId`

6. **Credit Card → CC Transactions**
   - One credit card can have many transactions
   - Link: `ccTransaction.creditCardId → creditCard.id`
   - Query: `WHERE creditCardId == creditCardId`

### Many-to-Many Relationships

1. **Transactions ← → Tags**
   - One transaction can have multiple tags
   - One tag can be applied to multiple transactions
   - Implemented via: `transaction.tags[]` (array of tag names)
   - Query: `WHERE tags array-contains tagName`

### One-to-One Relationships

1. **Credit Card ← → Payment Transaction**
   - One credit card links to one payment transaction
   - One payment transaction can link to one credit card
   - Link: `creditCard.paymentTransactionId → transaction.id`
   - Link: `transaction.linkedCreditCardId → creditCard.id`

---

## Query Patterns

### 1. Get User Transactions (with filters)

```javascript
query(
  collection(db, 'expenseTransactions'),
  where('userId', '==', userId),
  where('date', '>=', startDate),
  where('date', '<=', endDate),
  orderBy('date', 'desc')
)
```

**Firestore Index Required:**
```
Collection: expenseTransactions
Fields: userId (Ascending), date (Descending)
```

### 2. Get Transactions by Category

```javascript
query(
  collection(db, 'expenseTransactions'),
  where('userId', '==', userId),
  where('category', '==', 'Income'),
  orderBy('date', 'desc')
)
```

**Firestore Index Required:**
```
Collection: expenseTransactions
Fields: userId (Ascending), category (Ascending), date (Descending)
```

### 3. Get Transactions by Tag

```javascript
query(
  collection(db, 'expenseTransactions'),
  where('userId', '==', userId),
  where('tags', 'array-contains', 'Family')
)
```

**Firestore Index Required:**
```
Collection: expenseTransactions  
Fields: userId (Ascending), tags (Array Contains)
```

### 4. Get Statement with Transactions

```javascript
// Step 1: Get statement
const statement = await getDoc(doc(db, 'expenseStatements', statementId));

// Step 2: Get related transactions
const transactions = await getDocs(
  query(
    collection(db, 'expenseTransactions'),
    where('statementId', '==', statementId),
    orderBy('date', 'desc')
  )
);
```

### 5. Get Credit Card Details

```javascript
// Step 1: Get credit card
const card = await getDoc(doc(db, 'creditCards', cardId));

// Step 2: Get CC transactions
const ccTransactions = await getDocs(
  query(
    collection(db, 'creditCardTransactions'),
    where('creditCardId', '==', cardId),
    orderBy('date', 'desc')
  )
);

// Step 3: Get payment transaction
const payment = await getDoc(
  doc(db, 'expenseTransactions', card.paymentTransactionId)
);
```

---

## Data Lifecycle

### Transaction Creation
1. User uploads file → File parsed → Normalized
2. Categories detected → Duplicates checked
3. User confirms → `addStatement()` creates metadata
4. `addTransactionsBatch()` creates transactions
5. Each transaction gets: `createdAt`, `updatedAt`, `userId`, `statementId`

### Transaction Update
1. User edits transaction → `updateTransaction()` called
2. Updates specific fields + `updatedAt` timestamp
3. No cascade updates (statements not affected)

### Transaction Deletion
1. Single: `deleteTransaction()` → Doc deleted
2. Bulk: `deleteTransactionsBulk()` → Multiple docs deleted
3. Via Statement: `deleteStatement()` → Gets all transactions by `statementId` → Deletes all → Deletes statement

### Data Integrity
- No hard foreign key constraints (NoSQL)
- Soft links via IDs stored as strings
- Queries use `where()` clauses to join
- Orphaned data possible (e.g., deleted statement but transactions remain)
- Application-level integrity enforced in services

---

## Performance Considerations

### Indexes Required

As defined in `firestore.indexes.json`:

```json
{
  "indexes": [
    {
      "collectionGroup": "expenseTransactions",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "userId", "order": "ASCENDING" },
        { "fieldPath": "date", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "expenseTransactions",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "userId", "order": "ASCENDING" },
        { "fieldPath": "category", "order": "ASCENDING" },
        { "fieldPath": "date", "order": "DESCENDING" }
      ]
    }
  ]
}
```

### Query Optimization

1. **Always filter by userId first** - Ensures user data isolation
2. **Use compound indexes** - For multi-field queries
3. **Limit result sets** - Pagination with 25 items per page
4. **Order by indexed fields** - Faster sorting
5. **Avoid array-contains-any** - Can be slow with large arrays

### Caching Strategy

1. **Component-level state** - Transactions cached in React state
2. **URL-based pagination** - Persists page state across navigation
3. **No server-side cache** - Firestore handles caching internally
4. **Fetch on demand** - Only query when needed (no polling)

---

## Security Rules

Located in `firestore.rules`:

```javascript
match /expenseTransactions/{document} {
  allow read, write: if request.auth != null 
    && request.auth.uid == resource.data.userId;
}

match /expenseStatements/{document} {
  allow read, write: if request.auth != null 
    && request.auth.uid == resource.data.userId;
}

match /creditCards/{document} {
  allow read, write: if request.auth != null 
    && request.auth.uid == resource.data.userId;
}

match /expenseTags/{document} {
  allow read, write: if request.auth != null 
    && request.auth.uid == resource.data.userId;
}
```

**Key Points:**
- Users can only access their own data
- Authentication required for all operations
- UserId checked on every read/write

---

## Summary

This expense tracker uses a **denormalized NoSQL schema** optimized for:
- Fast queries by userId
- Flexible transaction structure
- Hierarchical categorization
- Credit card linking
- User-defined tagging

The data flow follows a clear pipeline from file upload → parsing → normalization → categorization → storage → display, with comprehensive services handling each step.

