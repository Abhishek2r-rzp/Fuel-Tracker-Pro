/**
 * Category Mapping Service
 * Maps transaction descriptions to specific categories based on patterns
 */

import { getMainCategory } from "../utils/categoryEmojis";

export const CATEGORY_MAPPINGS = {
  INCOME: {
    patterns: [
      "RAZORPAY SOFTWARE PRIVATE LIMITED",
      "SALARY",
      "SAL CREDIT",
      "PAYROLL",
      "INCOME",
      "REFUND",
      "CASHBACK",
      "INTEREST CREDIT",
    ],
    category: "Income",
    type: "credit",
  },

  INVESTMENT: {
    patterns: [
      "INDIAN CLEARING CORP",
      "GROWW",
      "ZERODHA",
      "UPSTOX",
      "MUTUAL FUND",
      "SIP",
      "SYSTEMATIC INVESTMENT",
      "STOCK",
      "EQUITY",
      "INVESTMENT",
    ],
    category: "Investments",
    type: "debit",
  },

  // E-commerce
  AMAZON: {
    patterns: ["AMAZON", "AMZN", "AMZ"],
    category: "Amazon",
    type: "debit",
    excludePatterns: ["AMAZON PAY CREDIT CA", "AMAZONPAYCCBILLPAYMENT"], // Exclude credit card payments
  },

  FLIPKART: {
    patterns: ["FLIPKART", "FKRT"],
    category: "Flipkart",
    type: "debit",
  },

  // Food Delivery
  SWIGGY: {
    patterns: ["SWIGGY", "BUNDL TECHNOLOGIES"],
    category: "Swiggy",
    type: "debit",
  },

  ZOMATO: {
    patterns: ["ZOMATO", "ZOMATO MEDIA"],
    category: "Zomato",
    type: "debit",
  },

  RENT: {
    patterns: [
      "RENT",
      "HOUSE RENT",
      "RENTAL",
      /UPI-\d{10}-FDRL\d+-\d+-.*RENT/i,
      /UPI-.*RENT$/i,
    ],
    category: "Rent & Housing",
    type: "debit",
  },

  // Bill Payments (General)
  BILL_PAYMENTS: {
    patterns: [
      "BILLPAY",
      "BILL PAYMENT",
      "ELECTRICITY",
      "WATER BILL",
      "GAS BILL",
      "INTERNET BILL",
      "MOBILE RECHARGE",
      "DTH RECHARGE",
      "BROADBAND",
      "UTILITY",
    ],
    category: "Bill Payments",
    type: "debit",
    excludePatterns: ["CREDIT CARD", "CC BILL", "CRED"], // Exclude credit card bills
  },

  CREDIT_CARD_BILLS: {
    patterns: [
      "IB BILLPAY DR-HDFC",
      "CRED CLUB",
      "CRED.CLUB",
      "PAYMENT ON CRED",
      "AMAZON PAY CREDIT CA",
      "AMAZONPAYCCBILLPAYMENT",
      "CC BILL",
      "CREDIT CARD BILL",
      "CARD PAYMENT",
      /IB BILLPAY DR-[A-Z]+-\d+/i,
    ],
    category: "Credit Card Bills",
    type: "debit",
  },

  // Groceries
  GROCERIES: {
    patterns: [
      "DMART",
      "D MART",
      "BIGBASKET",
      "BIG BASKET",
      "BLINKIT",
      "ZEPTO",
      "DUNZO",
      "JIOMART",
      "GROCERY",
    ],
    category: "Groceries",
    type: "debit",
  },

  // Transport
  TRANSPORT: {
    patterns: ["UBER", "OLA", "RAPIDO", "METRO", "PETROL", "FUEL", "PARKING"],
    category: "Transport",
    type: "debit",
  },

  // Entertainment
  ENTERTAINMENT: {
    patterns: [
      "NETFLIX",
      "PRIME VIDEO",
      "HOTSTAR",
      "SPOTIFY",
      "BOOKMYSHOW",
      "PVR",
      "INOX",
    ],
    category: "Entertainment",
    type: "debit",
  },
};

/**
 * Detect category from transaction description
 * @param {string} description - Transaction description
 * @param {number} amount - Transaction amount
 * @returns {string|null} - Detected category or null
 */
