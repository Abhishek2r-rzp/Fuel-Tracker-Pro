# Quick Start Guide - Transaction Ingestion

## 🚀 How to Use

### 1. Upload a Bank Statement
```
Navigate to: /upload-statement
Drag & drop or click to upload: .xlsx, .xls, or .csv file
```

### 2. Review Preview
The system will:
- ✅ Auto-detect headers (even if they're buried in the file!)
- ✅ Parse all transactions
- ✅ Categorize them automatically
- ✅ Show you a preview

### 3. Handle Duplicates (if any)
Choose:
- **Skip duplicates** (default) - Import only new transactions
- **Import all** - Import everything including duplicates

### 4. Save
Click "Save Transactions" - Done! ✨

---

## 📊 What Gets Saved

Each transaction is saved with:
```javascript
{
  userId: "your-user-id",
  date: Firestore Timestamp,
  description: "Transaction description",
  amount: -920,  // Negative = expense, Positive = income
  type: "debit",  // or "credit"
  category: "Shopping - Online",  // Auto-detected!
  createdAt: Firestore Timestamp,
  updatedAt: Firestore Timestamp
}
```

---

## 🏷️ Auto-Categorization

Your transactions are automatically categorized into:

| Category | Examples |
|----------|----------|
| **Shopping - Online** | Amazon, Flipkart, Myntra, Nykaa |
| **Shopping - Retail** | DMart, Reliance, Pantaloons |
| **Groceries** | BigBasket, Grofers, local stores |
| **Food & Dining** | Swiggy, Zomato, McDonald's, restaurants |
| **Transport** | Uber, Ola, IRCTC, fuel |
| **Utilities** | Electricity, internet, mobile recharges |
| **Entertainment** | Netflix, movies, gaming |
| **Healthcare** | Pharmacies, hospitals |
| **Bills & Recharges** | Mobile/DTH recharges |
| **Transfers** | UPI, NEFT, RTGS |
| **Others** | Everything else |

---

## 🔍 Supported Bank Formats

Works with ANY bank statement! The system auto-detects:

### Common Column Names
- **Dates:** `Date`, `Transaction Date`, `Txn Date`, `Posting Date`, `Value Date`
- **Descriptions:** `Description`, `Narration`, `Particulars`, `Details`, `Remarks`
- **Amounts:** `Amount`, `Debit`, `Credit`, `Withdrawal`, `Deposit`, `Dr`, `Cr`

### Tested Banks
- ✅ HDFC Bank
- ✅ ICICI Bank
- ✅ SBI
- ✅ Axis Bank
- ✅ Kotak Mahindra
- ✅ Yes Bank

---

## 📝 File Requirements

### Excel Files (.xlsx, .xls)
- Headers can be ANYWHERE in the file (we scan first 20 rows)
- Multiple sheets supported (we read all)
- Merged cells handled
- Empty rows automatically skipped

### CSV Files (.csv)
- Headers in first row OR auto-detected
- Comma or semicolon delimited
- Quoted fields supported

---

## ⚠️ Common Issues

### Issue: "No transactions found"
**Cause:** File doesn't have recognizable column headers.
**Solution:** Ensure your file has columns like "Date", "Description", "Amount" (or "Debit"/"Credit").

### Issue: "10 invalid transactions"
**Cause:** Some rows are missing amounts.
**Solution:** This is normal! Rows without amounts (like headers, subtotals) are automatically skipped.

### Issue: "Firestore index error"
**Cause:** Missing Firestore index.
**Solution:** Click the link in the error message to create the index automatically. (Should be fixed now!)

---

## 💡 Pro Tips

1. **First Upload:** Start with your most recent statement (last 3 months).
2. **Regular Updates:** Upload new statements monthly to track spending.
3. **Review Categories:** Check auto-assigned categories and correct if needed.
4. **Duplicates:** Use "Skip duplicates" to avoid importing the same transactions twice.

---

## 📊 After Upload

### View Transactions
```
Navigate to: /transactions
- Search by description
- Filter by category
- Edit/delete transactions
```

### View Analytics
```
Navigate to: /analytics
- Category breakdown
- Monthly trends
- Income vs Expenses
```

### Dashboard
```
Navigate to: /dashboard
- Quick stats
- Recent transactions
- Spending insights
```

---

## 🐛 Troubleshooting

### Problem: Categories are wrong
**Solution:** Will add category editing in next update. For now, categories are auto-assigned based on keywords.

### Problem: Dates are incorrect
**Solution:** System handles DD/MM/YYYY, YYYY-MM-DD, and more. If still wrong, check your file format.

### Problem: Amounts are wrong
**Solution:** System detects credit/debit columns automatically. Check that your file has clear column headers.

---

## 📚 Documentation

- **DATA_FLOW_EXPLAINED.md** - Complete step-by-step data flow
- **INGESTION_PIPELINE.md** - Technical pipeline documentation
- **FIXES_APPLIED.md** - All fixes and improvements

---

## ✅ Success Indicators

After uploading, you should see:
```
✅ Valid transactions: 370
⚠️ Invalid transactions: 10  ← This is normal!
💾 Saving batch of 370 transactions
✅ Successfully saved 370 transactions
```

If you see these logs, everything worked! 🎉

---

## 🎯 What's Next?

You can now:
1. ✅ Upload more bank statements
2. ✅ View all transactions at /transactions
3. ✅ Analyze spending at /analytics
4. ✅ Track trends at /dashboard

Happy tracking! 💰

