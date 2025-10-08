# Complete Data Flow: From Upload to Firestore

## Overview
This document explains the entire journey of transaction data from file upload to Firestore storage.

---

## 📊 Step-by-Step Data Flow

### **Step 1: User Uploads File**
**Location:** `apps/expense-tracker/src/pages/UploadStatement.jsx`

```javascript
// User drops or selects a file
onDrop(acceptedFiles) {
  const file = acceptedFiles[0]; // Excel, CSV, or PDF
  await processFile(file);
}
```

**What happens:**
- User selects an Excel (.xlsx, .xls) or CSV file
- File is passed to the file processor

---

### **Step 2: File is Parsed**
**Location:** `apps/expense-tracker/src/services/fileProcessor.js`

```javascript
export async function processFile(file) {
  // Detect file type
  if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
    return parseExcel(file);  // → Go to Step 3a
  } else if (file.name.endsWith('.csv')) {
    return parseCSV(file);    // → Go to Step 3b
  }
}
```

**What happens:**
- File type is detected based on extension
- Appropriate parser is called

---

### **Step 3a: Excel Parser**
**Location:** `apps/expense-tracker/src/services/excelParser.js`

```javascript
export async function parseExcel(file) {
  // 1. Read Excel file into memory
  const arrayBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: 'array' });
  
  // 2. Convert sheets to JSON arrays
  const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
  
  // Result: Array of arrays
  // [
  //   ['Date', 'Description', 'Debit', 'Credit'],  // Header row
  //   ['01/04/2025', 'Amazon', '', '920.00'],      // Data row 1
  //   ['02/04/2025', 'Swiggy', '150.00', ''],      // Data row 2
  // ]
  
  return { allData: jsonData };
}
```

**Output Format:**
```javascript
{
  type: 'excel',
  fileName: 'statement.xlsx',
  size: 122368,
  allData: [
    ['Date', 'Narration', 'Withdrawal Amt.', 'Deposit Amt.'],
    ['01/04/2025', 'UPI-AMAZON', '920', ''],
    ['01/04/2025', 'UPI-SALARY', '', '50000'],
  ]
}
```

---

### **Step 3b: CSV Parser**
**Location:** `apps/expense-tracker/src/services/csvParser.js`

```javascript
export async function parseCSVWithHeaders(file) {
  // Papa Parse library reads CSV
  Papa.parse(file, {
    header: true,  // First row is headers
    skipEmptyLines: true,
    complete: (results) => {
      // results.data is array of objects
      // results.meta.fields is array of header names
    }
  });
}
```

**Output Format:**
```javascript
{
  type: 'csv',
  fileName: 'transactions.csv',
  data: [
    { Date: '01/04/2025', Description: 'Amazon', Amount: '920' },
    { Date: '02/04/2025', Description: 'Swiggy', Amount: '150' },
  ],
  fields: ['Date', 'Description', 'Amount']
}
```

---

### **Step 4: Header Detection**
**Location:** `apps/expense-tracker/src/services/excelParser.js` (Line 90-114)

```javascript
// Smart header detection - scans first 20 rows
for (let i = 0; i < Math.min(20, filteredData.length); i++) {
  const row = filteredData[i];
  let matchScore = 0;
  
  row.forEach((cell) => {
    const cellLower = String(cell).toLowerCase();
    // Check if cell contains common column names
    if (cellLower.includes('date')) matchScore++;
    if (cellLower.includes('description')) matchScore++;
    if (cellLower.includes('amount') || cellLower.includes('debit')) matchScore++;
  });
  
  if (matchScore > bestMatchScore) {
    bestMatchScore = matchScore;
    headerRowIndex = i;  // Found header row!
  }
}
```

**Result:**
```javascript
headerRowIndex: 16  // Header found at row 16
headers: ['Date', 'Narration', 'Chq./Ref.No.', 'Value Dt', 'Withdrawal Amt.', 'Deposit Amt.', 'Closing Balance']
dataRows: [...380 rows of actual transaction data...]
```

