export const CATEGORIES = {
  SHOPPING_ONLINE: "Shopping - Online",
  SHOPPING_RETAIL: "Shopping - Retail",
  GROCERIES: "Groceries",
  FOOD_DINING: "Food & Dining",
  TRANSPORT: "Transport",
  UTILITIES: "Utilities",
  ENTERTAINMENT: "Entertainment",
  HEALTHCARE: "Healthcare",
  BILLS_RECHARGES: "Bills & Recharges",
  TRANSFERS: "Transfers",
  OTHERS: "Others",
};

const CATEGORY_PATTERNS = {
  [CATEGORIES.SHOPPING_ONLINE]: [
    "amazon",
    "flipkart",
    "myntra",
    "ajio",
    "meesho",
    "nykaa",
    "snapdeal",
    "shopify",
    "ebay",
    "etsy",
    "swiggy instamart",
    "blinkit",
    "zepto",
    "dunzo",
  ],

  [CATEGORIES.SHOPPING_RETAIL]: [
    "reliance retail",
    "dmart",
    "big bazaar",
    "more supermarket",
    "westside",
    "pantaloons",
    "max fashion",
    "lifestyle",
    "shoppers stop",
    "central",
    "zara",
    "h&m",
    "decathlon",
  ],

  [CATEGORIES.GROCERIES]: [
    "grocery",
    "supermarket",
    "vegetables",
    "fruits",
    "milk",
    "dairy",
    "kirana",
    "provision",
    "big basket",
    "grofers",
    "jiomart",
    "nature's basket",
    "spencers",
    "food bazaar",
  ],

  [CATEGORIES.FOOD_DINING]: [
    "swiggy",
    "zomato",
    "uber eats",
    "restaurant",
    "cafe",
    "pizza",
    "burger",
    "mcdonald",
    "kfc",
    "dominos",
    "subway",
    "starbucks",
    "cafe coffee day",
    "barista",
    "dunkin",
    "food court",
    "canteen",
    "mess",
  ],

  [CATEGORIES.TRANSPORT]: [
    "uber",
    "ola",
    "rapido",
    "metro",
    "bus",
    "train",
    "irctc",
    "flight",
    "airline",
    "indigo",
    "spicejet",
    "air india",
    "petrol",
    "diesel",
    "fuel",
    "parking",
    "toll",
    "fastag",
    "paytm fastag",
  ],

  [CATEGORIES.UTILITIES]: [
    "electricity",
    "water bill",
    "gas bill",
    "internet",
    "broadband",
    "wifi",
    "jio fiber",
    "airtel",
    "act fibernet",
    "bsnl",
    "lpg",
    "cylinder",
  ],

  [CATEGORIES.ENTERTAINMENT]: [
    "netflix",
    "amazon prime",
    "disney hotstar",
    "spotify",
    "youtube",
    "movie",
    "cinema",
    "pvr",
    "inox",
    "book my show",
    "paytm insider",
    "gaming",
    "playstation",
    "xbox",
    "steam",
  ],

  [CATEGORIES.HEALTHCARE]: [
    "pharmacy",
    "apollo",
    "medplus",
    "netmeds",
    "pharmeasy",
    "1mg",
    "hospital",
    "clinic",
    "doctor",
    "medical",
    "lab test",
    "diagnostic",
    "health",
  ],

  [CATEGORIES.BILLS_RECHARGES]: [
    "mobile recharge",
    "dth recharge",
    "prepaid",
    "postpaid",
    "vodafone",
    "jio recharge",
    "airtel recharge",
    "tata sky",
    "dish tv",
    "sun direct",
  ],

  [CATEGORIES.TRANSFERS]: [
    "upi",
    "neft",
    "rtgs",
    "imps",
    "fund transfer",
    "sent to",
    "received from",
    "transfer to",
    "transfer from",
    "paytm payment",
    "gpay",
    "google pay",
    "phonepe",
    "bhim",
  ],
};

export function detectCategory(description) {
  if (!description || typeof description !== "string") {
    return CATEGORIES.OTHERS;
  }

  const descLower = description.toLowerCase().trim();

  for (const [category, patterns] of Object.entries(CATEGORY_PATTERNS)) {
    for (const pattern of patterns) {
      if (descLower.includes(pattern.toLowerCase())) {
        return category;
      }
    }
  }

  return CATEGORIES.OTHERS;
}

export function getCategoryList() {
  return Object.values(CATEGORIES);
}

export function addCustomPattern(category, pattern) {
  if (!CATEGORY_PATTERNS[category]) {
    return false;
  }

  if (!CATEGORY_PATTERNS[category].includes(pattern.toLowerCase())) {
    CATEGORY_PATTERNS[category].push(pattern.toLowerCase());
  }

  return true;
}

export function getCategoryStats(transactions) {
  const stats = {};

  Object.values(CATEGORIES).forEach((category) => {
    stats[category] = {
      count: 0,
      totalAmount: 0,
      transactions: [],
    };
  });

  transactions.forEach((txn) => {
    const category = txn.category || CATEGORIES.OTHERS;
    if (stats[category]) {
      stats[category].count++;
      stats[category].totalAmount += Math.abs(txn.amount || 0);
      stats[category].transactions.push(txn);
    }
  });

  return stats;
}
