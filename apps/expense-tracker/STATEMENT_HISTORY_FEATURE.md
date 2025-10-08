# Statement History Feature

## ✨ Overview

The Statement History feature allows you to:
- **View all uploaded statements** in one place
- **See transactions grouped by statement**
- **Delete entire statements** along with all their transactions
- Track statement metadata (file name, type, size, upload date, transaction count)

---

## 🎯 Features

### 1. **Statements List Page** (`/statements`)

Displays all your uploaded bank statements with:
- **File Information:**
  - File name
  - File type (Excel, CSV, PDF)
  - File size
  - Upload date
  
- **Transaction Metrics:**
  - Total transactions in statement
  - Number of duplicates (if any)
  
- **Actions:**
  - 👁️ View - See all transactions in this statement
  - 🗑️ Delete - Remove statement and ALL its transactions

### 2. **Statement Detail Page** (`/statements/:statementId`)

Shows detailed view of a single statement:
- **Summary Cards:**
  - Total Income
  - Total Expenses
  - Net Amount
  
- **Transaction Table:**
  - All transactions from this statement
  - Sortable by date
  - Color-coded by type (income/expense)
  - Shows categories

### 3. **Statement-Transaction Linking**

Every transaction is now linked to its parent statement via `statementId`:
```javascript
{
  id: "txn_123",
  userId: "user_xyz",
  statementId: "stmt_abc",  // ← Link to parent statement
  date: Timestamp,
  description: "Amazon Purchase",
  amount: -920,
  type: "debit",
  category: "Shopping - Online",
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

---

## 📊 Database Structure

### Collections

#### `expenseStatements`
```javascript
{
  id: "stmt_abc",
  userId: "user_xyz",
  fileName: "Acct_Statement_XX5120.xls",
  fileType: "excel",
  fileSize: 122368,
  transactionCount: 370,
  duplicateCount: 10,
  uploadedAt: Timestamp
}
```

#### `expenseTransactions`
```javascript
{
  id: "txn_123",
  userId: "user_xyz",
  statementId: "stmt_abc",  // Links to parent statement
  date: Timestamp,
  description: "Transaction details",
  amount: -920,
  type: "debit",
  category: "Shopping - Online",
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

---

## 🔄 Data Flow

### Upload Flow

```
1. User uploads file
   ↓
2. File is processed & transactions extracted
   ↓
3. Statement metadata saved to Firestore
   → Returns statementId
   ↓
4. Transactions saved with statementId
   ↓
5. User redirected to /statements
```

### View Flow

```
1. User clicks on statement
   ↓
2. Navigate to /statements/:statementId
   ↓
3. Fetch statement metadata
   ↓
4. Fetch all transactions WHERE statementId == :statementId
   ↓
5. Display summary and transaction table
```

### Delete Flow

```
1. User clicks Delete button
   ↓
2. Show confirmation dialog
   ↓
3. User confirms deletion
   ↓
4. Fetch all transactions by statementId
   ↓
5. Delete all transactions (batch)
   ↓
6. Delete statement document
   ↓
7. Update UI (remove from list)
```

---

## 🛠️ New Functions Added

### `firestoreService.js`

#### `addTransactionsBatch(userId, transactions, statementId)`
```javascript
// Updated to accept optional statementId
await addTransactionsBatch(userId, transactions, statementId);
```

#### `getTransactionsByStatement(statementId)`
```javascript
// Get all transactions for a specific statement
const transactions = await getTransactionsByStatement(statementId);
```

#### `deleteStatement(statementId)`
```javascript
// Delete statement and ALL its transactions
const deletedCount = await deleteStatement(statementId);
// Returns: number of transactions deleted
```

---

## 📄 New Pages

### 1. `Statements.jsx`
**Route:** `/statements`

**Features:**
- Lists all uploaded statements
- Shows file metadata
- Quick actions (View, Delete)
- Empty state with upload button
- Delete confirmation dialog

**Components:**
- Statement card with file info
- Action buttons
- Delete confirmation modal
- Loading state

### 2. `StatementDetail.jsx`
**Route:** `/statements/:statementId`

**Features:**
- Back button to statements list
- Summary cards (Income, Expenses, Net)
- Transaction table
- Color-coded amounts
- Category badges

**Components:**
- Header with back button
- Metric cards
- Transaction table
- Empty state

---

## 🎨 UI Components

### Statement Card
```jsx
┌─────────────────────────────────────────────────┐
│  📊  Acct_Statement_XX5120.xls            👁️ 🗑️ │
│                                                  │
│  📅 Oct 7, 2025, 2:30 PM                        │
│  📄 EXCEL  •  370 transactions  •  119.5 KB     │
│  ⚠️ 10 duplicates                               │
└─────────────────────────────────────────────────┘
```

### Summary Cards
```jsx
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│ Total Income    │  │ Total Expenses  │  │ Net Amount      │
│ ₹50,000.00  ↗️  │  │ ₹38,920.00  ↘️  │  │ +₹11,080.00  📅 │
└─────────────────┘  └─────────────────┘  └─────────────────┘
```

### Transaction Table
```jsx
┌────────────┬──────────────────────┬──────────────┬────────────┐
│ Date       │ Description          │ Category     │ Amount     │
├────────────┼──────────────────────┼──────────────┼────────────┤
│ Apr 1, 2025│ UPI-AMAZON           │ Shopping     │ -₹920.00   │
│ Apr 1, 2025│ UPI-SALARY CREDIT    │ Others       │ +₹50,000   │
│ Apr 2, 2025│ SWIGGY ORDER         │ Food & Dining│ -₹ 350.00  │
└────────────┴──────────────────────┴──────────────┴────────────┘
```

---

## 🚀 Usage

### For Users

1. **Upload a Statement:**
   ```
   Navigate to: Upload → Select file → Save
   You'll be redirected to: /statements
   ```

2. **View Statements:**
   ```
   Navigate to: Statements
   See all uploaded statements
   ```

3. **View Transactions:**
   ```
   Click 👁️ icon on any statement
   See all transactions from that statement
   ```

4. **Delete a Statement:**
   ```
   Click 🗑️ icon → Confirm
   Statement + all transactions will be deleted
   ```

### For Developers

#### Query Transactions by Statement:
```javascript
import { getTransactionsByStatement } from '../services/firestoreService';

const transactions = await getTransactionsByStatement(statementId);
```

#### Delete Statement:
```javascript
import { deleteStatement } from '../services/firestoreService';

const deletedCount = await deleteStatement(statementId);
console.log(`Deleted ${deletedCount} transactions`);
```

#### Save with Statement Link:
```javascript
import { addTransactionsBatch, addStatement } from '../services/firestoreService';

// 1. Save statement first
const statementId = await addStatement(userId, {
  fileName: 'statement.xlsx',
  fileType: 'excel',
  fileSize: 122368,
  transactionCount: 370,
  duplicateCount: 10,
});

// 2. Save transactions with statementId
await addTransactionsBatch(userId, transactions, statementId);
```

---

## 🔒 Firestore Indexes Required

The feature requires this index:

```json
{
  "collectionGroup": "expenseTransactions",
  "queryScope": "COLLECTION",
  "fields": [
    {
      "fieldPath": "statementId",
      "order": "ASCENDING"
    },
    {
      "fieldPath": "date",
      "order": "DESCENDING"
    }
  ]
}
```

This enables the query:
```javascript
query(
  collection(db, 'expenseTransactions'),
  where('statementId', '==', statementId),
  orderBy('date', 'desc')
)
```

---

## ⚡ Performance

### Optimizations:
1. **Batch Deletion:** All transactions deleted in parallel using `Promise.all()`
2. **Indexed Queries:** Fast retrieval using Firestore indexes
3. **Lazy Loading:** Only load statement list on initial page load
4. **Optimistic UI:** UI updates immediately, then syncs with Firestore

### Expected Performance:
- **Statement List:** < 500ms
- **Transaction View:** < 1s (for 1000 transactions)
- **Delete Operation:** ~2-5s (depending on transaction count)

---

## 🐛 Error Handling

### Scenarios Covered:

1. **Statement Not Found:**
   - Shows "Statement Not Found" message
   - Provides back button

2. **No Transactions:**
   - Shows empty state in detail view
   - Message: "No transactions found in this statement"

3. **Delete Failure:**
   - Shows error alert
   - Statement remains in list
   - User can retry

4. **Network Errors:**
   - Fallback queries without ordering
   - Error messages displayed

---

## 📈 Future Enhancements

1. **Bulk Actions:**
   - Select multiple statements
   - Delete in bulk

2. **Export:**
   - Download statement transactions as CSV/Excel
   - Generate PDF report

3. **Filtering:**
   - Filter statements by date range
   - Filter by file type

4. **Search:**
   - Search statements by file name
   - Search within statement transactions

5. **Analytics:**
   - Compare statements month-over-month
   - Track spending trends across statements

---

## ✅ Testing Checklist

- [x] Upload statement → redirects to /statements
- [x] Statements list displays correctly
- [x] Click view → shows transactions
- [x] Summary cards calculate correctly
- [x] Transaction table displays all data
- [x] Delete statement → removes from UI
- [x] Delete confirmation dialog works
- [x] Transactions actually deleted from Firestore
- [x] Empty states display correctly
- [x] Loading states work
- [x] Error handling functional
- [x] Mobile responsive
- [x] No lint errors

---

## 🎉 Summary

The Statement History feature provides complete statement lifecycle management:
1. ✅ Upload → Automatic linking
2. ✅ View → Grouped by statement
3. ✅ Delete → Cascade deletion

**Benefits:**
- Better organization
- Easy cleanup of old data
- Clear audit trail
- Improved user experience

**All working perfectly!** 🚀

