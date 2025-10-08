# Firestore Indexing Explained

## 🎯 What Are Firestore Indexes?

Firestore indexes are **pre-computed data structures** that make queries fast. Without indexes, Firestore would have to scan every document in your collection to find matches, which is slow and expensive.

Think of it like a book:
- **Without index:** Read every page to find "Chapter 3"
- **With index:** Look at Table of Contents, jump directly to page 42

---

## 🔍 When Do You Need Indexes?

### Automatic Indexes (Single Field)
Firestore automatically creates indexes for:
```javascript
// ✅ No manual index needed
where('userId', '==', 'abc123')
where('category', '==', 'Food')
orderBy('date', 'desc')
```

### Manual Indexes Required (Composite)
You MUST create indexes for queries with:
1. **Multiple where clauses**
2. **where + orderBy on different fields**
3. **Multiple orderBy clauses**

```javascript
// ❌ Requires manual index
query(
  collection(db, 'transactions'),
  where('userId', '==', 'abc123'),    // Field 1
  orderBy('date', 'desc')             // Field 2
)

// ❌ Requires manual index
query(
  collection(db, 'transactions'),
  where('statementId', '==', 'stmt_xyz'),  // Field 1
  where('category', '==', 'Food'),          // Field 2
  orderBy('date', 'desc')                   // Field 3
)
```

---

## 📋 Our Current Indexes

### Location: `firestore.indexes.json`

We have **5 composite indexes** for the expense tracker:

### 1. **User Transactions (Descending Date)**
```json
{
  "collectionGroup": "expenseTransactions",
  "fields": [
    { "fieldPath": "userId", "order": "ASCENDING" },
    { "fieldPath": "date", "order": "DESCENDING" }
  ]
}
```

**Used by:**
```javascript
// Get user's transactions, newest first
query(
  collection(db, 'expenseTransactions'),
  where('userId', '==', userId),
  orderBy('date', 'desc')
)
```

**Why needed:** Combining `where` + `orderBy` on different fields

---

### 2. **User Transactions (Ascending Date)**
```json
{
  "collectionGroup": "expenseTransactions",
  "fields": [
    { "fieldPath": "userId", "order": "ASCENDING" },
    { "fieldPath": "date", "order": "ASCENDING" }
  ]
}
```

**Used by:**
```javascript
// Get user's transactions, oldest first (for analytics)
query(
  collection(db, 'expenseTransactions'),
  where('userId', '==', userId),
  orderBy('date', 'asc')
)
```

---

### 3. **User + Category + Date**
```json
{
  "collectionGroup": "expenseTransactions",
  "fields": [
    { "fieldPath": "userId", "order": "ASCENDING" },
    { "fieldPath": "category", "order": "ASCENDING" },
    { "fieldPath": "date", "order": "DESCENDING" }
  ]
}
```

**Used by:**
```javascript
// Get user's food transactions, newest first
query(
  collection(db, 'expenseTransactions'),
  where('userId', '==', userId),
  where('category', '==', 'Food & Dining'),
  orderBy('date', 'desc')
)
```

**Why needed:** 2 `where` clauses + 1 `orderBy`

---

### 4. **User Statements by Upload Date**
```json
{
  "collectionGroup": "expenseStatements",
  "fields": [
    { "fieldPath": "userId", "order": "ASCENDING" },
    { "fieldPath": "uploadedAt", "order": "DESCENDING" }
  ]
}
```

**Used by:**
```javascript
// Get user's statements, newest first
query(
  collection(db, 'expenseStatements'),
  where('userId', '==', userId),
  orderBy('uploadedAt', 'desc')
)
```

---

### 5. **Statement Transactions by Date**
```json
{
  "collectionGroup": "expenseTransactions",
  "fields": [
    { "fieldPath": "statementId", "order": "ASCENDING" },
    { "fieldPath": "date", "order": "DESCENDING" }
  ]
}
```

**Used by:**
```javascript
// Get all transactions from a statement, newest first
query(
  collection(db, 'expenseTransactions'),
  where('statementId', '==', statementId),
  orderBy('date', 'desc')
)
```

**Why needed:** NEW feature for statement history!

---

## 🛠️ How Indexes Work

### Example: Finding Your Food Expenses

**Query:**
```javascript
query(
  collection(db, 'expenseTransactions'),
  where('userId', '==', 'user_123'),
  where('category', '==', 'Food'),
  orderBy('date', 'desc')
)
```

**Without Index:**
```
1. Scan ALL documents in expenseTransactions (slow!)
2. Filter by userId (1000 documents left)
3. Filter by category (100 documents left)
4. Sort by date (expensive!)
Total: 5000ms
```

**With Index:**
```
1. Look up index: userId=user_123, category=Food
2. Read pre-sorted results directly
Total: 50ms ✅
```

**100x faster!**

---

## 📊 Index Structure Visualization

### Single Field Index (Automatic)
```
userId Index:
├─ user_123 → [doc1, doc5, doc9, ...]
├─ user_456 → [doc2, doc7, doc8, ...]
└─ user_789 → [doc3, doc4, doc6, ...]
```

