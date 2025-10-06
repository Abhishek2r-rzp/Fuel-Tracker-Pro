/**
 * File Processor Service
 * Coordinates all file parsers (PDF, Excel, CSV)
 */

import { parsePDF } from './pdfParser';
import { parseExcel, extractTransactionsFromExcel } from './excelParser';
import { parseCSVWithHeaders, extractTransactionsFromCSV } from './csvParser';

export async function processFile(file) {
  const fileType = file.type;
  const fileName = file.name.toLowerCase();

  try {
    // PDF
    if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
      console.log('📄 Processing PDF file:', file.name);
      const result = await parsePDF(file);
      console.log('✅ PDF parsed successfully:', result);
      
      // For now, return empty transactions array as we need bank-specific parsing
      return {
        type: 'pdf',
        fileName: file.name,
        size: file.size,
        pages: result.pages,
        text: result.text,
        transactions: [], // Will be populated with bank-specific parsing
        requiresManualReview: true,
        message: 'PDF parsed successfully. Bank-specific transaction extraction coming soon.',
      };
    }

    // Excel (XLSX, XLS)
    if (
      fileType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
      fileType === 'application/vnd.ms-excel' ||
      fileName.endsWith('.xlsx') ||
      fileName.endsWith('.xls')
    ) {
      const result = await parseExcel(file);
      const extracted = extractTransactionsFromExcel(result.allData);
      return {
        type: 'excel',
        fileName: file.name,
        size: file.size,
        ...result,
        ...extracted,
      };
    }

    // CSV
    if (fileType === 'text/csv' || fileName.endsWith('.csv')) {
      const result = await parseCSVWithHeaders(file);
      const extracted = extractTransactionsFromCSV(result.data, result.fields);
      return {
        type: 'csv',
        fileName: file.name,
        size: file.size,
        ...result,
        ...extracted,
      };
    }

    throw new Error('Unsupported file type');
  } catch (error) {
    console.error('File processing error:', error);
    throw error;
  }
}

