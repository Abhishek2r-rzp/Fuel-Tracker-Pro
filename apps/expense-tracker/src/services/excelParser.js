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
  
  console.log("📊 Excel filtered data rows:", filteredData.length);

  if (filteredData.length === 0) {
    return {
      transactions: [],
      requiresManualReview: true,
      message: "No data found in Excel file",
    };
  }

  // Look for common column names
  const dateColumns = [
    "date",
    "transaction date",
    "txn date",
    "posting date",
    "value date",
  ];
  const descColumns = [
    "description",
    "narration",
    "particulars",
    "details",
    "remarks",
  ];
  const amountColumns = [
    "amount",
    "debit",
    "credit",
    "withdrawal",
    "deposit",
    "dr",
    "cr",
  ];

  // Smart header detection - find the row with the most matching column names
  let headerRowIndex = -1;
  let bestMatchScore = 0;

  for (let i = 0; i < Math.min(20, filteredData.length); i++) {
    const row = filteredData[i];
    let matchScore = 0;

    row.forEach((cell) => {
      const cellLower = String(cell).toLowerCase();
      if (dateColumns.some((col) => cellLower.includes(col))) matchScore++;
      if (descColumns.some((col) => cellLower.includes(col))) matchScore++;
      if (amountColumns.some((col) => cellLower.includes(col))) matchScore++;
    });

    if (matchScore > bestMatchScore) {
      bestMatchScore = matchScore;
      headerRowIndex = i;
    }
  }

  console.log(
    "🔍 Found header row at index:",
    headerRowIndex,
    "with score:",
    bestMatchScore
  );

  // If no header found, return error
  if (headerRowIndex === -1 || bestMatchScore === 0) {
    console.log("⚠️ Could not find header row");
    return {
      transactions: [],
      requiresManualReview: true,
      message:
        "Could not find transaction columns. Please check if this is a bank statement.",
    };
  }

  // Use detected header row
  const headers = filteredData[headerRowIndex];
  const dataRows = filteredData.slice(headerRowIndex + 1);
  
  console.log("📋 Excel headers:", headers);
  console.log("📊 Excel data rows:", dataRows.length);
  console.log("📄 First 3 data rows:", dataRows.slice(0, 3));

  const dateIndex = headers.findIndex((h) =>
    dateColumns.some((col) => String(h).toLowerCase().includes(col))
  );
  const descIndex = headers.findIndex((h) =>
    descColumns.some((col) => String(h).toLowerCase().includes(col))
  );
  const amountIndex = headers.findIndex((h) =>
    amountColumns.some((col) => String(h).toLowerCase().includes(col))
  );

  console.log("🔍 Column indices found:", {
    dateIndex,
    descIndex,
    amountIndex,
  });

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

