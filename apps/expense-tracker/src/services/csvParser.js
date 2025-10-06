/**
 * CSV Parser Service
 * Uses papaparse for CSV parsing
 */

import Papa from 'papaparse';

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
      error: (error) => {
        console.error('CSV parsing error:', error);
        reject(new Error(`Failed to parse CSV: ${error.message}`));
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
      error: (error) => {
        console.error('CSV parsing error:', error);
        reject(new Error(`Failed to parse CSV: ${error.message}`));
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
  const transactions = [];

  if (!data || data.length === 0) {
    return {
      transactions: [],
      requiresManualReview: true,
      message: 'No data found in CSV file',
    };
  }

  // If we have fields (header row), use them
  if (fields && fields.length > 0) {
    // Look for common column names
    const dateColumns = ['date', 'transaction date', 'txn date', 'posting date'];
    const descColumns = ['description', 'narration', 'particulars', 'details'];
    const amountColumns = ['amount', 'debit', 'credit', 'withdrawal', 'deposit'];

    const dateField = fields.find((f) =>
      dateColumns.some((col) => f.toLowerCase().includes(col))
    );
    const descField = fields.find((f) =>
      descColumns.some((col) => f.toLowerCase().includes(col))
    );
    const amountField = fields.find((f) =>
      amountColumns.some((col) => f.toLowerCase().includes(col))
    );

    data.forEach((row, index) => {
      const transaction = {
        id: `csv-${index}`,
        date: dateField ? row[dateField] : null,
        description: descField ? row[descField] : null,
        amount: amountField ? parseFloat(String(row[amountField]).replace(/[^0-9.-]/g, '')) : null,
        rawData: row,
      };

      if (transaction.date || transaction.description || transaction.amount) {
        transactions.push(transaction);
      }
    });
  } else {
    // No headers, try to detect columns by position
    // Assume first row might be headers
    const headers = data[0];
    const dataRows = data.slice(1);

    dataRows.forEach((row, index) => {
      if (row && row.length > 0) {
        transactions.push({
          id: `csv-${index}`,
          date: row[0] || null,
          description: row[1] || null,
          amount: row[2] ? parseFloat(String(row[2]).replace(/[^0-9.-]/g, '')) : null,
          rawData: row,
        });
      }
    });
  }

  return {
    headers: fields,
    transactions,
    requiresManualReview: transactions.length === 0,
    message: transactions.length === 0 ? 'Could not auto-detect transaction columns' : null,
  };
}

