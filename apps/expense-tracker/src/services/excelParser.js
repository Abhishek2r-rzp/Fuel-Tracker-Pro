import * as XLSX from "xlsx";
import {
  normalizeBatch,
  validateNormalizedTransaction,
} from "./transactionNormalizer";

/**
 * Parse Excel file (XLS, XLSX)
 * @param {File} file - Excel file
 * @returns {Promise<{sheets: object, data: Array}>}
 */
export async function parseExcel(file) {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: "array" });

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
  } catch (_error) {
    console._error("Excel parsing _error:", _error);
    throw new Error(`Failed to parse Excel: ${_error.message}`);
  }
}

/**
 * Extract transactions from Excel data
 * @param {Array} data - Excel data rows
 * @returns {Array<object>} - Array of transactions
 */
export function extractTransactionsFromExcel(data) {
  const filteredData = data.filter((row) => row && row.length > 0);

  console.log("📊 Excel filtered data rows:", filteredData.length);

  if (filteredData.length === 0) {
    return {
      transactions: [],
      requiresManualReview: true,
      message: "No data found in Excel file",
    };
  }

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

  if (headerRowIndex === -1 || bestMatchScore === 0) {
    console.log("⚠️ Could not find header row");
    return {
      transactions: [],
      requiresManualReview: true,
      message:
        "Could not find transaction columns. Please check if this is a bank statement.",
    };
  }

  const headers = filteredData[headerRowIndex];
  const dataRows = filteredData.slice(headerRowIndex + 1);

  console.log("📋 Excel headers:", headers);
  console.log("📊 Excel data rows:", dataRows.length);
  console.log("📄 First 3 data rows:", dataRows.slice(0, 3));

  const normalizedTransactions = normalizeBatch(dataRows, headers);

  console.log("✅ Normalized transactions:", normalizedTransactions.length);
  console.log("📄 Sample normalized:", normalizedTransactions.slice(0, 3));

  const validatedTransactions = normalizedTransactions.map((txn, index) => {
    const validation = validateNormalizedTransaction(txn);
    return {
      ...txn,
      id: `excel-${index}`,
      validation,
    };
  });

  const validTransactions = validatedTransactions.filter(
    (txn) => txn.validation.isValid
  );
  const invalidTransactions = validatedTransactions.filter(
    (txn) => !txn.validation.isValid
  );

  console.log("✅ Valid transactions:", validTransactions.length);
  console.log("⚠️ Invalid transactions:", invalidTransactions.length);

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
