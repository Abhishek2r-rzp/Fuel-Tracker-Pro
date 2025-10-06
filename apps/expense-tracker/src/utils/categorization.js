/**
 * Transaction Categorization System
 * AI-powered keyword-based categorization
 */

// System categories with keywords and icons
export const SYSTEM_CATEGORIES = {
  'Food & Dining': {
    keywords: ['restaurant', 'cafe', 'food', 'dining', 'swiggy', 'zomato', 'uber eats', 'dominos', 'pizza', 'mcdonald', 'kfc', 'starbucks', 'dunkin', 'subway'],
    color: '#F59E0B',
    icon: 'UtensilsCrossed',
  },
  'Transportation': {
    keywords: ['uber', 'ola', 'taxi', 'metro', 'bus', 'train', 'flight', 'airline', 'fuel', 'petrol', 'diesel', 'parking', 'toll', 'rapido'],
    color: '#3B82F6',
    icon: 'Car',
  },
  'Shopping': {
    keywords: ['amazon', 'flipkart', 'myntra', 'ajio', 'shopping', 'mall', 'store', 'retail', 'supermarket', 'grocery', 'bigbasket', 'grofers', 'blinkit'],
    color: '#EC4899',
    icon: 'ShoppingBag',
  },
  'Entertainment': {
    keywords: ['netflix', 'prime', 'hotstar', 'disney', 'spotify', 'youtube', 'movie', 'cinema', 'pvr', 'inox', 'theater', 'game', 'steam'],
    color: '#8B5CF6',
    icon: 'Film',
  },
  'Bills & Utilities': {
    keywords: ['electricity', 'water', 'gas', 'internet', 'broadband', 'mobile', 'recharge', 'postpaid', 'jio', 'airtel', 'vodafone', 'bsnl'],
    color: '#10B981',
    icon: 'Receipt',
  },
  'Healthcare': {
    keywords: ['hospital', 'clinic', 'doctor', 'medical', 'pharmacy', 'medicine', 'apollo', 'fortis', 'max', 'medlife', 'pharmeasy', '1mg'],
    color: '#EF4444',
    icon: 'Heart',
  },
  'Education': {
    keywords: ['school', 'college', 'university', 'course', 'tuition', 'books', 'stationary', 'udemy', 'coursera', 'byju', 'unacademy'],
    color: '#6366F1',
    icon: 'GraduationCap',
  },
  'Travel': {
    keywords: ['hotel', 'booking', 'makemytrip', 'goibibo', 'cleartrip', 'oyo', 'airbnb', 'travel', 'tour', 'vacation', 'trip'],
    color: '#14B8A6',
    icon: 'Plane',
  },
  'Investments': {
    keywords: ['mutual fund', 'sip', 'stock', 'zerodha', 'groww', 'upstox', 'investment', 'trading', 'gold', 'fd', 'deposit'],
    color: '#F97316',
    icon: 'TrendingUp',
  },
  'EMI/Loans': {
    keywords: ['emi', 'loan', 'credit', 'payment', 'installment', 'home loan', 'car loan', 'personal loan', 'interest'],
    color: '#DC2626',
    icon: 'CreditCard',
  },
  'Insurance': {
    keywords: ['insurance', 'policy', 'premium', 'lic', 'health insurance', 'term insurance', 'car insurance'],
    color: '#059669',
    icon: 'Shield',
  },
  'Salary & Income': {
    keywords: ['salary', 'wages', 'income', 'payment received', 'credit', 'bonus', 'incentive', 'refund'],
    color: '#10B981',
    icon: 'Wallet',
    type: 'income',
  },
  'Others': {
    keywords: [],
    color: '#6B7280',
    icon: 'HelpCircle',
  },
};

/**
 * Categorize a transaction based on description
 * @param {string} description - Transaction description
 * @param {string} amount - Transaction amount (for income detection)
 * @returns {object} - { category, confidence, matchedKeyword }
 */
export function categorizeTransaction(description, amount = null) {
  if (!description) {
    return {
      category: 'Others',
      confidence: 0,
      matchedKeyword: null,
    };
  }

  const normalizedDesc = String(description).toLowerCase().trim();
  
  // Check for income indicators (positive amount or income keywords)
  const isIncome = amount && parseFloat(amount) > 0;
  const hasIncomeKeyword = SYSTEM_CATEGORIES['Salary & Income'].keywords.some(
    keyword => normalizedDesc.includes(keyword.toLowerCase())
  );
  
  if (isIncome || hasIncomeKeyword) {
    return {
      category: 'Salary & Income',
      confidence: 90,
      matchedKeyword: hasIncomeKeyword ? 'income keyword' : 'positive amount',
    };
  }

  // Check each category
  let bestMatch = { category: 'Others', confidence: 0, matchedKeyword: null };

  Object.entries(SYSTEM_CATEGORIES).forEach(([category, data]) => {
    if (category === 'Salary & Income' || category === 'Others') return;

    data.keywords.forEach((keyword) => {
      if (normalizedDesc.includes(keyword.toLowerCase())) {
        const confidence = Math.min(95, 70 + keyword.length * 2);
        
        if (confidence > bestMatch.confidence) {
          bestMatch = {
            category,
            confidence,
            matchedKeyword: keyword,
          };
        }
      }
    });
  });

  return bestMatch;
}

/**
 * Categorize multiple transactions
 * @param {Array} transactions - Array of transactions
 * @returns {Array} - Transactions with category added
 */
export function categorizeTransactions(transactions) {
  return transactions.map((txn) => {
    const categoryResult = categorizeTransaction(txn.description, txn.amount);
    return {
      ...txn,
      category: categoryResult.category,
      categoryConfidence: categoryResult.confidence,
      matchedKeyword: categoryResult.matchedKeyword,
    };
  });
}

/**
 * Get category color
 * @param {string} category - Category name
 * @returns {string} - Hex color code
 */
export function getCategoryColor(category) {
  return SYSTEM_CATEGORIES[category]?.color || SYSTEM_CATEGORIES['Others'].color;
}

/**
 * Get category icon
 * @param {string} category - Category name
 * @returns {string} - Icon name
 */
export function getCategoryIcon(category) {
  return SYSTEM_CATEGORIES[category]?.icon || SYSTEM_CATEGORIES['Others'].icon;
}

/**
 * Get all categories
 * @returns {Array} - Array of category names
 */
export function getAllCategories() {
  return Object.keys(SYSTEM_CATEGORIES);
}

