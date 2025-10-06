# Apps

This directory contains all the micro-frontend applications in the monorepo.

## Structure

- **host/** - Main shell application that orchestrates all micro-frontends
- **fuel-tracker/** - Fuel tracking PWA (migrated from original app)
- **expense-tracker/** - Expense management and analytics app (NEW)

## Development

Each app can be developed independently:

```bash
# Run all apps in development mode
npm run dev

# Run specific app
cd apps/fuel-tracker
npm run dev
```

## Building

```bash
# Build all apps
npm run build

# Build specific app
cd apps/fuel-tracker
npm run build
```

## Status

- [ ] host - Not created yet
- [ ] fuel-tracker - Migration pending
- [ ] expense-tracker - Not created yet

