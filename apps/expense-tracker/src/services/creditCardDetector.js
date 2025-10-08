const CREDIT_CARD_PAYMENT_PATTERNS = [
  "credit card",
  "cc payment",
  "card payment",
  "creditcard",
  "hdfc cc",
  "icici cc",
  "sbi cc",
  "axis cc",
  "hdfc credit card",
  "icici credit card",
  "sbi credit card",
  "axis credit card",
  "kotak credit card",
  "american express",
  "amex",
  "visa payment",
  "mastercard payment",
  "rupay payment",
  "cc bill payment",
  "credit card bill",
  "cc bill",
];

const BANK_NAMES = [
  "hdfc",
  "icici",
  "sbi",
  "axis",
  "kotak",
  "yes bank",
  "indusind",
  "standard chartered",
  "hsbc",
  "citibank",
  "american express",
  "idfc",
  "rbl",
  "au small finance",
  "bandhan",
];

export function isCreditCardPayment(description) {
  if (!description || typeof description !== "string") {
    return false;
  }

  const descLower = description.toLowerCase().trim();

  for (const pattern of CREDIT_CARD_PAYMENT_PATTERNS) {
    if (descLower.includes(pattern)) {
      return true;
    }
  }

  return false;
}

export function extractCreditCardInfo(description) {
  if (!description) {
    return {
      bank: "Unknown",
      cardType: "Credit Card",
      last4: null,
    };
  }

  const descLower = description.toLowerCase();
  let bank = "Unknown";
  let last4 = null;

  for (const bankName of BANK_NAMES) {
    if (descLower.includes(bankName)) {
      bank = bankName
        .split(" ")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");
      break;
    }
  }

  const last4Match = description.match(/\d{4}(?!\d)/);
  if (last4Match) {
    last4 = last4Match[0];
  }

  return {
    bank,
    cardType: "Credit Card",
    last4,
    displayName: last4
      ? `${bank} Credit Card (*${last4})`
      : `${bank} Credit Card`,
  };
}

export function getCreditCardEmoji(bank) {
  const bankLower = bank.toLowerCase();
  const emojiMap = {
    hdfc: "🏦",
    icici: "🏦",
    sbi: "🏦",
    axis: "💳",
    kotak: "💳",
    "yes bank": "💳",
    indusind: "💳",
    "american express": "💎",
    amex: "💎",
    citibank: "🏧",
    hsbc: "🏧",
    "standard chartered": "🏧",
  };

  for (const [key, emoji] of Object.entries(emojiMap)) {
    if (bankLower.includes(key)) {
      return emoji;
    }
  }

  return "💳";
}
