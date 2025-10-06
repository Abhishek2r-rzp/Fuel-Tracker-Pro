# Packages

This directory contains shared packages used across all micro-frontends.

## Structure

- **shared-ui/** - Shared UI components, theme, and styles
- **shared-auth/** - Firebase authentication wrapper and hooks
- **shared-utils/** - Common utilities, hooks, and helpers

## Usage

Import from packages in your apps:

```javascript
// In apps/fuel-tracker/src/App.jsx
import { ThemeProvider } from '@bill-reader/shared-ui';
import { useAuth } from '@bill-reader/shared-auth';
import { formatDate } from '@bill-reader/shared-utils';
```

## Development

Each package can be built independently:

```bash
# Build all packages
npm run build

# Build specific package
cd packages/shared-ui
npm run build
```

## Status

- [ ] shared-ui - Not created yet
- [ ] shared-auth - Not created yet
- [ ] shared-utils - Not created yet