export function detectCategoryFromDescription(description, amount = 0) {
  if (!description) return null;

  const descUpper = description.toUpperCase();
  const isCredit = amount > 0;

  // Check each mapping
  for (const [_key, mapping] of Object.entries(CATEGORY_MAPPINGS)) {
    // Check if type matches (if specified)
    if (mapping.type === "credit" && !isCredit) continue;
    if (mapping.type === "debit" && isCredit) continue;

    // Check exclude patterns first
    if (mapping.excludePatterns) {
      const shouldExclude = mapping.excludePatterns.some((pattern) => {
        if (pattern instanceof RegExp) {
          return pattern.test(description);
        }
        return descUpper.includes(pattern.toUpperCase());
      });
      if (shouldExclude) continue;
    }

    // Check if any pattern matches
    const matches = mapping.patterns.some((pattern) => {
      if (pattern instanceof RegExp) {
        return pattern.test(description);
      }
      return descUpper.includes(pattern.toUpperCase());
    });

    if (matches) {
      return mapping.category;
    }
  }

  return null;
}

/**
 * Get category with fallback to merchant or default
 * @param {Object} transaction - Transaction object
 * @returns {string} - Final category
 */
export function getCategoryWithMapping(transaction) {
  // 1. Try pattern-based detection
  const detectedCategory = detectCategoryFromDescription(
    transaction.description,
    transaction.amount
  );
  if (detectedCategory) return detectedCategory;

  // 2. Use existing category if not "Others" or "Uncategorized"
  if (
    transaction.category &&
    transaction.category !== "Others" &&
    transaction.category !== "Uncategorized"
  ) {
    return transaction.category;
  }

  // 3. Use merchant if available
  if (transaction.merchant && transaction.merchant !== "Others") {
    return transaction.merchant;
  }

  // 4. Default
  return "Others";
}

/**
 * Get all tracked categories for dashboard
 * @returns {Array} - List of category names
 */
export function getTrackedCategories() {
  return [
    "Income",
    "Expense",
    "Investments",
    "Amazon",
    "Flipkart",
    "Swiggy",
    "Zomato",
    "Groceries",
    "Rent & Housing",
    "Bill Payments",
    "Credit Card Bills",
    "Transport",
    "Entertainment",
    "Others",
  ];
}

/**
 * Calculate category-wise breakdown with smart mapping
 * @param {Array} transactions - List of transactions
 * @returns {Object} - Category breakdown
 */
export function calculateCategoryBreakdown(transactions) {
  const breakdown = {};

  transactions.forEach((txn) => {
    const category = getCategoryWithMapping(txn);
    const mainCategory = getMainCategory(category);
    const amount = Math.abs(txn.amount);

    if (!breakdown[mainCategory]) {
      breakdown[mainCategory] = {
        count: 0,
        total: 0,
        isIncome: mainCategory === "Income",
      };
    }

    breakdown[mainCategory].count++;
    breakdown[mainCategory].total += amount;
  });

  // Calculate total expense (all non-income categories)
  const totalExpense = Object.entries(breakdown)
    .filter(([cat]) => cat !== "Income")
    .reduce((sum, [, data]) => sum + data.total, 0);

  breakdown["Expense"] = {
    count: transactions.filter((t) => t.amount < 0 || t.type === "debit")
      .length,
    total: totalExpense,
    isIncome: false,
  };

  return breakdown;
}

/**
 * Auto-categorize a transaction based on patterns
 * @param {Object} transaction - Transaction object
 * @returns {Object} - Updated transaction with category
 */
export function autoCategorizeTransaction(transaction) {
  const detectedCategory = detectCategoryFromDescription(
    transaction.description,
    transaction.amount
  );

  if (detectedCategory) {
    return {
      ...transaction,
      category: detectedCategory,
      autoCategorized: true,
    };
  }

  return transaction;
}

/**
 * Bulk auto-categorize transactions
 * @param {Array} transactions - List of transactions
 * @returns {Array} - Updated transactions
 */
export function bulkAutoCategorize(transactions) {
  return transactions.map((txn) => {
    // Only auto-categorize if category is missing or "Others"
    if (
      !txn.category ||
      txn.category === "Others" ||
      txn.category === "Uncategorized"
    ) {
      return autoCategorizeTransaction(txn);
    }
    return txn;
  });
}

/**
 * Add a custom mapping pattern
 * @param {string} category - Category name
 * @param {Array} patterns - Patterns to match
 * @param {string} type - 'credit' or 'debit'
 */
export function addCustomMapping(category, patterns, type = "debit") {
  const key = category.toUpperCase().replace(/\s+/g, "_");
  CATEGORY_MAPPINGS[key] = {
    patterns,
    category,
    type,
  };
}
