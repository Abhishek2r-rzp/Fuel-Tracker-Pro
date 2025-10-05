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

// NOTE: OCR endpoint removed - now using Tesseract.js (client-side OCR)
// All OCR processing happens in the browser via src/utils/ocrService.js
// This eliminates the need for Google Cloud Vision API and any backend OCR processing

// Start server
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════╗
║   🚀 API Server Running                ║
║   📍 http://localhost:${PORT}           ║
║   🏍️  Bike API: /api/bikes/*           ║
╚════════════════════════════════════════╝

✅ Ready to serve bike data!
💡 OCR runs client-side via Tesseract.js
`);
});

