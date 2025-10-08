/**
 * Common calculation utilities
 */

/**
 * Calculate mileage (km/l)
 */
export function calculateMileage(distanceTraveled, fuelUsed) {
  if (!distanceTraveled || !fuelUsed || fuelUsed === 0) return 0;
  return distanceTraveled / fuelUsed;
}

/**
 * Calculate cost per kilometer
 */
export function calculateCostPerKm(totalCost, distanceTraveled) {
  if (!totalCost || !distanceTraveled || distanceTraveled === 0) return 0;
  return totalCost / distanceTraveled;
}

/**
 * Calculate price per liter
 */
export function calculatePricePerLiter(totalCost, volume) {
  if (!totalCost || !volume || volume === 0) return 0;
  return totalCost / volume;
}

/**
 * Calculate percentage
 */
export function calculatePercentage(value, total) {
  if (!value || !total || total === 0) return 0;
  return (value / total) * 100;
}

/**
 * Calculate average
 */
export function calculateAverage(values) {
  if (!values || values.length === 0) return 0;
  const sum = values.reduce((acc, val) => acc + (val || 0), 0);
  return sum / values.length;
}
