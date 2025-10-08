import { detectMerchant } from "./merchantDetector";
import {
  isCreditCardPayment,
  extractCreditCardInfo,
} from "./creditCardDetector";
import { detectCategoryFromDescription } from "./categoryMappingService";

const DATE_PATTERNS = {
  SLASH: /(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})/,
  REVERSE: /(\d{2,4})[/-](\d{1,2})[/-](\d{1,2})/,
  TEXT: /(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{2,4})/i,
  ISO: /(\d{4})-(\d{2})-(\d{2})/,
};

const AMOUNT_INDICATORS = {
  CREDIT: [
    "credit",
    "cr",
    "deposit",
    "credit amt",
    "credit amount",
    "deposits",
  ],
  DEBIT: [
    "debit",
    "dr",
    "withdrawal",
    "withdrawals",
    "debit amt",
    "debit amount",
  ],
  AMOUNT: ["amount", "transaction amount", "txn amount", "value"],
};

const DATE_COLUMN_NAMES = [
  "date",
  "transaction date",
  "txn date",
  "posting date",
  "value date",
  "trans date",
  "tran date",
];

const DESCRIPTION_COLUMN_NAMES = [
  "description",
  "narration",
  "particulars",
  "details",
  "remarks",
  "transaction details",
  "txn details",
  "merchant",
  "payee",
];

function normalizeDate(dateValue) {
  if (!dateValue) return null;

  if (dateValue instanceof Date) {
    return isNaN(dateValue.getTime()) ? null : dateValue;
  }

  const dateStr = String(dateValue).trim();

  if (!dateStr) return null;

  try {
    if (dateStr.includes("/") || dateStr.includes("-")) {
      const isoMatch = dateStr.match(DATE_PATTERNS.ISO);
      if (isoMatch) {
        const date = new Date(dateStr);
        return isNaN(date.getTime()) ? null : date;
      }

      const slashMatch = dateStr.match(DATE_PATTERNS.SLASH);
      if (slashMatch) {
        const day = slashMatch[1];
        const month = slashMatch[2];
        let year = slashMatch[3];

        if (year.length === 2) {
          year = parseInt(year) > 50 ? `19${year}` : `20${year}`;
        }

        const date = new Date(year, parseInt(month) - 1, parseInt(day));
        return isNaN(date.getTime()) ? null : date;
      }

      const reverseMatch = dateStr.match(DATE_PATTERNS.REVERSE);
      if (reverseMatch) {
        let year = reverseMatch[1];
        const month = reverseMatch[2];
        const day = reverseMatch[3];

        if (year.length === 2) {
          year = parseInt(year) > 50 ? `19${year}` : `20${year}`;
        }

        const date = new Date(year, parseInt(month) - 1, parseInt(day));
        return isNaN(date.getTime()) ? null : date;
      }
    }

    const textMatch = dateStr.match(DATE_PATTERNS.TEXT);
    if (textMatch) {
      const day = textMatch[1];
      const monthStr = textMatch[2];
      const year = textMatch[3];
      const monthMap = {
        jan: 0,
        feb: 1,
        mar: 2,
        apr: 3,
        may: 4,
        jun: 5,
        jul: 6,
        aug: 7,
        sep: 8,
        oct: 9,
        nov: 10,
        dec: 11,
      };
      const month = monthMap[monthStr.toLowerCase()];
      const fullYear =
        year.length === 2
          ? parseInt(year) > 50
            ? `19${year}`
            : `20${year}`
          : year;

      const date = new Date(fullYear, month, parseInt(day));
      return isNaN(date.getTime()) ? null : date;
    }

    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? null : date;
  } catch (_e) {
    return null;
  }
}

function normalizeAmount(amountValue) {
  if (amountValue === null || amountValue === undefined || amountValue === "") {
    return null;
  }

  if (typeof amountValue === "number") {
    return amountValue;
  }

  const amountStr = String(amountValue).trim();

  if (!amountStr) return null;

  const cleanAmount = amountStr
    .replace(/[₹$€£,\s]/g, "")
    .replace(/\((.*)\)/, "-$1")
    .trim();

  const amount = parseFloat(cleanAmount);

  return isNaN(amount) ? null : amount;
}

