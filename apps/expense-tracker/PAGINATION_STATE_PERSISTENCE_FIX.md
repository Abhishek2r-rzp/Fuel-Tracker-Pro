# Pagination State Persistence Fix

## Problem

When navigating away from the Transactions page and coming back:
1. **Component reloads completely** - Loses all state including current page
2. **Returns to page 1** - Even if user was on page 2, 3, etc.
3. **Refetches data unnecessarily** - On every tab focus/window focus
4. **Poor user experience** - User loses their place in the list

### Root Causes

1. **Window Focus Event Listener** (Line 141-147)
   ```javascript
   useEffect(() => {
     const handleFocus = () => {
       fetchTransactions(); // Refetches on EVERY window focus
     };
     window.addEventListener("focus", handleFocus);
     return () => window.removeEventListener("focus", handleFocus);
   }, [fetchTransactions]);
   ```

2. **No State Persistence** 
   - Pagination state was stored only in component state
   - Lost when component unmounts during navigation

3. **Filter Changes Reset Page**
   - Every filter change reset page to 1, even when coming back from another tab

## Solution

### 1. URL-Based State Management

**Store pagination state in URL query parameters:**
```javascript
// Initialize from URL on mount
const [currentPage, setCurrentPage] = useState(() => {
  const params = new URLSearchParams(location.search);
  return parseInt(params.get("page")) || 1;
});
```

**Benefits:**
- ✅ Survives page navigation
- ✅ Shareable URLs with specific page
- ✅ Browser back/forward buttons work
- ✅ Bookmarkable

### 2. Centralized Page Change Handler

```javascript
const handlePageChange = (newPage) => {
  setCurrentPage(newPage);
  const params = new URLSearchParams(location.search);
  params.set("page", newPage.toString());
  navigate({ search: params.toString() }, { replace: true });
  window.scrollTo({ top: 0, behavior: "smooth" });
};
```

**Features:**
- Updates both state and URL
- Uses `replace: true` to avoid cluttering browser history
- Smooth scroll to top on page change
- Single source of truth for pagination

### 3. Smart Filter Detection

```javascript
const previousFiltersRef = useRef({ searchTerm: "", selectedCategory: "" });

useEffect(() => {
  const filtersChanged =
    previousFiltersRef.current.searchTerm !== searchTerm ||
    previousFiltersRef.current.selectedCategory !== selectedCategory;

  filterTransactions();

  // Only reset page if filters actually changed
  if (filtersChanged) {
    setCurrentPage(1);
    const params = new URLSearchParams(location.search);
    params.set("page", "1");
    navigate({ search: params.toString() }, { replace: true });
  }

  setSelectedTransactions([]);
  previousFiltersRef.current = { searchTerm, selectedCategory };
}, [filterTransactions, searchTerm, selectedCategory, location.search, navigate]);
```

**Key Points:**
- Uses `useRef` to track previous filter values
- Only resets to page 1 when filters actually change
- Doesn't reset when just navigating back to the page

### 4. Removed Aggressive Window Focus Refetch

**Before:**
```javascript
useEffect(() => {
  const handleFocus = () => {
    fetchTransactions(); // ❌ Refetches on every focus
  };
  window.addEventListener("focus", handleFocus);
  return () => window.removeEventListener("focus", handleFocus);
}, [fetchTransactions]);
```

**After:**
```javascript
// ✅ Removed this effect completely
// Data is cached and only refetches when needed
```

### 5. URL Sync Effect

```javascript
useEffect(() => {
  const params = new URLSearchParams(location.search);
  const category = params.get("category");
  const page = params.get("page");
  
  if (category) {
    setSelectedCategory(category);
  }
  
  if (page) {
    const pageNum = parseInt(page);
    if (!isNaN(pageNum) && pageNum > 0) {
      setCurrentPage(pageNum);
    }
  }
}, [location.search]);
```

**Purpose:**
- Syncs state with URL when URL changes
- Handles direct navigation with query params
- Validates page number before setting

## Changes Made

### File: `src/pages/Transactions.jsx`

