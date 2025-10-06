import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from '@bill-reader/shared-auth';
import { ThemeToggle } from '@bill-reader/shared-ui';
import { Home, Upload, List, BarChart3, CreditCard, LogOut } from 'lucide-react';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import UploadStatement from './pages/UploadStatement';
import Transactions from './pages/Transactions';
import Analytics from './pages/Analytics';
import CreditCards from './pages/CreditCards';

// Protected Route Component
function ProtectedRoute({ children }) {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center dark:bg-app-dark space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        <p className="text-gray-600 dark:text-gray-400 text-lg font-medium">
          Checking authentication...
        </p>
      </div>
    );
  }

  return currentUser ? children : <Navigate to="/login" />;
}

function AppContent() {
  const { currentUser, logout } = useAuth();

  const navigation = [
    { name: 'Dashboard', href: '/', icon: Home },
    { name: 'Upload', href: '/upload', icon: Upload },
    { name: 'Transactions', href: '/transactions', icon: List },
    { name: 'Analytics', href: '/analytics', icon: BarChart3 },
    { name: 'Credit Cards', href: '/cards', icon: CreditCard },
  ];

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  };

  return (
    <div className="min-h-screen bg-app-light dark:bg-app-dark flex">
      {/* Sidebar Navigation */}
      <nav className="w-16 md:w-64 bg-card-light dark:bg-card-dark border-r border-light dark:border-dark flex-shrink-0">
        <div className="p-4">
          <h1 className="hidden md:block text-xl font-bold bg-gradient-to-r from-primary-600 to-accent-600 dark:from-primary-400 dark:to-accent-400 bg-clip-text text-transparent mb-8">
            Expense Tracker
          </h1>
          <div className="flex flex-col space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-900/20 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span className="hidden md:block">{item.name}</span>
                </Link>
              );
            })}
          </div>

          {/* Logout Button */}
          {currentUser && (
            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-3 px-4 py-3 mt-8 rounded-lg hover:bg-error-50 dark:hover:bg-error-900/20 text-error-600 dark:text-error-400 transition-colors"
            >
              <LogOut className="w-5 h-5 flex-shrink-0" />
              <span className="hidden md:block">Logout</span>
            </button>
          )}
        </div>
      </nav>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar (Mobile) */}
        <div className="md:hidden bg-card-light dark:bg-card-dark border-b border-light dark:border-dark p-4">
          <div className="flex items-center justify-between overflow-x-auto">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className="flex items-center space-x-2 px-3 py-4 border-b-2 border-transparent hover:border-primary-500 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors whitespace-nowrap"
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Main Content */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/upload" element={<UploadStatement />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/cards" element={<CreditCards />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/*" element={
            <ProtectedRoute>
              <AppContent />
            </ProtectedRoute>
          } />
        </Routes>
        <ThemeToggle />
      </AuthProvider>
    </Router>
  );
}

export default App;