function detectTransactionType(row, headers, amount) {
  if (amount === null) return "unknown";

  const columnNameLower = headers.map((h) => String(h).toLowerCase());

  const hasCreditColumn = columnNameLower.some((name) =>
    AMOUNT_INDICATORS.CREDIT.some((indicator) => name.includes(indicator))
  );
  const hasDebitColumn = columnNameLower.some((name) =>
    AMOUNT_INDICATORS.DEBIT.some((indicator) => name.includes(indicator))
  );

  if (hasCreditColumn && hasDebitColumn) {
    const creditIndex = headers.findIndex(
      (h, i) =>
        AMOUNT_INDICATORS.CREDIT.some((indicator) =>
          String(h).toLowerCase().includes(indicator)
        ) &&
        row[i] &&
        String(row[i]).trim() !== ""
    );

    const debitIndex = headers.findIndex(
      (h, i) =>
        AMOUNT_INDICATORS.DEBIT.some((indicator) =>
          String(h).toLowerCase().includes(indicator)
        ) &&
        row[i] &&
        String(row[i]).trim() !== ""
    );

    if (creditIndex >= 0 && row[creditIndex]) {
      return "credit";
    } else if (debitIndex >= 0 && row[debitIndex]) {
      return "debit";
    }
  }

  return amount >= 0 ? "credit" : "debit";
}

function findColumnIndex(headers, columnNames) {
  return headers.findIndex((header) =>
    columnNames.some((col) =>
      String(header).toLowerCase().includes(col.toLowerCase())
    )
  );
}

function extractAmountFromRow(row, headers) {
  const creditIndex = headers.findIndex((h) =>
    AMOUNT_INDICATORS.CREDIT.some((indicator) =>
      String(h).toLowerCase().includes(indicator)
    )
  );

  const debitIndex = headers.findIndex((h) =>
    AMOUNT_INDICATORS.DEBIT.some((indicator) =>
      String(h).toLowerCase().includes(indicator)
    )
  );

  const amountIndex = headers.findIndex((h) =>
    AMOUNT_INDICATORS.AMOUNT.some((indicator) =>
      String(h).toLowerCase().includes(indicator)
    )
  );

  let amount = null;

  if (creditIndex >= 0 && row[creditIndex]) {
    const creditAmount = normalizeAmount(row[creditIndex]);
    if (creditAmount !== null && creditAmount !== 0) {
      amount = Math.abs(creditAmount);
    }
  }

  if (debitIndex >= 0 && row[debitIndex]) {
    const debitAmount = normalizeAmount(row[debitIndex]);
    if (debitAmount !== null && debitAmount !== 0) {
      amount = -Math.abs(debitAmount);
    }
  }

  if (amount === null && amountIndex >= 0) {
    amount = normalizeAmount(row[amountIndex]);
  }

  return { amount };
}

