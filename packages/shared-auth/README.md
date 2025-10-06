# @bill-reader/shared-auth

Shared Firebase authentication configuration and utilities for Bill Reader micro-frontends.

## Features

- 🔥 Firebase authentication setup
- 🔐 AuthProvider & useAuth hook
- 📦 Firestore & Storage exports
- 🎯 Centralized auth state management

## Installation

This package is part of the Bill Reader monorepo and is used internally via workspace references.

## Usage

```jsx
import { AuthProvider, useAuth, auth, db, storage } from '@bill-reader/shared-auth';

// In your app root
function App() {
  return (
    <AuthProvider>
      <YourApp />
    </AuthProvider>
  );
}

// In any component
function MyComponent() {
  const { currentUser, loading, login, signup, logout } = useAuth();
  // ...
}

// Direct Firebase access
import { db, auth, storage } from '@bill-reader/shared-auth';
```

## Exports

### Context & Hooks
- `AuthProvider` - Context provider for authentication
- `useAuth()` - Hook to access auth state and methods
- `AuthContext` - Raw context (rarely needed)

### Firebase Instances
- `auth` - Firebase Authentication instance
- `db` - Firestore Database instance
- `storage` - Firebase Storage instance
- `app` - Firebase App instance (default export)

### Auth Methods (via useAuth hook)
- `currentUser` - Current authenticated user or null
- `loading` - Boolean indicating auth state loading
- `signup(email, password)` - Create new user account
- `login(email, password)` - Sign in existing user
- `logout()` - Sign out current user

## Environment Variables

Required environment variables (set in your app's `.env`):

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

## Package Structure

```
packages/shared-auth/
├── src/
│   ├── firebase.js       # Firebase configuration
│   ├── AuthContext.jsx   # Auth context & provider
│   ├── hooks.js          # useAuth hook
│   └── index.js          # Main entry point
└── package.json
```

## Dependencies

- `react` (peer dependency)
- `firebase` (peer dependency)

