// OCR Service - handles bill image processing using Tesseract.js
// 100% FREE - No API key needed, runs entirely in browser!

import { createWorker } from "tesseract.js";

/**
 * Process bill image using Tesseract.js OCR (Free, no API required)
 * @param {string} base64Image - Base64 encoded image string (without data:image prefix)
 * @returns {Promise<Object>} Extracted data from bill
 */
export async function processBillImage(base64Image) {
  try {
    console.log("🔍 Starting OCR with Tesseract.js...");

    // Convert base64 to data URL
    const imageUrl = `data:image/jpeg;base64,${base64Image}`;

    // Create Tesseract worker
    const worker = await createWorker("eng", 1, {
      logger: (m) => {
        if (m.status === "recognizing text") {
          console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
        }
      },
    });

    // Perform OCR
    const {
      data: { text },
    } = await worker.recognize(imageUrl);

    // Terminate worker
    await worker.terminate();

    console.log("✅ OCR completed successfully");
    console.log("Extracted text:", text);

    // Parse the text to extract bill data
    const extractedData = parseReceiptText(text);

    return extractedData;
  } catch (error) {
    console.error("❌ Error processing image:", error);
    throw error;
  }
}

// Helper function to parse receipt text and extract relevant information
function parseReceiptText(text) {
  const result = {
    rawText: text,
  };

  // Split text into lines
  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  // Extract data using regex patterns
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineUpper = line.toUpperCase();

    // === DATE EXTRACTION ===
    if (!result.date) {
      const dateMatch = line.match(
        /(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{2,4})|(\d{4})[/\-.](\d{1,2})[/\-.](\d{1,2})/
      );
      if (dateMatch) {
        if (dateMatch[1]) {
          const day = dateMatch[1].padStart(2, "0");
          const month = dateMatch[2].padStart(2, "0");
          let year = dateMatch[3];
          if (year.length === 2) year = "20" + year;
          result.date = `${year}-${month}-${day}`;
        } else {
          result.date = `${dateMatch[4]}-${dateMatch[5].padStart(2, "0")}-${dateMatch[6].padStart(2, "0")}`;
        }
      }
    }

    // === TIME EXTRACTION ===
    if (!result.time) {
      const timeMatch = line.match(/(\d{1,2}):(\d{2})(?::(\d{2}))?/);
      if (timeMatch) {
        const hours = timeMatch[1].padStart(2, "0");
        const minutes = timeMatch[2];
        result.time = `${hours}:${minutes}`;
      }
    }

    // === AMOUNT EXTRACTION ===
    if (!result.amount) {
      const amountPatterns = [
        /Amount\s*\(INR\)\s*:\s*(\d+\.?\s?\d*)/i, // Amount (INR): 1266. 28
        /Amount\s*\(INR\)\s*:?\s*(\d+\.\d{2})/i, // Amount (INR): 1266.28
        /(?:Total|Amount|Grand\s*Total|Net\s*Amount)\s*:?\s*(?:Rs\.?|₹)?\s*(\d+(?:\.\d{1,2})?)/i,
        /(?:Rs\.?|₹)\s*(\d+(?:\.\d{1,2})?)\s*(?:Total|Amount|Net)/i,
        /Amount.*?(\d+\.\s?\d{2})/i, // Amount: 1266. 28
        /\|\s*Amount.*?:\s*(\d+\.?\s?\d+)/i, // | Amount (INR): 1266. 28
      ];

      for (const pattern of amountPatterns) {
        const match = line.match(pattern);
        if (match) {
          // Remove spaces from the extracted amount
          result.amount = match[1].replace(/\s+/g, "");
          break;
        }
      }
    }

    // === FUEL VOLUME EXTRACTION ===
    if (!result.fuelVolume) {
      const volumePatterns = [
        /Volume\s*:\s*(\d+\.?\s?\d*)\s*(?:L|Litres?)/i, // Volume: 11. 90L
        /Volume\s*:\s*(\d+\.\d{2})\s*L/i, // Volume: 11.90L
        /(?:Quantity|Volume|Qty|Sale)\s*:?\s*(\d+(?:\.\d{1,3})?)\s*(?:Litres?|Ltrs?|L|Liter)/i,
        /(\d+\.?\s?\d+)\s*(?:Litres?|Ltrs?|L(?:\s|$))/i, // 11. 90L or 11.90L
      ];

      for (const pattern of volumePatterns) {
        const match = line.match(pattern);
        if (match) {
          // Remove spaces from the extracted volume
          result.fuelVolume = match[1].replace(/\s+/g, "");
          break;
        }
      }
    }

    // === PRICE PER LITER ===
    if (!result.pricePerLiter) {
      const pricePatterns = [
        /Unit\s*price(?:\(INR\))?\s*:\s*(\d+\.?\s?\d*)/i, // Unit price(INR): 106. 41
        /Unit\s*price.*?:\s*(\d+\.\d{2})/i, // Unit price: 106.41
        /(?:Rate|Price|Per\s*Liter?|Per\s*Ltr|Unit\s*Price)\s*:?\s*(?:Rs\.?|₹)?\s*(\d+(?:\.\d{1,2})?)/i,
        /(?:Rs\.?|₹)\s*(\d+(?:\.\d{1,2})?)\s*(?:\/|per)\s*(?:Liter|Ltr|L)/i,
      ];

      for (const pattern of pricePatterns) {
        const match = line.match(pattern);
        if (match) {
          // Remove spaces from the extracted price
          result.pricePerLiter = match[1].replace(/\s+/g, "");
          break;
        }
      }
    }

    // === FUEL TYPE DETECTION ===
    if (!result.fuelType) {
      if (/PETROL|MS\b|XP\s*95|PREMIUM|SPEED/i.test(lineUpper))
        result.fuelType = "Petrol";
      else if (/DIESEL|HSD|POWER/i.test(lineUpper)) result.fuelType = "Diesel";
      else if (/CNG|GAS/i.test(lineUpper)) result.fuelType = "CNG";
      else if (/ULP/i.test(lineUpper)) result.fuelType = "Petrol"; // Unleaded Petrol
    }

    // === PUMP NUMBER ===
    if (!result.pumpNumber) {
      const pumpPatterns = [
        /Pump\s*No\s*:\s*(\d+)/i, // Pump No: 4
        /Pump\s*:\s*(\d+)/i, // Pump: 4
        /Nozzle.*?:\s*(\d+)/i,
        /MPD.*?:\s*(\d+)/i,
      ];

      for (const pattern of pumpPatterns) {
        const match = line.match(pattern);
        if (match) {
          result.pumpNumber = match[1].trim();
          break;
        }
      }
    }

    // === INVOICE NUMBER ===
    if (!result.invoiceNumber) {
      const invoicePatterns = [
        /^([A-Z0-9]{10,})$/i, // Line with just alphanumeric code (e.g., 29AFPPN3621P1Z20Q)
        /Invoice.*?:\s*([A-Z0-9\-/]{5,})/i,
        /Bill.*?:\s*([A-Z0-9\-/]{5,})/i,
        /Receipt.*?:\s*([A-Z0-9\-/]{5,})/i,
        /Txn.*?:\s*([A-Z0-9\-/]{5,})/i,
      ];

      for (const pattern of invoicePatterns) {
        const match = line.match(pattern);
        if (match && match[1].length >= 10) {
          // At least 10 characters for invoice
          result.invoiceNumber = match[1].trim();
          break;
        }
      }
    }

    // === GRADE/FUEL GRADE ===
    if (!result.fuelGrade) {
      const gradeMatch = line.match(/Grade\s*:\s*([A-Z0-9]+)/i);
      if (gradeMatch) {
        result.fuelGrade = gradeMatch[1].trim();
      }
    }

    // === STATION NAME ===
    if (!result.stationName && i < 10) {
      // First check for known companies
      const companies = [
        "INDIAN OIL",
        "IOCL",
        "IOC",
        "BPCL",
        "BHARAT PETROLEUM",
        "BP",
        "HPCL",
        "HINDUSTAN PETROLEUM",
        "HP",
        "SHELL",
        "ESSAR",
        "RELIANCE",
        "NAYARA",
        "SS ENTERPRISES",
      ];
      for (const company of companies) {
        if (lineUpper.includes(company)) {
          result.stationName = line.replace(/^gy\s+/i, "").trim(); // Remove "gy" prefix if present
          break;
        }
      }

      // If not found by company name, look for "ENTERPRISES" or similar business suffixes
      if (
        !result.stationName &&
        /(?:ENTERPRISES|PETROLEUM|FUELS?|ENERGY|SERVICE)/i.test(line)
      ) {
        result.stationName = line.replace(/^gy\s+/i, "").trim();
      }
    }

    // === STATION ADDRESS ===
    // Look for address patterns in the first 15 lines
    if (!result.stationAddress && i > 0 && i < 15) {
      // Address often contains: Road, Street, Area, City names, PIN codes
      if (
        /(?:road|street|avenue|colony|nagar|pura|pur|ganj|market|circle|cross|pin|area)/i.test(
          lineUpper
        )
      ) {
        if (!result.stationAddress) {
          result.stationAddress = line;
        } else {
          result.stationAddress += ", " + line;
        }
      }
      // Also capture lines with PIN codes
      else if (/\d{6}/.test(line)) {
        if (!result.stationAddress) {
          result.stationAddress = line;
        } else if (!result.stationAddress.includes(line)) {
          result.stationAddress += ", " + line;
        }
      }
    }
  }

  // === SMART INFERENCE ===
  if (!result.date) {
    const today = new Date();
    result.date = today.toISOString().split("T")[0];
  }

  // Calculate price per liter if missing
  if (!result.pricePerLiter && result.amount && result.fuelVolume) {
    const amount = parseFloat(result.amount);
    const volume = parseFloat(result.fuelVolume);
    if (amount > 0 && volume > 0) {
      result.pricePerLiter = (amount / volume).toFixed(2);
    }
  }

  // Calculate amount if missing
  if (!result.amount && result.pricePerLiter && result.fuelVolume) {
    const price = parseFloat(result.pricePerLiter);
    const volume = parseFloat(result.fuelVolume);
    if (price > 0 && volume > 0) {
      result.amount = (price * volume).toFixed(2);
    }
  }

  // Remove empty values
  const cleanedResult = {};
  for (const [key, value] of Object.entries(result)) {
    if (value !== "" && value !== null && value !== undefined) {
      cleanedResult[key] = value;
    }
  }

  return cleanedResult;
}