---

### **Step 5: Transaction Normalization**
**Location:** `apps/expense-tracker/src/services/transactionNormalizer.js`

This is where the **magic happens**! Each raw row is converted into a standardized format.

#### **5.1: Date Normalization**

```javascript
function normalizeDate(dateValue) {
  // Handles multiple formats:
  // - "01/04/2025" → Date object
  // - "2025-04-01" → Date object  
  // - "01 Apr 2025" → Date object
  // - Excel serial number (44927) → Date object
  
  if (dateValue instanceof Date) return dateValue;
  
  const dateStr = String(dateValue).trim();
  
  // Try DD/MM/YYYY format
  if (dateStr.includes('/') || dateStr.includes('-')) {
    const [day, month, year] = dateStr.split(/[\/\-]/);
    return new Date(year, month - 1, day);
  }
  
  // Try ISO format YYYY-MM-DD
  if (dateStr.match(/\d{4}-\d{2}-\d{2}/)) {
    return new Date(dateStr);
  }
  
  return new Date(dateStr);  // Fallback
}
```

**Example:**
```
Input: "01/04/2025"
Output: Tue Apr 01 2025 00:00:00 GMT+0530
```

#### **5.2: Amount Detection (Smart!)**

```javascript
function extractAmountFromRow(row, headers) {
  // Find credit column
  const creditIndex = headers.findIndex(h => 
    h.toLowerCase().includes('credit') || 
    h.toLowerCase().includes('deposit')
  );
  
  // Find debit column
  const debitIndex = headers.findIndex(h => 
    h.toLowerCase().includes('debit') || 
    h.toLowerCase().includes('withdrawal')
  );
  
  let amount = null;
  
  // Check credit column
  if (creditIndex >= 0 && row[creditIndex]) {
    const creditAmount = normalizeAmount(row[creditIndex]);
    if (creditAmount !== null && creditAmount !== 0) {
      amount = Math.abs(creditAmount);  // Positive (income)
    }
  }
  
  // Check debit column
  if (debitIndex >= 0 && row[debitIndex]) {
    const debitAmount = normalizeAmount(row[debitIndex]);
    if (debitAmount !== null && debitAmount !== 0) {
      amount = -Math.abs(debitAmount);  // Negative (expense)
    }
  }
  
  return { amount, columnName };
}
```

**Example:**
```javascript
// Input row from bank statement:
['01/04/2025', 'Amazon Purchase', '920', '', '45080']
//                                   ^Debit  ^Credit

// Output:
{ amount: -920, columnName: 'debit' }  // Negative = expense
```

#### **5.3: Transaction Type Detection**

```javascript
function detectTransactionType(row, headers, amount) {
  // If amount is negative → debit (expense)
  // If amount is positive → credit (income)
  
  return amount >= 0 ? 'credit' : 'debit';
}
```

#### **5.4: Complete Normalization**

```javascript
export function normalizeTransaction(rawTransaction, headers) {
  // Input: ['01/04/2025', 'UPI-AMAZON-PAYTM', '', '920', '']
  // Headers: ['Date', 'Narration', 'Ref', 'Debit', 'Credit']
  
  const normalized = {
    date: normalizeDate(rawTransaction[0]),        // Date object
    description: rawTransaction[1],                 // String
    amount: extractAmountFromRow(...),             // Number (+ or -)
    type: detectTransactionType(...),              // 'credit' or 'debit'
    category: detectCategory(description),          // Category string
    originalData: {},                              // Raw data preserved
  };
  
  return normalized;
}
```

**Output:**
```javascript
{
  date: Tue Apr 01 2025 00:00:00 GMT+0530,
  description: "UPI-BEWAKOOF-PAYTM-648052425@PTYBL",
  amount: -920,
  type: "debit",
  category: "Shopping - Online",  // Auto-detected!
  originalData: { ... }
}
```