export function normalizeTransaction(rawTransaction, headers = []) {
  const normalized = {
    date: null,
    description: null,
    amount: null,
    type: "unknown",
    category: "Others",
    merchant: "Others",
    tags: [],
    isCreditCardPayment: false,
    creditCardInfo: null,
    linkedCreditCardTransactions: [],
    originalData: {},
  };

  if (Array.isArray(rawTransaction)) {
    const dateIndex = findColumnIndex(headers, DATE_COLUMN_NAMES);
    const descIndex = findColumnIndex(headers, DESCRIPTION_COLUMN_NAMES);

    normalized.date =
      dateIndex >= 0 ? normalizeDate(rawTransaction[dateIndex]) : null;

    normalized.description =
      descIndex >= 0 ? String(rawTransaction[descIndex] || "").trim() : null;

    const { amount } = extractAmountFromRow(rawTransaction, headers);
    normalized.amount = amount;

    normalized.type = detectTransactionType(rawTransaction, headers, amount);

    headers.forEach((header, index) => {
      if (
        rawTransaction[index] !== null &&
        rawTransaction[index] !== undefined
      ) {
        const key = String(header).trim().toLowerCase().replace(/\s+/g, "_");
        normalized.originalData[key] = rawTransaction[index];
      }
    });
  } else if (typeof rawTransaction === "object") {
    const dateField = Object.keys(rawTransaction).find((key) =>
      DATE_COLUMN_NAMES.some((col) => key.toLowerCase().includes(col))
    );

    const descField = Object.keys(rawTransaction).find((key) =>
      DESCRIPTION_COLUMN_NAMES.some((col) => key.toLowerCase().includes(col))
    );

    normalized.date = dateField
      ? normalizeDate(rawTransaction[dateField])
      : null;
    normalized.description = descField
      ? String(rawTransaction[descField] || "").trim()
      : null;

    const creditField = Object.keys(rawTransaction).find((key) =>
      AMOUNT_INDICATORS.CREDIT.some((indicator) =>
        key.toLowerCase().includes(indicator)
      )
    );

    const debitField = Object.keys(rawTransaction).find((key) =>
      AMOUNT_INDICATORS.DEBIT.some((indicator) =>
        key.toLowerCase().includes(indicator)
      )
    );

    const amountField = Object.keys(rawTransaction).find((key) =>
      AMOUNT_INDICATORS.AMOUNT.some((indicator) =>
        key.toLowerCase().includes(indicator)
      )
    );

    if (creditField && rawTransaction[creditField]) {
      const creditAmount = normalizeAmount(rawTransaction[creditField]);
      if (creditAmount !== null && creditAmount !== 0) {
        normalized.amount = Math.abs(creditAmount);
        normalized.type = "credit";
      }
    }

    if (debitField && rawTransaction[debitField]) {
      const debitAmount = normalizeAmount(rawTransaction[debitField]);
      if (debitAmount !== null && debitAmount !== 0) {
        normalized.amount = -Math.abs(debitAmount);
        normalized.type = "debit";
      }
    }

    if (normalized.amount === null && amountField) {
      normalized.amount = normalizeAmount(rawTransaction[amountField]);
      normalized.type = normalized.amount >= 0 ? "credit" : "debit";
    }

    Object.keys(rawTransaction).forEach((key) => {
      if (rawTransaction[key] !== null && rawTransaction[key] !== undefined) {
        normalized.originalData[key] = rawTransaction[key];
      }
    });
  }

  if (normalized.description) {
    const detectedCategory = detectCategoryFromDescription(
      normalized.description,
      normalized.amount
    );
    normalized.category = detectedCategory || "Others";
    normalized.merchant = detectMerchant(normalized.description);

    if (isCreditCardPayment(normalized.description)) {
      normalized.isCreditCardPayment = true;
      normalized.creditCardInfo = extractCreditCardInfo(normalized.description);
      normalized.category = "Credit Card Bills";
    }
  }

  return normalized;
}

export function normalizeBatch(transactions, headers = []) {
  return transactions
    .map((txn) => normalizeTransaction(txn, headers))
    .filter(
      (txn) =>
        txn.date !== null || txn.description !== null || txn.amount !== null
    );
}

export function validateNormalizedTransaction(transaction) {
  const errors = [];
  const warnings = [];

  if (!transaction.date || isNaN(new Date(transaction.date).getTime())) {
    errors.push("Missing or invalid date");
  }

  if (
    !transaction.description ||
    transaction.description.trim() === "" ||
    transaction.description.includes("*****")
  ) {
    errors.push("Missing or invalid description");
  }

  if (
    transaction.amount === null ||
    transaction.amount === undefined ||
    isNaN(transaction.amount) ||
    transaction.amount === 0
  ) {
    errors.push("Missing, invalid, or zero amount");
  }

  if (transaction.category === "Others") {
    warnings.push("Category not detected - will be set as Others");
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}
