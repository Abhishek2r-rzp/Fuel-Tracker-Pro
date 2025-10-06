# @bill-reader/shared-ui

Shared UI components, theme configuration, and styles for Bill Reader micro-frontends.

## Features

- 🎨 Pastel theme with light/dark mode support
- 🌓 ThemeProvider & useTheme hook
- 🔘 ThemeToggle component
- 💅 Shared Tailwind configuration

## Installation

This package is part of the Bill Reader monorepo and is used internally via workspace references.

## Usage

```jsx
import { ThemeProvider, useTheme, ThemeToggle } from '@bill-reader/shared-ui';
import { pastelTheme } from '@bill-reader/shared-ui/theme';

// In your app root
function App() {
  return (
    <ThemeProvider>
      <YourApp />
      <ThemeToggle />
    </ThemeProvider>
  );
}

// In any component
function MyComponent() {
  const { theme, toggleTheme } = useTheme();
  // ...
}
```

## Exports

### Theme
- `ThemeProvider` - Context provider for theme management
- `useTheme()` - Hook to access theme state and toggle function
- `pastelTheme` - Complete pastel color palette for light/dark modes

### Components
- `ThemeToggle` - Floating theme toggle button

## Package Structure

```
packages/shared-ui/
├── src/
│   ├── theme/
│   │   ├── colors.js          # Pastel color palette
│   │   ├── ThemeContext.jsx   # Theme context & provider
│   │   └── index.js           # Theme exports
│   ├── components/
│   │   ├── ThemeToggle.jsx    # Theme toggle component
│   │   └── index.js           # Component exports
│   └── index.js               # Main entry point
└── package.json
```

## Dependencies

- `react` (peer dependency)
- `lucide-react` (peer dependency for icons)