---

### **Step 6: Category Detection**
**Location:** `apps/expense-tracker/src/services/categoryDetector.js`

```javascript
export function detectCategory(description) {
  const descLower = description.toLowerCase();
  
  // Check against 11 categories with 150+ keywords
  if (descLower.includes('amazon') || descLower.includes('flipkart')) {
    return 'Shopping - Online';
  }
  
  if (descLower.includes('swiggy') || descLower.includes('zomato')) {
    return 'Food & Dining';
  }
  
  if (descLower.includes('uber') || descLower.includes('ola')) {
    return 'Transport';
  }
  
  // ... 8 more categories ...
  
  return 'Others';  // Default
}
```

**Example:**
```javascript
Input: "UPI-BEWAKOOF-PAYTM"
Output: "Shopping - Online"  // Matched "bewakoof" keyword

Input: "SWIGGY INSTAMART"
Output: "Groceries"  // Matched "swiggy instamart"

Input: "RANDOM MERCHANT"
Output: "Others"  // No match found
```

---

### **Step 7: Validation**
**Location:** `apps/expense-tracker/src/services/transactionNormalizer.js`

```javascript
export function validateNormalizedTransaction(transaction) {
  const errors = [];
  const warnings = [];
  
  if (!transaction.date) {
    warnings.push('Missing date');
  }
  
  if (!transaction.description) {
    warnings.push('Missing description');
  }
  
  if (transaction.amount === null || transaction.amount === 0) {
    errors.push('Missing or zero amount');  // ❌ CRITICAL ERROR
  }
  
  if (transaction.category === 'Others') {
    warnings.push('Category not detected');  // ⚠️ Warning only
  }
  
  return {
    isValid: errors.length === 0,  // Must have amount to be valid
    errors,
    warnings
  };
}
```

**Result:**
```javascript
// Valid transaction
{ isValid: true, errors: [], warnings: ['Category not detected'] }

// Invalid transaction (no amount)
{ isValid: false, errors: ['Missing or zero amount'], warnings: [] }
```

---

### **Step 8: Batch Processing**
**Location:** `apps/expense-tracker/src/services/excelParser.js` (Line 131-157)

```javascript
// Normalize all transactions
const normalizedTransactions = normalizeBatch(dataRows, headers);
// Result: 380 normalized transactions

// Validate each one
const validatedTransactions = normalizedTransactions.map((txn, index) => {
  const validation = validateNormalizedTransaction(txn);
  return {
    ...txn,
    id: `excel-${index}`,  // Temporary ID
    validation,
  };
});

// Separate valid from invalid
const validTransactions = validatedTransactions.filter(
  txn => txn.validation.isValid
);  // 370 valid

const invalidTransactions = validatedTransactions.filter(
  txn => !txn.validation.isValid
);  // 10 invalid (missing amounts)
```

**Console Output:**
```
📊 Excel filtered data rows: 397
🔍 Found header row at index: 16 with score: 4
📋 Excel headers: ['Date', 'Narration', ...]
✅ Normalized transactions: 380
✅ Valid transactions: 370
⚠️ Invalid transactions: 10
```

---

### **Step 9: Duplicate Detection**
**Location:** `apps/expense-tracker/src/pages/UploadStatement.jsx` (Line 42-46)

```javascript
// Get existing transactions from Firestore
const existingTransactions = await getTransactions(currentUser.uid);

// Check for duplicates
const { newTransactions, duplicates } = detectDuplicates(
  validTransactions,
  existingTransactions
);
```

