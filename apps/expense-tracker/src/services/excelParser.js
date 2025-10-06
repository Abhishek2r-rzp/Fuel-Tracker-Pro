/**
 * Excel Parser Service
 * Uses xlsx library for XLS/XLSX parsing
 */

import * as XLSX from 'xlsx';

/**
 * Parse Excel file (XLS, XLSX)
 * @param {File} file - Excel file
 * @returns {Promise<{sheets: object, data: Array}>}
 */
export async function parseExcel(file) {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });

    const sheets = {};
    const allData = [];

    // Parse each sheet
    workbook.SheetNames.forEach((sheetName) => {
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      
      sheets[sheetName] = {
        name: sheetName,
        data: jsonData,
        rowCount: jsonData.length,
        columnCount: jsonData[0]?.length || 0,
      };

      allData.push(...jsonData);
    });

    return {
      sheets,
      sheetNames: workbook.SheetNames,
      totalSheets: workbook.SheetNames.length,
      allData,
      success: true,
    };
  } catch (error) {
    console.error('Excel parsing error:', error);
    throw new Error(`Failed to parse Excel: ${error.message}`);
  }
}

/**
 * Extract transactions from Excel data
 * @param {Array} data - Excel data rows
 * @returns {Array<object>} - Array of transactions
 */
export function extractTransactionsFromExcel(data) {
  const transactions = [];
  
  // Skip empty rows
  const filteredData = data.filter((row) => row && row.length > 0);
  
  if (filteredData.length === 0) {
    return {
      transactions: [],
      requiresManualReview: true,
      message: 'No data found in Excel file',
    };
  }

  // Try to detect header row and data rows
  const headers = filteredData[0];
  const dataRows = filteredData.slice(1);

  // Look for common column names
  const dateColumns = ['date', 'transaction date', 'txn date', 'posting date'];
  const descColumns = ['description', 'narration', 'particulars', 'details'];
  const amountColumns = ['amount', 'debit', 'credit', 'withdrawal', 'deposit'];

  const dateIndex = headers.findIndex((h) =>
    dateColumns.some((col) => String(h).toLowerCase().includes(col))
  );
  const descIndex = headers.findIndex((h) =>
    descColumns.some((col) => String(h).toLowerCase().includes(col))
  );
  const amountIndex = headers.findIndex((h) =>
    amountColumns.some((col) => String(h).toLowerCase().includes(col))
  );

  // Extract transactions if columns found
  if (dateIndex >= 0 || descIndex >= 0 || amountIndex >= 0) {
    dataRows.forEach((row, index) => {
      if (row && row.length > 0) {
        const transaction = {
          id: `excel-${index}`,
          date: dateIndex >= 0 ? row[dateIndex] : null,
          description: descIndex >= 0 ? row[descIndex] : null,
          amount: amountIndex >= 0 ? parseFloat(String(row[amountIndex]).replace(/[^0-9.-]/g, '')) : null,
          rawData: row,
        };

        if (transaction.date || transaction.description || transaction.amount) {
          transactions.push(transaction);
        }
      }
    });
  }

  return {
    headers,
    transactions,
    requiresManualReview: transactions.length === 0,
    message: transactions.length === 0 ? 'Could not auto-detect transaction columns' : null,
  };
}

