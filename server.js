// Local development server for API endpoints
// This runs the serverless functions locally so you can test real OCR in development

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3001;

// API Ninjas configuration
const API_NINJAS_KEY = process.env.API_NINJAS_KEY || 'YOUR_API_KEY_HERE';
const API_NINJAS_URL = 'https://api.api-ninjas.com/v1/motorcycles';

// Cache for API responses (reduce API calls)
const apiCache = {
  makes: null,
  models: {},
  details: {},
  timestamp: {}
};

const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

// Helper functions to extract numbers from API strings
function extractNumber(str) {
  if (!str) return null;
  const match = str.match(/(\d+\.?\d*)/);
  return match ? match[1] : null;
}

function extractMileage(consumptionStr) {
  if (!consumptionStr) return null;
  // API returns "2.13 litres/100 km (46.9 km/l or 110.43 mpg)"
  // Extract the km/l value
  const kmplMatch = consumptionStr.match(/([\d.]+)\s*km\/l/i);
  if (kmplMatch) return kmplMatch[1];
  
  // Or calculate from litres/100km
  const litreMatch = consumptionStr.match(/([\d.]+)\s*litres\/100\s*km/i);
  if (litreMatch) {
    const litresPer100km = parseFloat(litreMatch[1]);
    return (100 / litresPer100km).toFixed(1);
  }
  
  return null;
}

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' })); // Increase limit for base64 images

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'API server running' });
});

