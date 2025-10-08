# 🏪 Merchant-Focused Expense Tracking

## Overview

The Expense Tracker has been transformed from a **generic category-based system** to a **highly detailed, merchant-specific tracking system**. This provides granular insights into spending patterns at the merchant level, not just broad categories.

---

## 🎯 Philosophy

**Traditional Approach** ❌:
- "Shopping" category with ₹50,000
- No visibility into which stores you're spending at
- Generic insights that don't help optimize spending

**Merchant-Focused Approach** ✅:
- Amazon: ₹25,000
- Flipkart: ₹15,000
- Local Store: ₹10,000
- **Actionable insights** - you can see exactly where your money goes

---

## ✨ Key Changes

### 1. **Category Dropdown with Tags**

**Before**: Text input for category
**After**: Smart dropdown with:
- All user-created tags
- Option to enter custom categories
- Emoji support for visual identification

**Location**: Transaction edit mode

**How it works**:
```jsx
<Select value={editForm.category} onValueChange={...}>
  <SelectItem value="custom">💬 Custom (type below)</SelectItem>
  {availableTags.map((tag) => (
    <SelectItem key={tag.id} value={tag.name}>
      {tag.emoji || "🏷️"} {tag.name}
    </SelectItem>
  ))}
</Select>
```

### 2. **Merchant-Priority Display in Charts**

**Before**: Charts showed generic categories like "Shopping", "Food & Dining"
**After**: Charts show **actual merchant names** like "Amazon", "Swiggy", "Flipkart"

**Implementation**:
```javascript
// In getTransactionStats()
const displayName = t.merchant || t.category || 'Uncategorized';
```

**Priority Order**:
1. **Merchant name** (if detected) - e.g., "Amazon", "Swiggy"
2. **Category** (if no merchant) - e.g., "Shopping", "Food"
3. **"Uncategorized"** (if neither)

### 3. **Expanded Merchant Emoji Library**

Added **25+ merchant-specific emojis**:

| Merchant | Emoji | Merchant | Emoji |
|----------|-------|----------|-------|
| Amazon | 📦 | Flipkart | 🛒 |
| Swiggy | 🍽️ | Zomato | 🍕 |
| Uber | 🚕 | Ola | 🚖 |
| Netflix | 📺 | Spotify | 🎵 |
| Prime Video | 🎬 | Hotstar | 📺 |
| Google | 🔍 | Apple | 🍎 |
| Microsoft | 💻 | Paytm | 💳 |
| PhonePe | 📱 | GPay | 💰 |
| Razorpay | 💳 | BigBasket | 🥬 |
| Blinkit | ⚡ | Zepto | 🛒 |
| Dunzo | 📦 | BookMyShow | 🎟️ |
| MakeMyTrip | ✈️ | Airbnb | 🏡 |
| OYO | 🏨 | | |

---

## 📊 Impact on Charts

### Dashboard Charts Now Show:

#### **Top Spending Categories (Pie Chart)**
**Before**:
- 🛍️ Shopping: ₹50,000 (60%)
- 🍔 Food & Dining: ₹20,000 (24%)
- 🚗 Transport: ₹13,000 (16%)

**After**:
- 📦 Amazon: ₹25,000 (30%)
- 🛒 Flipkart: ₹15,000 (18%)
- 🍽️ Swiggy: ₹12,000 (14%)
- 🍕 Zomato: ₹8,000 (10%)
- 🛒 Local Store: ₹10,000 (12%)
- 🚕 Uber: ₹8,000 (10%)
- 🚖 Ola: ₹5,000 (6%)

#### **Spending by Category (Bar Chart)**
**Before**: Generic categories
**After**: Specific merchants with exact amounts

#### **Monthly Comparison**
**Before**: Total income vs expenses
**After**: Still shows totals, but drill-down shows merchant breakdown

---

## 🔧 Technical Implementation

### Files Modified

1. **`/apps/expense-tracker/src/pages/Transactions.jsx`**
   - Added `getUserTags` import
   - Added `availableTags` state
   - Replaced category text input with dropdown Select
   - Added custom category input option
   - Updated `handleSaveEdit` to use custom category when selected

2. **`/apps/expense-tracker/src/services/firestoreService.js`**
   - Modified `getTransactionStats()` function
   - Changed category breakdown logic to prioritize merchant names
   - Added comment explaining merchant-priority approach

3. **`/apps/expense-tracker/src/utils/categoryEmojis.js`**
   - Added 25+ merchant-specific emoji mappings
   - Includes all major Indian and international merchants
   - Maintains backward compatibility with generic categories

---

## 🎨 User Experience

### Transaction Edit Flow

1. **Click Edit** on any transaction
2. **See dropdown** with all available tags
3. **Select a tag** or choose "Custom"
4. **If Custom**: Type merchant name or category
5. **Save** - transaction now has detailed merchant info

### Dashboard View

1. **Open Dashboard**
2. **See pie chart** with actual merchant names
3. **Hover over slices** to see exact amounts
4. **Bar chart** shows top merchants ranked by spending
5. **Monthly trends** show how merchant spending changes over time

---

## 💡 Use Cases

### 1. **Identify Spending Patterns**
- "I'm spending ₹15,000/month on Swiggy? Time to cook more!"
- "Amazon purchases are ₹25,000 - maybe I should use Flipkart sales"

### 2. **Compare Merchants**
- Uber vs Ola: Which is cheaper?
- Swiggy vs Zomato: Where do I order more?
- Amazon vs Flipkart: Better deals?

### 3. **Budget by Merchant**
- Set limits: "Max ₹5,000 on food delivery"
- Track: "Staying under ₹10,000 on Amazon this month"

