export const formatCurrency = (amount) => {
  if (typeof amount !== "number" || isNaN(amount)) {
    return "₹0.00";
  }

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Math.abs(amount));
};

export const formatDate = (date) => {
  if (!date) return "";

  const dateObj =
    date instanceof Date ? date : date.toDate?.() || new Date(date);

  if (isNaN(dateObj.getTime())) return "";

  return new Intl.DateTimeFormat("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(dateObj);
};

export const formatDateTime = (date) => {
  if (!date) return "";

  const dateObj =
    date instanceof Date ? date : date.toDate?.() || new Date(date);

  if (isNaN(dateObj.getTime())) return "";

  return new Intl.DateTimeFormat("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(dateObj);
};

export const formatNumber = (number, decimals = 0) => {
  if (typeof number !== "number" || isNaN(number)) {
    return "0";
  }

  return new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(number);
};

export const formatPercent = (value, decimals = 1) => {
  if (typeof value !== "number" || isNaN(value)) {
    return "0%";
  }

  return `${formatNumber(value, decimals)}%`;
};

export const truncateText = (text, maxLength = 50) => {
  if (!text || text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
};

export const formatFileSize = (bytes) => {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};
