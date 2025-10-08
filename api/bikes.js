// Serverless function for bike data API
// This replaces server.js for production deployment on Vercel

const API_NINJAS_KEY = process.env.API_NINJAS_KEY;
const API_NINJAS_URL = "https://api.api-ninjas.com/v1/motorcycles";

// Simple in-memory cache
const cache = new Map();
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

function getCached(key) {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  return null;
}

function setCache(key, data) {
  cache.set(key, { data, timestamp: Date.now() });
}

function extractNumber(str) {
  if (!str) return null;
  const match = str.match(/[\d.]+/);
  return match ? parseFloat(match[0]) : null;
}

function extractMileage(str) {
  if (!str || str === "N/A") return null;
  const match = str.match(/([\d.]+)\s*km/i);
  return match ? parseFloat(match[1]) : null;
}

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const { action, make, model } = req.query;

  try {
    // Get list of makes
    if (action === "makes") {
      const makes = [
        "Hero",
        "Honda",
        "Bajaj",
        "TVS",
        "Royal Enfield",
        "Yamaha",
        "Suzuki",
        "KTM",
        "Kawasaki",
        "Harley-Davidson",
      ];
      return res.json(makes);
    }

    // Get models for a make
    if (action === "models" && make) {
      const cacheKey = `models_${make}`;
      let cached = getCached(cacheKey);

      if (cached) {
        return res.json(cached);
      }

      const response = await fetch(
        `${API_NINJAS_URL}?make=${encodeURIComponent(make)}`,
        {
          headers: { "X-Api-Key": API_NINJAS_KEY },
        }
      );

      if (!response.ok) {
        throw new Error(`API Ninjas error: ${response.statusText}`);
      }

      const data = await response.json();
      const models = [...new Set(data.map((bike) => bike.model))].filter(
        Boolean
      );

      setCache(cacheKey, models);
      return res.json(models);
    }

    // Get bike details
    if (action === "details" && make && model) {
      const cacheKey = `details_${make}_${model}`;
      let cached = getCached(cacheKey);

      if (cached) {
        return res.json(cached);
      }

      const response = await fetch(
        `${API_NINJAS_URL}?make=${encodeURIComponent(make)}&model=${encodeURIComponent(model)}`,
        { headers: { "X-Api-Key": API_NINJAS_KEY } }
      );

      if (!response.ok) {
        throw new Error(`API Ninjas error: ${response.statusText}`);
      }

      const data = await response.json();

      if (!data || data.length === 0) {
        return res.status(404).json({ error: "Bike not found" });
      }

      const bike = data[0];
      const details = {
        make: bike.make || make,
        model: bike.model || model,
        year: bike.year || "N/A",
        engineCapacity: extractNumber(bike.engine) || "N/A",
        fuelCapacity: extractNumber(bike.total_fuel_capacity) || "N/A",
        mileageStandard: extractMileage(bike.fuel_capacity) || "N/A",
        fuelType: "Petrol",
        horsepower: bike.power || "N/A",
        torque: bike.torque || "N/A",
        topSpeed: bike.top_speed || "N/A",
        weight: extractNumber(bike.total_weight) || "N/A",
        transmission: bike.transmission || "N/A",
        cooling: bike.cooling_system || "N/A",
        gearbox: bike.gearbox || "N/A",
        seatHeight: bike.seat_height || "N/A",
        dryWeight: bike.dry_weight || "N/A",
      };

      setCache(cacheKey, details);
      return res.json(details);
    }

    return res.status(400).json({ error: "Invalid request" });
  } catch (error) {
    console.error("API Error:", error);
    return res.status(500).json({ error: error.message });
  }
}