**Duplicate Detection Logic:**
```javascript
// Two transactions are duplicates if:
// 1. Same date (within 1 day)
// 2. Same amount
// 3. Same description (fuzzy match)

function detectDuplicates(newTxns, existingTxns) {
  const duplicates = [];
  const newTransactions = newTxns.filter(newTxn => {
    const isDuplicate = existingTxns.some(existing => 
      isSameDate(newTxn.date, existing.date) &&
      newTxn.amount === existing.amount &&
      newTxn.description === existing.description
    );
    
    if (isDuplicate) {
      duplicates.push(newTxn);
      return false;  // Filter out
    }
    return true;  // Keep
  });
  
  return { newTransactions, duplicates };
}
```

---

### **Step 10: Data Cleaning for Firestore**
**Location:** `apps/expense-tracker/src/services/firestoreService.js` (Line 24-72)

```javascript
function cleanTransactionData(transaction) {
  const cleaned = {};
  
  Object.keys(transaction).forEach((key) => {
    const value = transaction[key];
    
    // ❌ Remove undefined and null
    if (value === undefined || value === null) {
      return;
    }
    
    // ✅ Convert dates to Firestore Timestamps
    if (key === "date") {
      if (value instanceof Date) {
        cleaned[key] = Timestamp.fromDate(value);
      }
      return;
    }
    
    // ✅ Ensure category is string (not object)
    if (key === "category") {
      if (typeof value === "object" && value.category) {
        cleaned[key] = value.category;  // Extract string from object
      } else if (typeof value === "string") {
        cleaned[key] = value;
      }
      return;
    }
    
    // ❌ Remove arrays (Firestore doesn't support nested arrays)
    if (Array.isArray(value)) {
      return;
    }
    
    // ❌ Remove complex objects
    if (typeof value === "object" && 
        !(value instanceof Date) && 
        !(value instanceof Timestamp)) {
      return;
    }
    
    // ✅ Keep everything else
    cleaned[key] = value;
  });
  
  return cleaned;
}
```

**Before Cleaning:**
```javascript
{
  id: "excel-0",
  date: Tue Apr 01 2025 00:00:00 GMT+0530,  // JS Date
  description: "UPI-AMAZON",
  amount: -920,
  type: "debit",
  category: "Shopping - Online",
  validation: { isValid: true, errors: [], warnings: [] },  // ❌ Object
  originalData: { ... },  // ❌ Object
}
```

**After Cleaning:**
```javascript
{
  date: Timestamp { seconds: 1743456000, nanoseconds: 0 },  // Firestore Timestamp
  description: "UPI-AMAZON",
  amount: -920,
  type: "debit",
  category: "Shopping - Online"
}
```

---

### **Step 11: Save to Firestore**
**Location:** `apps/expense-tracker/src/services/firestoreService.js` (Line 96-117)

```javascript
export async function addTransactionsBatch(userId, transactions) {
  console.log('💾 Saving batch of', transactions.length, 'transactions');
  
  const promises = transactions.map((transaction) => {
    // Clean the transaction
    const cleanedTransaction = cleanTransactionData(transaction);
    
    // Save to Firestore
    return addDoc(collection(db, 'expenseTransactions'), {
      userId,                    // String: user ID
      ...cleanedTransaction,     // Cleaned transaction data
      createdAt: serverTimestamp(),  // Firestore server timestamp
      updatedAt: serverTimestamp(),  // Firestore server timestamp
    });
  });
  
  // Execute all saves in parallel
  const results = await Promise.all(promises);
  
  console.log('✅ Successfully saved', results.length, 'transactions');
  return results.map((docRef) => docRef.id);
}
```

**Final Document in Firestore:**
```javascript
{
  // Auto-generated by Firestore
  id: "abc123xyz789",
  
  // Added by us
  userId: "user_xyz123",
  date: Timestamp(1743456000, 0),
  description: "UPI-BEWAKOOF-PAYTM",
  amount: -920,
  type: "debit",
  category: "Shopping - Online",
  createdAt: Timestamp(1759830000, 0),
  updatedAt: Timestamp(1759830000, 0)
}
```

---