### 4. **Tax Planning**
- Business expenses: Separate Uber (work) from Ola (personal)
- Categorize Amazon purchases: Work supplies vs personal

### 5. **Subscription Tracking**
- Netflix, Spotify, Prime - see all subscriptions in one place
- Identify unused subscriptions to cancel

---

## 🚀 Future Enhancements

### Planned Features

1. **Merchant Budgets**
   - Set spending limits per merchant
   - Get alerts when approaching limit
   - Monthly/weekly budget tracking

2. **Merchant Comparisons**
   - Side-by-side spending comparison
   - Price analysis: "You could save ₹2,000 by using Flipkart"
   - Trend analysis: "Swiggy spending up 30% this month"

3. **Smart Suggestions**
   - "You haven't used your Amazon Prime benefits this month"
   - "Flipkart has better deals on electronics"
   - "Consider carpooling - Uber spending is high"

4. **Merchant Categories**
   - Group merchants: "Food Delivery" (Swiggy + Zomato)
   - Custom groupings: "Work Transport" (Uber + Ola for work)
   - Hierarchical view: Shopping → Amazon → Electronics

5. **Loyalty & Rewards Tracking**
   - Track cashback from each merchant
   - Calculate effective spending (after rewards)
   - Suggest best payment method per merchant

---

## 📈 Data Structure

### Transaction Object (Enhanced)

```javascript
{
  id: "txn_123",
  userId: "user_456",
  description: "Amazon - Electronics Purchase",
  amount: 15000,
  date: "2025-10-08",
  type: "debit",
  
  // Merchant detection (auto-filled)
  merchant: "Amazon",  // ← NEW: Detected merchant name
  
  // Category/Tag (user-defined or auto-categorized)
  category: "Amazon",  // Can be merchant name or custom tag
  
  // Optional: User tags for grouping
  tags: ["Electronics", "Work", "Reimbursable"],
  
  // Optional: Credit card info
  isCreditCardPayment: false,
  creditCardInfo: null,
}
```

### Chart Data Flow

```
Transaction → getTransactionStats() → categoryBreakdown
                                          ↓
                        Prioritize: merchant > category > "Uncategorized"
                                          ↓
                        Dashboard Charts (Pie, Bar, Line)
```

---

## 🎯 Benefits

### For Users

1. **Granular Insights**: See exactly where money goes
2. **Actionable Data**: Make informed decisions about spending
3. **Easy Tracking**: Dropdown makes categorization fast
4. **Visual Clarity**: Merchant emojis for quick identification
5. **Flexible System**: Use tags, merchants, or custom categories

### For Developers

1. **Backward Compatible**: Existing data still works
2. **Extensible**: Easy to add new merchants/emojis
3. **Maintainable**: Clear priority logic (merchant > category)
4. **Scalable**: Works with any number of merchants/tags
5. **Testable**: Simple data transformation logic

---

## 🔍 Example Scenarios

### Scenario 1: Food Delivery Analysis

**Question**: "How much am I spending on food delivery?"

**Before** (Generic):
- Food & Dining: ₹20,000

**After** (Merchant-Focused):
- Swiggy: ₹12,000 (60%)
- Zomato: ₹8,000 (40%)
- **Insight**: "I prefer Swiggy, but Zomato might have better deals"

### Scenario 2: E-commerce Optimization

**Question**: "Which platform should I use for shopping?"

**Before** (Generic):
- Shopping: ₹50,000

**After** (Merchant-Focused):
- Amazon: ₹25,000 (50%)
- Flipkart: ₹15,000 (30%)
- Local Stores: ₹10,000 (20%)
- **Insight**: "Amazon is my go-to, but I should check Flipkart sales"

### Scenario 3: Subscription Audit

**Question**: "What subscriptions am I paying for?"

**After** (Merchant-Focused):
- Netflix: ₹799/month
- Spotify: ₹119/month
- Prime Video: ₹299/month
- Hotstar: ₹499/month
- **Total**: ₹1,716/month
- **Insight**: "Do I really need all 4 streaming services?"

---

## 🛠️ Customization Guide

### Adding New Merchants

**File**: `apps/expense-tracker/src/utils/categoryEmojis.js`

```javascript
export const CATEGORY_EMOJIS = {
  // ... existing merchants
  "YourMerchant": "🏪",  // Add your merchant here
};
```

### Creating Custom Tags

1. Navigate to **Tags** page
2. Click **"Create New Tag"**
3. Enter:
   - Name: "Work Expenses"
   - Emoji: 💼
   - Color: #3B82F6
4. Use in transactions via dropdown

### Merchant Detection

**File**: `apps/expense-tracker/src/services/merchantDetector.js`

```javascript
const MERCHANT_PATTERNS = {
  'amazon': 'Amazon',
  'amzn': 'Amazon',
  'flipkart': 'Flipkart',
  // Add your patterns here
};
```

---

## ✅ Success Metrics

### Before vs After

| Metric | Before | After |
|--------|--------|-------|
| **Insight Granularity** | Category-level | Merchant-level |
| **Chart Usefulness** | Generic | Actionable |
| **User Effort** | Manual text entry | Smart dropdown |
| **Visual Clarity** | Basic emojis | Merchant-specific |
| **Decision Making** | Limited | Data-driven |

---

## 📞 Support

If you have questions or want to add more merchants:

- **Email**: abhishek022kk@gmail.com
- **Feature Requests**: Use the Contact page
- **Bug Reports**: Include merchant name and expected emoji

---

**Built with 💡 by Abhishek Kumar**

*Making expense tracking detailed, actionable, and insightful*
