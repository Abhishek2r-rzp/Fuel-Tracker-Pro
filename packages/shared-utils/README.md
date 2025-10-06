# @bill-reader/shared-utils

Shared utilities, helpers, and constants for Bill Reader micro-frontends.

## Features

- 🔧 Common utility functions
- 📊 Calculation helpers (mileage, cost, etc.)
- 🎨 Formatting helpers (currency, dates, etc.)
- 🚩 Feature flags
- 🪝 Shared custom hooks (future)

## Installation

This package is part of the Bill Reader monorepo and is used internally via workspace references.

## Usage

```jsx
import { 
  FEATURES,
  formatCurrency,
  formatDate,
  calculateMileage,
  calculateCostPerKm 
} from '@bill-reader/shared-utils';

// Feature flags
if (FEATURES.ENABLE_IMAGE_STORAGE) {
  // Upload image
}

// Formatting
const price = formatCurrency(123.45); // ₹123.45
const date = formatDate(new Date(), 'PPP'); // Jan 1, 2025

// Calculations
const mileage = calculateMileage(300, 15); // 20 km/l
const cost = calculateCostPerKm(1500, 300); // ₹5.00/km
```

## Exports

### Constants
- `FEATURES` - Feature flags (e.g., `ENABLE_IMAGE_STORAGE`)

### Formatting Helpers
- `formatDate(date, format?)` - Format dates using date-fns
- `formatCurrency(amount)` - Format as Indian Rupees (₹)
- `formatNumber(num)` - Format with Indian-style commas
- `formatVolume(liters)` - Format as "X.XX L"
- `formatMileage(mileage)` - Format as "X.XX km/l"

### Calculation Helpers
- `calculateMileage(distance, fuel)` - Calculate km/l
- `calculateCostPerKm(cost, distance)` - Calculate ₹/km
- `calculatePricePerLiter(cost, volume)` - Calculate ₹/L
- `calculatePercentage(value, total)` - Calculate percentage
- `calculateAverage(values[])` - Calculate average of array

### Hooks (Future)
- Coming soon...

## Package Structure

```
packages/shared-utils/
├── src/
│   ├── constants/
│   │   ├── features.js        # Feature flags
│   │   └── index.js
│   ├── helpers/
│   │   ├── formatters.js      # Formatting utilities
│   │   ├── calculations.js    # Calculation utilities
│   │   └── index.js
│   ├── hooks/
│   │   └── index.js           # (Placeholder)
│   └── index.js               # Main entry point
└── package.json
```

## Dependencies

- `react` (peer dependency)
- `date-fns` (peer dependency)

