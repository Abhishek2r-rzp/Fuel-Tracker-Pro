export const MERCHANTS = {
  AMAZON: "Amazon",
  FLIPKART: "Flipkart",
  MYNTRA: "Myntra",
  SWIGGY: "Swiggy",
  SWIGGY_INSTAMART: "Swiggy Instamart",
  ZOMATO: "Zomato",
  UBER: "Uber",
  OLA: "Ola",
  NETFLIX: "Netflix",
  AMAZON_PRIME: "Amazon Prime",
  SPOTIFY: "Spotify",
  PAYTM: "Paytm",
  GOOGLE_PAY: "Google Pay",
  PHONEPE: "PhonePe",
  AIRTEL: "Airtel",
  JIO: "Jio",
  BLINKIT: "Blinkit",
  ZEPTO: "Zepto",
  BIGBASKET: "BigBasket",
  DUNZO: "Dunzo",
  NYKAA: "Nykaa",
  AJIO: "Ajio",
  MEESHO: "Meesho",
  BOOK_MY_SHOW: "BookMyShow",
  IRCTC: "IRCTC",
  DOMINOS: "Dominos",
  MCDONALD: "McDonald's",
  KFC: "KFC",
  STARBUCKS: "Starbucks",
  PHARMACY: "Pharmacy",
  APOLLO: "Apollo",
  MEDPLUS: "MedPlus",
  PHARMEASY: "PharmEasy",
  ONEMD: "1mg",
  DMART: "DMart",
  RELIANCE: "Reliance",
  OTHERS: "Others",
};

const MERCHANT_PATTERNS = {
  [MERCHANTS.AMAZON]: [
    "amazon",
    "amzn",
    "amazon.in",
    "amazon pay",
    "amazon prime",
  ],
  [MERCHANTS.FLIPKART]: ["flipkart", "fkrt", "flipkart.com"],
  [MERCHANTS.MYNTRA]: ["myntra", "myntra.com"],
  [MERCHANTS.SWIGGY]: ["swiggy", "swgy"],
  [MERCHANTS.SWIGGY_INSTAMART]: ["swiggy instamart", "instamart"],
  [MERCHANTS.ZOMATO]: ["zomato", "zomato.com"],
  [MERCHANTS.UBER]: ["uber", "uber india", "uber trip"],
  [MERCHANTS.OLA]: ["ola", "ola cabs", "olacabs"],
  [MERCHANTS.NETFLIX]: ["netflix", "nflx"],
  [MERCHANTS.AMAZON_PRIME]: ["prime video", "amazon prime video"],
  [MERCHANTS.SPOTIFY]: ["spotify"],
  [MERCHANTS.PAYTM]: ["paytm", "paytm payment", "paytm mall"],
  [MERCHANTS.GOOGLE_PAY]: ["google pay", "gpay", "g pay"],
  [MERCHANTS.PHONEPE]: ["phonepe", "phone pe"],
  [MERCHANTS.AIRTEL]: ["airtel", "bharti airtel"],
  [MERCHANTS.JIO]: ["jio", "reliance jio", "jio recharge"],
  [MERCHANTS.BLINKIT]: ["blinkit", "grofers"],
  [MERCHANTS.ZEPTO]: ["zepto"],
  [MERCHANTS.BIGBASKET]: ["bigbasket", "big basket"],
  [MERCHANTS.DUNZO]: ["dunzo"],
  [MERCHANTS.NYKAA]: ["nykaa"],
  [MERCHANTS.AJIO]: ["ajio"],
  [MERCHANTS.MEESHO]: ["meesho"],
  [MERCHANTS.BOOK_MY_SHOW]: ["bookmyshow", "book my show", "bms"],
  [MERCHANTS.IRCTC]: ["irctc", "indian railway"],
  [MERCHANTS.DOMINOS]: ["dominos", "domino's", "domino pizza"],
  [MERCHANTS.MCDONALD]: ["mcdonald", "mcdonalds", "mcd"],
  [MERCHANTS.KFC]: ["kfc", "kentucky"],
  [MERCHANTS.STARBUCKS]: ["starbucks", "sbux"],
  [MERCHANTS.PHARMACY]: ["pharmacy", "medical store", "chemist"],
  [MERCHANTS.APOLLO]: ["apollo", "apollo pharmacy"],
  [MERCHANTS.MEDPLUS]: ["medplus", "med plus"],
  [MERCHANTS.PHARMEASY]: ["pharmeasy", "pharm easy"],
  [MERCHANTS.ONEMD]: ["1mg", "onemg"],
  [MERCHANTS.DMART]: ["dmart", "d mart", "avenue supermarts"],
  [MERCHANTS.RELIANCE]: ["reliance retail", "reliance fresh", "reliance mart"],
};

export function detectMerchant(description) {
  if (!description || typeof description !== "string") {
    return MERCHANTS.OTHERS;
  }

  const descLower = description.toLowerCase().trim();

  for (const [merchant, patterns] of Object.entries(MERCHANT_PATTERNS)) {
    for (const pattern of patterns) {
      if (descLower.includes(pattern.toLowerCase())) {
        return merchant;
      }
    }
  }

  return MERCHANTS.OTHERS;
}

export function getMerchantList() {
  return Object.values(MERCHANTS)
    .filter((m) => m !== MERCHANTS.OTHERS)
    .sort();
}

export function getMerchantEmoji(merchant) {
  const emojiMap = {
    [MERCHANTS.AMAZON]: "📦",
    [MERCHANTS.FLIPKART]: "🛒",
    [MERCHANTS.MYNTRA]: "👗",
    [MERCHANTS.SWIGGY]: "🍽️",
    [MERCHANTS.SWIGGY_INSTAMART]: "🛍️",
    [MERCHANTS.ZOMATO]: "🍔",
    [MERCHANTS.UBER]: "🚗",
    [MERCHANTS.OLA]: "🚕",
    [MERCHANTS.NETFLIX]: "🎬",
    [MERCHANTS.AMAZON_PRIME]: "📺",
    [MERCHANTS.SPOTIFY]: "🎵",
    [MERCHANTS.PAYTM]: "💰",
    [MERCHANTS.GOOGLE_PAY]: "💳",
    [MERCHANTS.PHONEPE]: "📱",
    [MERCHANTS.AIRTEL]: "📡",
    [MERCHANTS.JIO]: "📶",
    [MERCHANTS.BLINKIT]: "⚡",
    [MERCHANTS.ZEPTO]: "🏃",
    [MERCHANTS.BIGBASKET]: "🥬",
    [MERCHANTS.DUNZO]: "🛵",
    [MERCHANTS.NYKAA]: "💄",
    [MERCHANTS.AJIO]: "👔",
    [MERCHANTS.MEESHO]: "🛍️",
    [MERCHANTS.BOOK_MY_SHOW]: "🎟️",
    [MERCHANTS.IRCTC]: "🚄",
    [MERCHANTS.DOMINOS]: "🍕",
    [MERCHANTS.MCDONALD]: "🍟",
    [MERCHANTS.KFC]: "🍗",
    [MERCHANTS.STARBUCKS]: "☕",
    [MERCHANTS.PHARMACY]: "💊",
    [MERCHANTS.APOLLO]: "⚕️",
    [MERCHANTS.MEDPLUS]: "🏥",
    [MERCHANTS.PHARMEASY]: "💊",
    [MERCHANTS.ONEMD]: "💊",
    [MERCHANTS.DMART]: "🏬",
    [MERCHANTS.RELIANCE]: "🏪",
    [MERCHANTS.OTHERS]: "🏷️",
  };

  return emojiMap[merchant] || "🏷️";
}
