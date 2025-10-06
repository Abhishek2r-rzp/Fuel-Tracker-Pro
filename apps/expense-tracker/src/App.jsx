import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { useAuth } from '@bill-reader/shared-auth';
import { ThemeToggle } from '@bill-reader/shared-ui';
import { Home, Upload, List, BarChart3, CreditCard, LogOut } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import UploadStatement from './pages/UploadStatement';
import Transactions from './pages/Transactions';
import Analytics from './pages/Analytics';
import CreditCards from './pages/CreditCards';

function App() {
  const { currentUser, logout } = useAuth();

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-app-dark">
        <div className="card max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Authentication Required
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Please log in through the host app to access Expense Tracker.
          </p>
          <a
            href="/"
            className="btn-primary inline-block"
          >
            Go to Login
          </a>
        </div>
      </div>
    );
  }

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
      window.location.href = '/';
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  };

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 dark:bg-app-dark">
        {/* Header */}
        <header className="bg-white dark:bg-card-dark shadow-sm border-b border-gray-200 dark:border-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
                Expense Tracker
              </h1>
              <a
                href="/"
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400"
              >
                ← Back to Apps
              </a>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {currentUser.email}
              </span>
              <button
                onClick={handleLogout}
                className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </header>

        {/* Navigation */}
        <nav className="bg-white dark:bg-card-dark border-b border-gray-200 dark:border-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex space-x-8 overflow-x-auto">
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
        </nav>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/upload" element={<UploadStatement />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/cards" element={<CreditCards />} />
          </Routes>
        </main>

        <ThemeToggle />
      </div>
    </Router>
  );
}

export default App;

