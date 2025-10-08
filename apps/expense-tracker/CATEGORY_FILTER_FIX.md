# Category Filter Fix

## Problem
The category dropdown filter in the Transactions page was not working correctly. When selecting "Credit Card Bills" from the dropdown, it showed 0 results even though there were transactions with that category. This was due to:

1. **Category Name Mismatches**: The dropdown had hardcoded category names that didn't match the hierarchical category structure
2. **Filter Logic Issue**: The filter was comparing the exact transaction category (subcategory) against the dropdown selection (main category)
3. **Dashboard Cards Using Old Names**: Dashboard category cards were using outdated or inconsistent category names

## Root Cause
- The `Transactions.jsx` component had a hardcoded `categories` array with names like "Credit Card Bill Payments", "Investment", "Rent", etc.
- The filter logic at line 142 was using `getCategoryWithMapping(t)` which returns the actual category (could be a subcategory like "Amazon" or "Swiggy")
- The comparison `mappedCategory === selectedCategory` would fail when filtering by main categories because transactions have subcategories
- The `Dashboard.jsx` had inconsistent category names that didn't align with the `CATEGORY_HIERARCHY`

## Solution

### 1. Updated Transaction Filtering Logic
**File**: `apps/expense-tracker/src/pages/Transactions.jsx`

**Changes**:
- Imported `getAllMainCategories` and `getMainCategory` from `categoryEmojis.js`
- Replaced hardcoded categories array with `getAllMainCategories()` to dynamically get all main categories from the hierarchy
- Updated filter logic to map transaction categories to their main category before comparison:
  ```javascript
  if (selectedCategory) {
    filtered = filtered.filter((t) => {
      const mappedCategory = getCategoryWithMapping(t);
      const mainCategory = getMainCategory(mappedCategory);
      return mainCategory === selectedCategory;
    });
  }
  ```

### 2. Updated Category Breakdown Calculation
**File**: `apps/expense-tracker/src/services/categoryMappingService.js`

**Changes**:
- Imported `getMainCategory` from `categoryEmojis.js`
- Updated `calculateCategoryBreakdown()` to group transactions by main category instead of subcategory:
  ```javascript
  transactions.forEach((txn) => {
    const category = getCategoryWithMapping(txn);
    const mainCategory = getMainCategory(category);  // NEW
    const amount = Math.abs(txn.amount);

    if (!breakdown[mainCategory]) {  // Changed from category to mainCategory
      breakdown[mainCategory] = {
        count: 0,
        total: 0,
        isIncome: mainCategory === 'Income',
      };
    }

    breakdown[mainCategory].count++;
    breakdown[mainCategory].total += amount;
  });
  ```

### 3. Fixed Dashboard Category Names
**File**: `apps/expense-tracker/src/pages/Dashboard.jsx`

**Updated Category Cards**:
- ❌ "Investment" → ✅ "Investments"
- ❌ "Rent" → ✅ "Rent & Housing"
- ❌ "Bill Payments" → ✅ "Bills & Fees"
- ❌ "Credit Card Bill Payments" → ✅ "Credit Card Bills"
- ❌ "Amazon" → ✅ "Shopping - Online"
- ❌ "Flipkart" → (merged into Shopping - Online)
- ❌ "Swiggy" → ✅ "Food & Dining"
- ❌ "Zomato" → (merged into Food & Dining)
- ✅ Added "Transport" card
- ✅ Added "Entertainment" card

All dashboard cards now use main category names from `CATEGORY_HIERARCHY`.

## Files Modified
1. `/apps/expense-tracker/src/pages/Transactions.jsx`
   - Added imports for `getAllMainCategories` and `getMainCategory`
   - Updated filter logic to compare main categories
   - Replaced hardcoded categories with dynamic list

2. `/apps/expense-tracker/src/services/categoryMappingService.js`
   - Added import for `getMainCategory`
   - Updated `calculateCategoryBreakdown` to group by main category

3. `/apps/expense-tracker/src/pages/Dashboard.jsx`
   - Updated all category card references to use correct main category names
   - Consolidated merchant-specific cards into their main categories

## Impact
- ✅ **Category Filter Works**: Selecting "Credit Card Bills" now correctly shows all credit card bill transactions
- ✅ **Consistent Naming**: All categories across the app now use the same names from `CATEGORY_HIERARCHY`
- ✅ **Main Category Grouping**: Transactions are properly grouped by their main category for filtering and statistics
- ✅ **Dashboard Alignment**: Dashboard cards show accurate totals for main categories
- ✅ **No Lint Errors**: All changes pass linting checks

## How It Works Now

### Transaction Categorization Flow
1. **Raw Transaction** → has a description and amount
2. **Pattern Detection** → `detectCategoryFromDescription()` finds matching pattern (e.g., "CRED" → "Cred")
3. **Category Mapping** → `getCategoryWithMapping()` returns the detected category (could be subcategory)
4. **Main Category Lookup** → `getMainCategory()` maps subcategory to main category (e.g., "Cred" → "Credit Card Bills")
5. **Display/Filter** → UI uses main category for filtering and grouping

### Category Dropdown
The dropdown now shows all main categories from `CATEGORY_HIERARCHY`:
- Income
- Food & Dining
- Groceries
- Shopping - Online
- Shopping - Retail
- Transport
- Entertainment
- Healthcare
- Utilities
- Education
- Travel
- Investments
- Insurance
- Rent & Housing
- Bills & Fees
- Credit Card Bills
- Subscriptions
- Personal Care
- Gifts & Donations
- Transfers
- Business
- Pets
- Kids
- ATM
- Others

## Testing Recommendations
1. ✅ Upload a statement with credit card bill transactions
2. ✅ Select "Credit Card Bills" from the dropdown filter
3. ✅ Verify transactions appear correctly
4. ✅ Test other categories (Income, Investments, Rent & Housing, Bills & Fees)
5. ✅ Verify Dashboard cards show correct totals
6. ✅ Click Dashboard category cards and verify navigation to Transactions page with correct filter
7. ✅ Test pagination doesn't break when filtering
8. ✅ Verify category breakdown in UploadStatement page shows correct counts

## Related Issues Fixed
- Credit Card Bill Payments showing 0 transactions despite having data
- Dashboard cards using outdated or incorrect category names
- Inconsistent category naming across the application
- Transaction grouping not respecting hierarchical category structure

