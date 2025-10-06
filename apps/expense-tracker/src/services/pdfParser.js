/**
 * PDF Parser Service
 * Uses pdfjs-dist for client-side PDF parsing
 */

import * as pdfjsLib from 'pdfjs-dist';

// Set worker path for PDF.js
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

/**
 * Parse PDF file and extract text
 * @param {File} file - PDF file
 * @returns {Promise<{text: string, pages: number, metadata: object}>}
 */
export async function parsePDF(file) {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    
    const numPages = pdf.numPages;
    let fullText = '';
    const pageTexts = [];

    // Extract text from each page
    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      
      const pageText = textContent.items
        .map((item) => item.str)
        .join(' ');
      
      pageTexts.push(pageText);
      fullText += pageText + '\n';
    }

    // Get metadata
    const metadata = await pdf.getMetadata();

    return {
      text: fullText,
      pages: numPages,
      pageTexts,
      metadata: metadata.info,
      success: true,
    };
  } catch (error) {
    console.error('PDF parsing error:', error);
    throw new Error(`Failed to parse PDF: ${error.message}`);
  }
}

/**
 * Extract transactions from PDF text
 * @param {string} text - Extracted PDF text
 * @returns {Array<object>} - Array of transactions
 */
export function extractTransactionsFromPDF(text) {
  const transactions = [];
  
  // This will be enhanced with bank-specific patterns
  // For now, return raw text for manual processing
  return {
    rawText: text,
    transactions: [],
    requiresManualReview: true,
  };
}