// Get all bike makes (Popular Indian brands)
app.get('/api/bikes/makes', async (req, res) => {
  try {
    // Check cache
    if (apiCache.makes && apiCache.timestamp.makes && 
        (Date.now() - apiCache.timestamp.makes < CACHE_DURATION)) {
      console.log('✅ Returning cached makes');
      return res.json({ makes: apiCache.makes });
    }

    // Return popular Indian motorcycle brands
    const indianBrands = [
      'Bajaj',
      'Hero',
      'Honda',
      'Royal Enfield',
      'TVS',
      'Suzuki',
      'Yamaha',
      'KTM',
      'Kawasaki',
      'Harley-Davidson',
      'BMW',
      'Ducati',
      'Triumph',
      'Benelli',
      'Jawa',
      'Yezdi',
      'Aprilia',
      'Vespa',
      'Ather',
      'Ola Electric',
      'Revolt'
    ].sort();

    apiCache.makes = indianBrands;
    apiCache.timestamp.makes = Date.now();

    res.json({ makes: indianBrands });
  } catch (error) {
    console.error('Error getting bike makes:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get models for a specific make from API Ninjas
app.get('/api/bikes/models/:make', async (req, res) => {
  try {
    const { make } = req.params;
    
    // Check cache
    const cacheKey = make.toLowerCase();
    if (apiCache.models[cacheKey] && apiCache.timestamp[`models_${cacheKey}`] &&
        (Date.now() - apiCache.timestamp[`models_${cacheKey}`] < CACHE_DURATION)) {
      console.log(`✅ Returning cached models for ${make}`);
      return res.json({ make, models: apiCache.models[cacheKey] });
    }

    console.log(`🔍 Fetching models for ${make} from API Ninjas...`);

    // Call API Ninjas
    const response = await fetch(`${API_NINJAS_URL}?make=${encodeURIComponent(make)}`, {
      method: 'GET',
      headers: {
        'X-Api-Key': API_NINJAS_KEY
      }
    });

    if (!response.ok) {
      console.error(`API Ninjas error: ${response.status}`);
      return res.status(response.status).json({ error: 'Failed to fetch from API Ninjas' });
    }

    const data = await response.json();
    
    if (!Array.isArray(data) || data.length === 0) {
      console.log(`⚠️ No models found for ${make}`);
      return res.json({ make, models: [] });
    }

    // Transform API data to our format
    const models = data.map(bike => ({
      model: bike.model,
      year: bike.year,
      // Extract numeric values from strings
      engineCapacity: extractNumber(bike.displacement) || 'N/A',
      fuelCapacity: extractNumber(bike.fuel_capacity) || 'N/A',
      mileageStandard: extractMileage(bike.fuel_consumption) || 'N/A',
      fuelType: bike.type?.toLowerCase().includes('electric') ? 'Electric' : 'Petrol',
      // Additional specs
      horsepower: bike.power || 'N/A',
      torque: bike.torque || 'N/A',
      topSpeed: bike.top_speed || 'N/A',
      weight: bike.total_weight || 'N/A'
    }));

    // Remove duplicates by model name (keep most recent year)
    const uniqueModels = [];
    const seen = new Set();
    
    models.sort((a, b) => b.year - a.year); // Sort by year descending
    
    for (const model of models) {
      if (!seen.has(model.model)) {
        uniqueModels.push(model);
        seen.add(model.model);
      }
    }

    // Cache the results
    apiCache.models[cacheKey] = uniqueModels;
    apiCache.timestamp[`models_${cacheKey}`] = Date.now();

    console.log(`✅ Found ${uniqueModels.length} unique models for ${make}`);
    res.json({ make, models: uniqueModels });
    
  } catch (error) {
    console.error('Error getting bike models:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get details for a specific bike model from API Ninjas
app.get('/api/bikes/details/:make/:model', async (req, res) => {
  try {
    const { make, model } = req.params;
    
    // Check cache
    const cacheKey = `${make.toLowerCase()}_${model.toLowerCase()}`;
    if (apiCache.details[cacheKey] && apiCache.timestamp[`details_${cacheKey}`] &&
        (Date.now() - apiCache.timestamp[`details_${cacheKey}`] < CACHE_DURATION)) {
      console.log(`✅ Returning cached details for ${make} ${model}`);
      return res.json(apiCache.details[cacheKey]);
    }

    console.log(`🔍 Fetching details for ${make} ${model} from API Ninjas...`);

    // Call API Ninjas
    const response = await fetch(
      `${API_NINJAS_URL}?make=${encodeURIComponent(make)}&model=${encodeURIComponent(model)}`,
      {
        method: 'GET',
        headers: {
          'X-Api-Key': API_NINJAS_KEY
        }
      }
    );

    if (!response.ok) {
      console.error(`API Ninjas error: ${response.status}`);
      return res.status(response.status).json({ error: 'Failed to fetch from API Ninjas' });
    }

    const data = await response.json();
    
    if (!Array.isArray(data) || data.length === 0) {
      console.log(`⚠️ No details found for ${make} ${model}`);
      return res.status(404).json({ error: 'Model not found' });
    }

    // Use the most recent year
    const bike = data.sort((a, b) => b.year - a.year)[0];
    
    const details = {
      make,
      model: bike.model,
      year: bike.year,
      // Extract clean numeric values
      engineCapacity: extractNumber(bike.displacement) || 'N/A',
      fuelCapacity: extractNumber(bike.fuel_capacity) || 'N/A',
      mileageStandard: extractMileage(bike.fuel_consumption) || 'N/A',
      fuelType: bike.type?.toLowerCase().includes('electric') ? 'Electric' : 'Petrol',
      // Additional specifications
      horsepower: bike.power || 'N/A',
      torque: bike.torque || 'N/A',
      topSpeed: bike.top_speed || 'N/A',
      weight: bike.total_weight || 'N/A',
      transmission: bike.transmission || 'N/A',
      cooling: bike.cooling || 'N/A',
      gearbox: bike.gearbox || 'N/A',
      seatHeight: bike.seat_height || 'N/A',
      dryWeight: bike.dry_weight || 'N/A'
    };

    // Cache the results
    apiCache.details[cacheKey] = details;
    apiCache.timestamp[`details_${cacheKey}`] = Date.now();

    console.log(`✅ Found details for ${make} ${model}`);
    res.json(details);
    
  } catch (error) {
    console.error('Error getting bike details:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// OCR endpoint - imports and runs the serverless function logic
app.post('/api/ocr', async (req, res) => {
  try {
    const { image } = req.body;

    if (!image) {
      return res.status(400).json({ error: 'No image provided' });
    }

    // Call Google Cloud Vision API
    const apiKey = process.env.GOOGLE_CLOUD_VISION_API_KEY;
    
    if (!apiKey) {
      console.error('❌ Google Cloud Vision API key not configured in .env file');
      return res.status(500).json({ 
        error: 'OCR service not configured',
        message: 'Please add GOOGLE_CLOUD_VISION_API_KEY to your .env file'
      });
    }

    const visionApiUrl = `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`;

    const response = await fetch(visionApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        requests: [
          {
            image: {
              content: image,
            },
            features: [
              {
                type: 'TEXT_DETECTION',
                maxResults: 1,
              },
            ],
          },
        ],
      }),
    });

    const data = await response.json();

    if (data.error) {
      console.error('Vision API error:', data.error);
      return res.status(500).json({ error: 'OCR processing failed', details: data.error });
    }

    // Extract text from response
    const detectedText = data.responses[0]?.fullTextAnnotation?.text || '';

    if (!detectedText) {
      console.log('⚠️ No text detected in image');
      return res.status(200).json({
        date: new Date().toISOString().split('T')[0],
        rawText: ''
      });
    }

    console.log('✅ Text extracted from image');

    // Parse the text to extract fuel bill information
    const extractedData = parseReceiptText(detectedText);

    return res.status(200).json(extractedData);
  } catch (error) {
    console.error('OCR processing error:', error);
    return res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// Helper function to parse receipt text - Same as in api/ocr.js
function parseReceiptText(text) {
  const result = {
    rawText: text
  };

  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineUpper = line.toUpperCase();

    // Date extraction
    if (!result.date) {
      const dateMatch = line.match(/(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2,4})|(\d{4})[\/\-\.](\d{1,2})[\/\-\.](\d{1,2})/);
      if (dateMatch) {
        if (dateMatch[1]) {
          const day = dateMatch[1].padStart(2, '0');
          const month = dateMatch[2].padStart(2, '0');
          let year = dateMatch[3];
          if (year.length === 2) year = '20' + year;
          result.date = `${year}-${month}-${day}`;
        } else {
          result.date = `${dateMatch[4]}-${dateMatch[5].padStart(2, '0')}-${dateMatch[6].padStart(2, '0')}`;
        }
      }
    }

    // Time extraction
    if (!result.time) {
      const timeMatch = line.match(/(\d{1,2}):(\d{2})(?::(\d{2}))?/);
      if (timeMatch) {
        result.time = `${timeMatch[1].padStart(2, '0')}:${timeMatch[2]}`;
      }
    }

    // Amount extraction
    if (!result.amount) {
      const amountPatterns = [
        /(?:Total|Amount|Grand\s*Total|Net\s*Amount|Net\s*Total|Final\s*Amount|Bill\s*Amount)\s*:?\s*(?:Rs\.?|₹)?\s*(\d+(?:\.\d{1,2})?)/i,
        /(?:Rs\.?|₹)\s*(\d+(?:\.\d{1,2})?)\s*(?:Total|Amount|Net)/i,
      ];
      for (const pattern of amountPatterns) {
        const match = line.match(pattern);
        if (match) {
          result.amount = match[1];
          break;
        }
      }
    }

    // Fuel volume extraction
    if (!result.fuelVolume) {
      const volumePatterns = [
        /(?:Quantity|Volume|Qty|Sale)\s*:?\s*(\d+(?:\.\d{1,3})?)\s*(?:Litres?|Ltrs?|L|Liter)/i,
        /(\d+(?:\.\d{1,3})?)\s*(?:Litres?|Ltrs?|L(?:\s|$|i))/i,
      ];
      for (const pattern of volumePatterns) {
        const match = line.match(pattern);
        if (match) {
          result.fuelVolume = match[1];
          break;
        }
      }
    }

    // Price per liter
    if (!result.pricePerLiter) {
      const priceMatch = line.match(/(?:Rate|Price|Per\s*Liter?)\s*:?\s*(?:Rs\.?|₹)?\s*(\d+(?:\.\d{1,2})?)/i);
      if (priceMatch) {
        result.pricePerLiter = priceMatch[1];
      }
    }

    // Fuel type
    if (!result.fuelType) {
      if (/PETROL|MS\b|XP\s*95|PREMIUM|SPEED/i.test(lineUpper)) result.fuelType = 'Petrol';
      else if (/DIESEL|HSD|POWER/i.test(lineUpper)) result.fuelType = 'Diesel';
      else if (/CNG|GAS/i.test(lineUpper)) result.fuelType = 'CNG';
    }

    // Station name, invoice, pump number, odometer, etc.
    if (!result.invoiceNumber) {
      const invoiceMatch = line.match(/(?:Invoice|Bill|Receipt|Transaction|Txn|Ref)\s*(?:No|Number|#|ID)?:?\s*([A-Z0-9\-\/]{3,})/i);
      if (invoiceMatch) result.invoiceNumber = invoiceMatch[1];
    }

    if (!result.pumpNumber) {
      const pumpMatch = line.match(/(?:Pump|Nozzle|Machine|Dispenser|MPD)\s*(?:No|Number|#|:)?\s*(\d+)/i);
      if (pumpMatch) result.pumpNumber = pumpMatch[1];
    }

    if (!result.odometerReading) {
      const odometerMatch = line.match(/(?:Odometer|Kilometer|KM|Mileage|Reading)\s*:?\s*(\d+(?:,\d{3})*(?:\.\d+)?)/i);
      if (odometerMatch) result.odometerReading = odometerMatch[1].replace(/,/g, '');
    }

    if (!result.paymentMethod) {
      if (/CASH|COD/i.test(lineUpper)) result.paymentMethod = 'Cash';
      else if (/CARD|DEBIT|CREDIT|VISA|MASTER|RUPAY/i.test(lineUpper)) result.paymentMethod = 'Card';
      else if (/UPI|PAYTM|GPAY|PHONEPE|BHIM|DIGITAL/i.test(lineUpper)) result.paymentMethod = 'UPI';
    }
  }

  // Station name from first few lines
  if (!result.stationName && lines.length > 0) {
    const companies = ['INDIAN OIL', 'IOCL', 'BPCL', 'BHARAT PETROLEUM', 'HPCL', 'HINDUSTAN PETROLEUM', 'SHELL', 'ESSAR', 'RELIANCE', 'NAYARA', 'JIO-BP'];
    for (let i = 0; i < Math.min(8, lines.length); i++) {
      for (const company of companies) {
        if (lines[i].toUpperCase().includes(company)) {
          result.stationName = lines[i];
          break;
        }
      }
      if (result.stationName) break;
    }
    if (!result.stationName) {
      result.stationName = lines.find(l => l.length >= 5 && l.length <= 60 && !/^\d+$/.test(l)) || '';
    }
  }

  // Smart inference
  if (!result.date) {
    result.date = new Date().toISOString().split('T')[0];
  }

  if (!result.pricePerLiter && result.amount && result.fuelVolume) {
    const amount = parseFloat(result.amount);
    const volume = parseFloat(result.fuelVolume);
    if (amount > 0 && volume > 0) {
      result.pricePerLiter = (amount / volume).toFixed(2);
    }
  }

  // Remove empty values
  const cleanedResult = {};
  for (const [key, value] of Object.entries(result)) {
    if (value !== '' && value !== null && value !== undefined) {
      cleanedResult[key] = value;
    }
  }

  return cleanedResult;
}

// Start server
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════╗
║   🚀 API Server Running                ║
║   📍 http://localhost:${PORT}           ║
║   🔧 OCR Endpoint: /api/ocr            ║
╚════════════════════════════════════════╝

✅ Ready to process fuel bills!
`);

  if (!process.env.GOOGLE_CLOUD_VISION_API_KEY) {
    console.log(`
⚠️  WARNING: GOOGLE_CLOUD_VISION_API_KEY not found in .env
   OCR will not work until you add it.
`);
  }
});