### Composite Index (Manual)
```
userId + date Index:
├─ user_123
│  ├─ 2025-04-01 → [doc9]
│  ├─ 2025-03-28 → [doc5]
│  └─ 2025-03-15 → [doc1]
├─ user_456
│  ├─ 2025-04-02 → [doc8]
│  └─ 2025-03-30 → [doc2]
```

---

## 🚀 How to Create/Deploy Indexes

### Method 1: Automatic (Error-Driven)

1. **Run your query** in the app
2. **Firestore throws error** with a link
3. **Click the link** → Firebase Console
4. **Click "Create Index"** button
5. **Wait 2-5 minutes** for index to build

**Error Example:**
```
FirebaseError: The query requires an index. 
You can create it here: https://console.firebase.google.com/...
```

### Method 2: Manual (firestore.indexes.json)

1. **Edit `firestore.indexes.json`:**
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
    }
  ]
}
```

2. **Deploy using Firebase CLI:**
```bash
firebase deploy --only firestore:indexes
```

3. **Wait for indexes to build** (2-5 minutes for small datasets)

---

## 📁 Our Index File Location

**File:** `firestore.indexes.json` (in project root)

**Current Status:** All 5 indexes deployed ✅

**How to check:**
```bash
# View Firebase Console
https://console.firebase.google.com/project/YOUR_PROJECT/firestore/indexes

# Or deploy indexes
cd /Users/abhishek.kr/Downloads/dev/bill-reader
firebase deploy --only firestore:indexes
```

---

## 🔧 Index Best Practices

### ✅ DO:
1. **Create indexes for all production queries**
2. **Test queries with real data before deploying**
3. **Use ascending/descending strategically**
4. **Keep index file in version control**

### ❌ DON'T:
1. **Don't create indexes you don't use** (costs money!)
2. **Don't delete indexes while queries are running**
3. **Don't create duplicate indexes**
4. **Don't forget to deploy after adding new indexes**

---

## 💰 Cost Implications

### Index Storage Costs
- Each index creates a copy of your data
- 5 indexes = 5x storage cost
- For 10,000 transactions: ~$0.01/month

### Read Costs
- Indexed queries: **Fast & cheap** ✅
- Non-indexed queries: **Slow & expensive** ❌

**Bottom line:** Indexes save money by making queries faster!

---

## 🐛 Common Issues

### Issue 1: "Index already exists"
**Solution:** Index was already created manually
```bash
# This is OK! Just means index exists
Error: index already exists
```

### Issue 2: "Query requires an index"
**Solution:** Click the link in error message or add to `firestore.indexes.json`

### Issue 3: "Index still building"
**Solution:** Wait 2-5 minutes, then retry query

---

## 📊 How We Make Indexes

### Step 1: Write Query in Code
```javascript
// In firestoreService.js
const q = query(
  collection(db, 'expenseTransactions'),
  where('userId', '==', userId),
  orderBy('date', 'desc')
);
```

### Step 2: Run Query
```javascript
const docs = await getDocs(q);
// ❌ Error: Query requires index!
```

### Step 3: Add to firestore.indexes.json
```json
{
  "collectionGroup": "expenseTransactions",
  "fields": [
    { "fieldPath": "userId", "order": "ASCENDING" },
    { "fieldPath": "date", "order": "DESCENDING" }
  ]
}
```

### Step 4: Deploy
```bash
firebase deploy --only firestore:indexes
```

### Step 5: Wait & Test
```
⏱️  Wait 2-5 minutes...
✅ Query works!
```

---

## 🎯 Quick Reference

### Query Type → Index Needed?

| Query | Index Needed? |
|-------|--------------|
| `where('userId', '==', x)` | ❌ Automatic |
| `orderBy('date')` | ❌ Automatic |
| `where('userId', '==', x) + orderBy('date')` | ✅ **Manual** |
| `where('userId', '==', x) + where('category', '==', y)` | ✅ **Manual** |
| `where('userId', '==', x) + where('category', '==', y) + orderBy('date')` | ✅ **Manual** |

---

## 📚 Resources

- **Firebase Console:** https://console.firebase.google.com/
- **Firestore Indexes Docs:** https://firebase.google.com/docs/firestore/query-data/indexing
- **Our Index File:** `/firestore.indexes.json`

---

## ✅ Summary

**What are indexes?**
- Pre-computed lookup tables for fast queries

**Why do we need them?**
- Queries with multiple fields require composite indexes
- Makes queries 100x faster

**How do we create them?**
1. Add to `firestore.indexes.json`
2. Deploy: `firebase deploy --only firestore:indexes`
3. Wait 2-5 minutes

**Our current indexes:**
1. User transactions (desc date) ✅
2. User transactions (asc date) ✅
3. User + category + date ✅
4. User statements by upload date ✅
5. Statement transactions by date ✅

**All working perfectly!** 🎉

