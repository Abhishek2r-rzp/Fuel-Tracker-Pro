import Papa from "papaparse";
import {
  normalizeBatch,
  validateNormalizedTransaction,
} from "./transactionNormalizer";

/**
 * Parse CSV file
 * @param {File} file - CSV file
 * @returns {Promise<{data: Array, meta: object}>}
 */
export async function parseCSV(file) {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      complete: (results) => {
        resolve({
          data: results.data,
          meta: results.meta,
          errors: results.errors,
          success: true,
        });
      },
      _error: (_error) => {
        console._error("CSV parsing _error:", _error);
        reject(new Error(`Failed to parse CSV: ${_error.message}`));
      },
      header: false,
      skipEmptyLines: true,
      dynamicTyping: true,
    });
  });
}

/**
 * Parse CSV with headers
 * @param {File} file - CSV file
 * @returns {Promise<{data: Array, fields: Array}>}
 */
export async function parseCSVWithHeaders(file) {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      complete: (results) => {
        resolve({
          data: results.data,
          fields: results.meta.fields,
          meta: results.meta,
          errors: results.errors,
          success: true,
        });
      },
      _error: (_error) => {
        console._error("CSV parsing _error:", _error);
        reject(new Error(`Failed to parse CSV: ${_error.message}`));
      },
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
    });
  });
}

/**
 * Extract transactions from CSV data
 * @param {Array} data - CSV data rows
 * @param {Array} fields - CSV field names (if header=true)
 * @returns {Array<object>} - Array of transactions
 */
export function extractTransactionsFromCSV(data, fields = null) {
  if (!data || data.length === 0) {
    return {
      transactions: [],
      requiresManualReview: true,
      message: "No data found in CSV file",
    };
  }

  let normalizedTransactions;
  let headers;

  if (fields && fields.length > 0) {
    headers = fields;
    const dataRows = data.map((row) => {
      return fields.map((field) => row[field]);
    });

    normalizedTransactions = normalizeBatch(dataRows, headers);
  } else {
    headers = data[0];
    const dataRows = data.slice(1);
    normalizedTransactions = normalizeBatch(dataRows, headers);
  }

  console.log("✅ Normalized CSV transactions:", normalizedTransactions.length);
  console.log("📄 Sample normalized:", normalizedTransactions.slice(0, 3));

  const validatedTransactions = normalizedTransactions.map((txn, index) => {
    const validation = validateNormalizedTransaction(txn);
    return {
      ...txn,
      id: `csv-${index}`,
      validation,
    };
  });

  const validTransactions = validatedTransactions.filter(
    (txn) => txn.validation.isValid
  );
  const invalidTransactions = validatedTransactions.filter(
    (txn) => !txn.validation.isValid
  );

  console.log("✅ Valid CSV transactions:", validTransactions.length);
  console.log("⚠️ Invalid CSV transactions:", invalidTransactions.length);

  return {
    headers,
    transactions: validTransactions,
    invalidTransactions,
    requiresManualReview: validTransactions.length === 0,
    message:
      validTransactions.length === 0
        ? "Could not extract valid transactions"
        : null,
  };
}
