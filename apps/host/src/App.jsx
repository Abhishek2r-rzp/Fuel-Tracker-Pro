import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@bill-reader/shared-auth';
import { ThemeToggle } from '@bill-reader/shared-ui';
import Login from './pages/Login';
import AppSelector from './pages/AppSelector';

// Protected Route Component
function ProtectedRoute({ children }) {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-app-dark">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return currentUser ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <AppSelector />
              </ProtectedRoute>
            }
          />
        </Routes>
        <ThemeToggle />
      </AuthProvider>
    </Router>
  );
}

export default App;