## 📊 Complete Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│  1. USER UPLOADS FILE (Excel/CSV)                               │
│     UploadStatement.jsx                                         │
└──────────────────┬──────────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────────┐
│  2. FILE PROCESSOR                                              │
│     fileProcessor.js → Detects type                             │
└──────────────────┬──────────────────────────────────────────────┘
                   │
         ┌─────────┴─────────┐
         │                   │
         ▼                   ▼
┌────────────────┐  ┌────────────────┐
│  3a. EXCEL     │  │  3b. CSV       │
│  excelParser   │  │  csvParser     │
│  → JSON arrays │  │  → Objects     │
└───────┬────────┘  └───────┬────────┘
        │                   │
        └─────────┬─────────┘
                  ▼
┌─────────────────────────────────────────────────────────────────┐
│  4. HEADER DETECTION                                            │
│     Smart scan of first 20 rows                                 │
│     Result: headerRowIndex: 16, headers: [...]                  │
└──────────────────┬──────────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────────┐
│  5. NORMALIZATION (The Magic!)                                  │
│     transactionNormalizer.js                                    │
│     ┌───────────────────────────────────────────────────────┐   │
│     │ 5.1: Date → Date object                              │   │
│     │ 5.2: Amount → Number (+ or -)                        │   │
│     │ 5.3: Type → 'credit' or 'debit'                      │   │
│     │ 5.4: Category → detectCategory()                     │   │
│     └───────────────────────────────────────────────────────┘   │
└──────────────────┬──────────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────────┐
│  6. CATEGORY DETECTION                                          │
│     categoryDetector.js                                         │
│     Matches against 11 categories, 150+ keywords                │
└──────────────────┬──────────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────────┐
│  7. VALIDATION                                                  │
│     Check: date, description, amount                            │
│     Result: Valid (370) vs Invalid (10)                         │
└──────────────────┬──────────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────────┐
│  8. DUPLICATE DETECTION                                         │
│     Compare with existing Firestore transactions                │
│     Filter out duplicates                                       │
└──────────────────┬──────────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────────┐
│  9. DATA CLEANING                                               │
│     cleanTransactionData()                                      │
│     - Remove undefined/null                                     │
│     - Convert Date → Timestamp                                  │
│     - Remove arrays/objects                                     │
│     - Ensure category is string                                 │
└──────────────────┬──────────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────────┐
│  10. SAVE TO FIRESTORE                                          │
│      Collection: expenseTransactions                            │
│      Document: {userId, date, description, amount, type,        │
│                 category, createdAt, updatedAt}                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔍 What Happens to Your Specific File

Based on your console logs:

1. **File**: `Acct Statement_XX5120_07102025.xls`
2. **Size**: 122,368 bytes (119.5 KB)
3. **Total rows**: 397
4. **Header found**: Row 16
5. **Headers detected**: `['Date', 'Narration', 'Chq./Ref.No.', 'Value Dt', 'Withdrawal Amt.', 'Deposit Amt.', 'Closing Balance']`
6. **Data rows**: 380 (rows 17-396)
7. **Normalized**: 380 transactions
8. **Valid**: 370 transactions ✅
9. **Invalid**: 10 transactions ❌ (missing amounts)
10. **Saved to Firestore**: 370 transactions

---

## 🐛 Issues Fixed

### Issue 1: Firestore Index Error
**Problem:** Query required an index that didn't exist.
**Fix:** Added index to `firestore.indexes.json` and deployed.

### Issue 2: Category Saved as Object
**Problem:** Old code saved `{category: "Food", confidence: 90}` instead of just `"Food"`.
**Fix:** Added category extraction in `cleanTransactionData()`.

### Issue 3: Duplicate Keys in React
**Problem:** Transactions with same key `[object Object]`.
**Fix:** Ensured category is always a string when reading from Firestore.

---

## ✅ Current Status

All systems working! Your data now flows smoothly from Excel → Normalized → Categorized → Firestore! 🎉