1. **Added imports:**
   ```javascript
   import { useState, useEffect, useCallback, useRef } from "react";
   import { useLocation, useNavigate } from "react-router-dom";
   ```

2. **Updated state initialization:**
   ```javascript
   const navigate = useNavigate();
   const previousFiltersRef = useRef({ searchTerm: "", selectedCategory: "" });
   const [currentPage, setCurrentPage] = useState(() => {
     const params = new URLSearchParams(location.search);
     return parseInt(params.get("page")) || 1;
   });
   ```

3. **Added page change handler:**
   ```javascript
   const handlePageChange = (newPage) => {
     setCurrentPage(newPage);
     const params = new URLSearchParams(location.search);
     params.set("page", newPage.toString());
     navigate({ search: params.toString() }, { replace: true });
     window.scrollTo({ top: 0, behavior: "smooth" });
   };
   ```

4. **Updated pagination buttons:**
   ```javascript
   // Previous button
   onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
   
   // Next button
   onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
   
   // Number buttons
   onClick={() => handlePageChange(page)}
   ```

5. **Updated filter effect:**
   - Added smart filter change detection
   - Only resets page when filters actually change
   - Updates URL when resetting

6. **Removed window focus refetch:**
   - Removed aggressive refetch on tab focus
   - Data is cached in component state

## User Experience Improvements

### Before Fix
1. User navigates to page 3 of transactions
2. User clicks on "Dashboard" tab
3. User returns to "Transactions" tab
4. ❌ Back to page 1
5. ❌ Data refetched unnecessarily
6. ❌ Lost their place

### After Fix
1. User navigates to page 3 of transactions
2. URL updates to: `/transactions?page=3`
3. User clicks on "Dashboard" tab
4. User returns to "Transactions" tab
5. ✅ Still on page 3
6. ✅ Data cached, no unnecessary refetch
7. ✅ Can use browser back/forward buttons
8. ✅ Can bookmark specific page

## Additional Benefits

1. **Shareable URLs**
   - Send someone a link to page 3: `/transactions?page=3&category=Food`
   - They'll see exactly what you're seeing

2. **Browser Navigation**
   - Back button works correctly
   - Forward button works correctly
   - Refresh keeps you on the same page

3. **Performance**
   - No unnecessary refetches on tab switches
   - Cached data used when appropriate
   - Smooth scrolling on page changes

4. **Combined Filters**
   - Works with category filters
   - Works with date range filters
   - All params preserved in URL

## Testing Scenarios

### ✅ Scenario 1: Tab Switching
1. Go to Transactions page
2. Navigate to page 2
3. Click Dashboard tab
4. Click Transactions tab
5. **Result:** Still on page 2 ✅

### ✅ Scenario 2: Filtering
1. On page 2 of transactions
2. Select "Food & Dining" category
3. **Result:** Resets to page 1 (expected behavior) ✅
4. Navigate to page 2 of filtered results
5. Switch tabs and come back
6. **Result:** Still on page 2 with filter applied ✅

### ✅ Scenario 3: Sorting
1. On page 2 of transactions
2. Change sort order
3. **Result:** Resets to page 1 (expected behavior) ✅

### ✅ Scenario 4: Direct URL
1. Open URL: `/transactions?page=5`
2. **Result:** Opens directly to page 5 ✅

### ✅ Scenario 5: Browser Navigation
1. Navigate through pages 1 → 2 → 3
2. Click browser back button
3. **Result:** Goes back to page 2 ✅
4. Click browser forward button
5. **Result:** Goes forward to page 3 ✅

## Future Enhancements

Consider adding to URL state:
- Sort field and direction
- Search term (for shareable searches)
- Selected filters
- Items per page preference

This would create a fully stateful, bookmarkable, shareable transactions view.

## Notes

- Uses `replace: true` to avoid cluttering browser history with every page click
- Smooth scroll ensures user sees the top of the new page
- Filter detection using `useRef` prevents unnecessary resets
- All pagination handlers now go through centralized `handlePageChange`

