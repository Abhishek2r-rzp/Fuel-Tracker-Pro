// Bike Service - API calls for bike data
// Works with both local development (server.js) and production (Vercel serverless)

/**
 * Get all available bike makes
 * @returns {Promise<Array<string>>} List of bike manufacturers
 */
export async function getBikeMakes() {
  try {
    // Production: /api/bikes?action=makes
    // Development: /api/bikes/makes
    const isDev = import.meta.env.DEV;
    const url = isDev ? "/api/bikes/makes" : "/api/bikes?action=makes";

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Failed to fetch bike makes");
    }
    const data = await response.json();
    return Array.isArray(data) ? data : data.makes || [];
  } catch (error) {
    console.error("Error fetching bike makes:", error);
    // Fallback to local data
    return [
      "Honda",
      "Hero",
      "Bajaj",
      "TVS",
      "Yamaha",
      "Royal Enfield",
      "Suzuki",
      "KTM",
    ];
  }
}

/**
 * Get all models for a specific make
 * @param {string} make - Bike manufacturer name
 * @returns {Promise<Array<string>>} List of bike model names
 */
export async function getBikeModels(make) {
  try {
    const isDev = import.meta.env.DEV;
    const url = isDev
      ? `/api/bikes/models/${encodeURIComponent(make)}`
      : `/api/bikes?action=models&make=${encodeURIComponent(make)}`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Failed to fetch bike models");
    }
    const data = await response.json();
    return Array.isArray(data) ? data : data.models || [];
  } catch (error) {
    console.error("Error fetching bike models:", error);
    return [];
  }
}

/**
 * Get details for a specific bike model
 * @param {string} make - Bike manufacturer name
 * @param {string} model - Bike model name
 * @returns {Promise<Object>} Bike details
 */
export async function getBikeDetails(make, model) {
  try {
    const isDev = import.meta.env.DEV;
    const url = isDev
      ? `/api/bikes/details/${encodeURIComponent(make)}/${encodeURIComponent(model)}`
      : `/api/bikes?action=details&make=${encodeURIComponent(make)}&model=${encodeURIComponent(model)}`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Failed to fetch bike details");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching bike details:", error);
    return null;
  }
}
