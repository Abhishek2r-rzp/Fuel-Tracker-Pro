/**
 * Common formatting utilities
 */

import { format } from "date-fns";

/**
 * Format a date object or timestamp
 */
export function formatDate(date, formatString = "PPP") {
  if (!date) return "";
  return format(date, formatString);
}

/**
 * Format currency in Indian Rupees
 */
export function formatCurrency(amount) {
  if (amount === null || amount === undefined) return "₹0.00";
  return `₹${parseFloat(amount).toFixed(2)}`;
}

/**
 * Format number with commas (Indian style)
 */
export function formatNumber(num) {
  if (num === null || num === undefined) return "0";
  return num.toLocaleString("en-IN");
}

/**
 * Format volume in liters
 */
export function formatVolume(liters) {
  if (liters === null || liters === undefined) return "0.00 L";
  return `${parseFloat(liters).toFixed(2)} L`;
}

/**
 * Format mileage in km/l
 */
export function formatMileage(mileage) {
  if (mileage === null || mileage === undefined) return "0.00 km/l";
  return `${parseFloat(mileage).toFixed(2)} km/l`;
}
