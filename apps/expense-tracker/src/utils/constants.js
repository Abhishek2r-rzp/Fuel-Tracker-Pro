export const PAGINATION = {
  ITEMS_PER_PAGE: 25,
  MAX_PAGE_BUTTONS: 7,
  SCROLL_TO_TOP_ON_PAGE_CHANGE: true,
};

export const DATE_FORMATS = {
  DISPLAY: "MMM dd, yyyy",
  INPUT: "yyyy-MM-dd",
  FULL: "MMMM dd, yyyy, HH:mm",
};

export const CURRENCY = {
  CODE: "INR",
  SYMBOL: "₹",
  LOCALE: "en-IN",
};

export const FILE_UPLOAD = {
  MAX_SIZE_MB: 10,
  MAX_SIZE_BYTES: 10 * 1024 * 1024,
  ACCEPTED_TYPES: {
    "application/pdf": [".pdf"],
    "image/jpeg": [".jpg", ".jpeg"],
    "image/png": [".png"],
    "text/csv": [".csv"],
    "application/vnd.ms-excel": [".xls"],
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
      ".xlsx",
    ],
  },
};

export const TRANSACTION_TYPES = {
  CREDIT: "credit",
  DEBIT: "debit",
};

export const COLORS = {
  CREDIT: {
    LIGHT: "text-green-600",
    DARK: "dark:text-green-400",
  },
  DEBIT: {
    LIGHT: "text-red-600",
    DARK: "dark:text-red-400",
  },
  PRIMARY: {
    LIGHT: "text-primary-600",
    DARK: "dark:text-primary-400",
  },
};

export const STORAGE_KEYS = {
  THEME: "theme",
  USER_PREFERENCES: "user_preferences",
  LAST_UPLOAD: "last_upload",
};

export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  DASHBOARD: "/",
  UPLOAD: "/upload-statement",
  STATEMENTS: "/statements",
  TRANSACTIONS: "/transactions",
  BULK_CATEGORIZE: "/bulk-categorize",
  BULK_TAG: "/bulk-tag",
  TAGS: "/tags",
  ANALYTICS: "/analytics",
  CARDS: "/cards",
  CONTACT: "/contact",
};

export const API_ERRORS = {
  NETWORK: "Network error. Please check your connection.",
  UNAUTHORIZED: "You are not authorized to perform this action.",
  NOT_FOUND: "The requested resource was not found.",
  SERVER: "Server error. Please try again later.",
  VALIDATION: "Validation error. Please check your input.",
};

export const MESSAGES = {
  SUCCESS: {
    TRANSACTION_DELETED: "Transaction deleted successfully",
    TRANSACTIONS_DELETED: "Transactions deleted successfully",
    TRANSACTION_UPDATED: "Transaction updated successfully",
    STATEMENT_UPLOADED: "Statement uploaded successfully",
    CATEGORY_UPDATED: "Category updated successfully",
  },
  ERROR: {
    DELETE_FAILED: "Failed to delete transaction",
    UPDATE_FAILED: "Failed to update transaction",
    UPLOAD_FAILED: "Failed to upload statement",
    FETCH_FAILED: "Failed to fetch data",
  },
  CONFIRM: {
    DELETE_TRANSACTION: "Are you sure you want to delete this transaction?",
    DELETE_TRANSACTIONS:
      "Are you sure you want to delete selected transactions?",
    BULK_DELETE: "This action cannot be undone.",
  },
};
