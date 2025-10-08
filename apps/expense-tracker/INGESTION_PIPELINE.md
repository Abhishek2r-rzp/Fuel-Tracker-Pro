# Transaction Ingestion Pipeline

## Overview

The transaction ingestion pipeline is a robust data processing system that normalizes different bank statement formats into a consistent schema. It handles various date formats, amount representations (credit/debit, withdrawal/deposit), and automatically categorizes transactions.

## Architecture

```
┌─────────────────┐
│  File Upload    │
│  (Excel/CSV)    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  File Parser    │
│ (excelParser.js)│
│  (csvParser.js) │
└────────┬────────┘
         │
         ▼
┌─────────────────────────┐
│  Transaction Normalizer │
│ (transactionNormalizer) │
│  ┌──────────────────┐   │
│  │ Date Normalization│   │
│  │ Amount Detection  │   │
│  │ Type Detection    │   │
│  └──────────────────┘   │
└────────┬────────────────┘
         │
         ▼
┌─────────────────┐
│ Category Detector│
│(categoryDetector)│
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Validation    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│    Firestore    │
└─────────────────┘
```

## Components

### 1. Transaction Normalizer (`transactionNormalizer.js`)

Handles the core data transformation logic:

#### Date Normalization
- **Supported formats:**
  - `DD/MM/YYYY` or `DD-MM-YYYY`
  - `YYYY-MM-DD` (ISO format)
  - `DD Mon YYYY` (e.g., "15 Jan 2025")
  - JavaScript Date objects
  - Unix timestamps

#### Amount Detection
- **Credit/Debit columns:** Detects separate credit and debit columns
- **Single amount column:** Handles single amount column with +/- signs
- **Withdrawal/Deposit:** Recognizes withdrawal/deposit terminology
- **Currency cleaning:** Removes ₹, $, €, £, commas, and spaces

#### Transaction Type Detection
- **Credit transactions:** Positive amounts or in credit column
- **Debit transactions:** Negative amounts or in debit column
- **Auto-detection:** Determines type based on column structure

#### Functions

```javascript
normalizeTransaction(rawTransaction, headers)
```
Normalizes a single transaction from raw format.

**Parameters:**
- `rawTransaction`: Raw transaction data (array or object)
- `headers`: Column headers (array)

**Returns:**
```javascript
{
  date: Date,
  description: string,
  amount: number,
  type: 'credit' | 'debit' | 'unknown',
  category: string,
  originalData: object
}
```

```javascript
normalizeBatch(transactions, headers)
```
Normalizes multiple transactions.

```javascript
validateNormalizedTransaction(transaction)
```
Validates a normalized transaction.

**Returns:**
```javascript
{
  isValid: boolean,
  errors: string[],
  warnings: string[]
}
```

### 2. Category Detector (`categoryDetector.js`)

Automatically categorizes transactions based on description keywords.

#### Categories

1. **Shopping - Online**
   - Amazon, Flipkart, Myntra, Ajio, Meesho, Nykaa, etc.
   - Swiggy Instamart, Blinkit, Zepto, Dunzo

2. **Shopping - Retail**
   - Reliance Retail, DMart, Big Bazaar, Westside, Pantaloons
   - Zara, H&M, Decathlon

3. **Groceries**
   - BigBasket, Grofers, JioMart
   - Local grocery stores, kirana, supermarkets

4. **Food & Dining**
   - Swiggy, Zomato, Uber Eats
   - Restaurants, cafes, McDonald's, KFC, Dominos, Starbucks

5. **Transport**
   - Uber, Ola, Rapido
   - Metro, Bus, Train, IRCTC, Flights
   - Petrol, Diesel, Parking, FASTag

6. **Utilities**
   - Electricity, Water, Gas
   - Internet, Broadband, WiFi
   - Airtel, Jio Fiber, ACT Fibernet

7. **Entertainment**
   - Netflix, Amazon Prime, Disney+ Hotstar, Spotify
   - Movies, PVR, INOX, BookMyShow
   - Gaming platforms

8. **Healthcare**
   - Pharmacies: Apollo, MedPlus, Netmeds, PharmEasy, 1mg
   - Hospitals, Clinics, Doctors

9. **Bills & Recharges**
   - Mobile recharge, DTH recharge
   - Prepaid, Postpaid

10. **Transfers**
    - UPI, NEFT, RTGS, IMPS
    - PayTM, GPay, PhonePe

11. **Others**
    - Default category for unmatched transactions

#### Functions

```javascript
detectCategory(description)
```
Detects category from transaction description.

```javascript
getCategoryList()
```
Returns array of all available categories.

```javascript
addCustomPattern(category, pattern)
```
Adds a custom keyword pattern to a category.

```javascript
getCategoryStats(transactions)
```
Generates category-wise statistics.

### 3. File Parsers

#### Excel Parser (`excelParser.js`)
- Supports `.xlsx` and `.xls` formats
- Smart header detection (scans first 20 rows)
- Handles multiple sheets
- Now integrated with transaction normalizer

#### CSV Parser (`csvParser.js`)
- Supports `.csv` format
- Header detection
- Handles both header and non-header CSVs
- Now integrated with transaction normalizer

## Data Flow

### 1. Upload
User uploads a bank statement file (Excel or CSV).

### 2. Parsing
File is parsed to extract raw rows and headers.

### 3. Normalization
Each row is normalized:
- Date fields → JavaScript Date objects
- Amount fields → Numeric values
- Type detection → 'credit' or 'debit'
- Original data preserved

### 4. Categorization
Descriptions are analyzed and matched against category patterns.

### 5. Validation
Transactions are validated:
- **Errors:** Missing amount (prevents save)
- **Warnings:** Missing date/description/category

### 6. Storage
Valid transactions are saved to Firestore with:
- `userId`
- `date` (Timestamp)
- `description`
- `amount`
- `type`
- `category`
- `createdAt` (Timestamp)
- `updatedAt` (Timestamp)

## Supported Bank Formats

The pipeline automatically handles:

### Common Formats
- **HDFC Bank:** Date, Narration, Chq./Ref.No., Value Dt, Withdrawal Amt, Deposit Amt, Closing Balance
- **ICICI Bank:** Transaction Date, Value Date, Description, Cheque Number, Debit, Credit, Balance
- **SBI:** Txn Date, Value Date, Description, Ref No./Cheque No., Debit, Credit, Balance
- **Axis Bank:** Date, Particulars, Chq./Ref. Number, Debit, Credit, Balance

### Credit Cards
- **HDFC Credit Card:** Date, Description, Amount
- **ICICI Credit Card:** Transaction Date, Description, International Amount, Amount
- **SBI Credit Card:** Date, Description, Amount

## Error Handling

### Invalid Transactions
Transactions with validation errors are filtered out and returned separately:

```javascript
{
  transactions: [...],      // Valid transactions
  invalidTransactions: [...], // Invalid transactions with errors
  requiresManualReview: boolean
}
```

### Common Issues
1. **Missing Amount:** Transaction skipped
2. **Invalid Date:** Warning logged, transaction included
3. **Missing Description:** Warning logged, transaction included
4. **No Category Match:** Assigned to "Others"

## Usage Example

```javascript
import { processFile } from './services/fileProcessor';

const file = event.target.files[0];
const result = await processFile(file);

console.log('Valid transactions:', result.transactions);
console.log('Invalid transactions:', result.invalidTransactions);
console.log('Total found:', result.transactions.length);

result.transactions.forEach(txn => {
  console.log({
    date: txn.date,
    description: txn.description,
    amount: txn.amount,
    type: txn.type,
    category: txn.category
  });
});
```

## Extending the System

### Adding New Categories

Edit `categoryDetector.js`:

```javascript
export const CATEGORIES = {
  // ... existing categories
  MY_NEW_CATEGORY: 'My New Category',
};

const CATEGORY_PATTERNS = {
  [CATEGORIES.MY_NEW_CATEGORY]: [
    'keyword1',
    'keyword2',
    'keyword3',
  ],
  // ... existing patterns
};
```

### Adding Custom Date Formats

Edit `transactionNormalizer.js`:

```javascript
const DATE_PATTERNS = {
  // ... existing patterns
  MY_FORMAT: /your-regex-here/,
};
```

### Adding Custom Amount Indicators

Edit `transactionNormalizer.js`:

```javascript
const AMOUNT_INDICATORS = {
  CREDIT: ['credit', 'cr', 'your-indicator'],
  DEBIT: ['debit', 'dr', 'your-indicator'],
  AMOUNT: ['amount', 'your-indicator'],
};
```

## Testing

Test your bank statement:
1. Upload a sample file
2. Check console logs for:
   - Header detection
   - Normalization results
   - Validation warnings
3. Verify transactions in Firestore
4. Check category assignments

## Performance

- **Header Detection:** O(n×m) where n = rows scanned (max 20), m = columns
- **Normalization:** O(n) where n = number of transactions
- **Category Detection:** O(n×c×k) where n = transactions, c = categories, k = keywords per category
- **Typical processing time:** < 2 seconds for 1000 transactions

## Future Enhancements

1. **Machine Learning:** Learn from user corrections
2. **Custom Categories:** User-defined categories
3. **Bank Templates:** Pre-configured bank formats
4. **Smart Deduplication:** More sophisticated duplicate detection
5. **Multi-currency:** Support for foreign currency transactions
6. **Receipt Matching:** Match transactions with uploaded receipts

