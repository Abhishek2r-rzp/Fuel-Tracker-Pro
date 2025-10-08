import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Link,
  useLocation,
} from "react-router-dom";
import { lazy, Suspense } from "react";
import { AuthProvider, useAuth } from "@bill-reader/shared-auth";
import {
  Home,
  Upload,
  List,
  BarChart3,
  CreditCard,
  LogOut,
  FileText,
  Tag,
  Tags,
  Mail,
  User,
  Sun,
  Moon,
} from "lucide-react";
import MobileNav from "./components/MobileNav";
import { useTheme } from "./hooks";

const Login = lazy(() => import("./pages/Login"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const UploadStatement = lazy(() => import("./pages/UploadStatement"));
const Transactions = lazy(() => import("./pages/Transactions"));
const Analytics = lazy(() => import("./pages/Analytics"));
const CreditCards = lazy(() => import("./pages/CreditCards"));
const Statements = lazy(() => import("./pages/Statements"));
const StatementDetail = lazy(() => import("./pages/StatementDetail"));
const TagsPage = lazy(() => import("./pages/Tags"));
const BulkCategorize = lazy(() => import("./pages/BulkCategorize"));
const Contact = lazy(() => import("./pages/Contact"));

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
    </div>
  );
}

// Protected Route Component
function ProtectedRoute({ children }) {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-app-light dark:bg-app-dark flex">
        <div className="w-16 md:w-64 bg-card-light dark:bg-card-dark border-r border-light dark:border-dark flex-shrink-0 animate-pulse">
          <div className="p-4">
            <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded mb-8"></div>
            <div className="space-y-2">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="h-12 bg-gray-200 dark:bg-gray-800 rounded"
                ></div>
              ))}
            </div>
          </div>
        </div>
        <div className="flex-1 p-8">
          <div className="max-w-7xl mx-auto space-y-6 animate-pulse">
            <div className="h-10 bg-gray-200 dark:bg-gray-800 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="h-32 bg-gray-200 dark:bg-gray-800 rounded"
                ></div>
              ))}
            </div>
            <div className="h-96 bg-gray-200 dark:bg-gray-800 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return currentUser ? children : <Navigate to="/login" />;
}

function AppContent() {
  const { currentUser, logout } = useAuth();
  const location = useLocation();
  const { isDark, toggleTheme } = useTheme();

  const navigation = [
    { name: "Dashboard", href: "/", icon: Home },
    { name: "Upload", href: "/upload-statement", icon: Upload },
    { name: "Statements", href: "/statements", icon: FileText },
    { name: "Transactions", href: "/transactions", icon: List },
    { name: "Bulk Categorize", href: "/bulk-categorize", icon: Tag },
    { name: "Tags", href: "/tags", icon: Tags },
    { name: "Analytics", href: "/analytics", icon: BarChart3 },
    { name: "Credit Cards", href: "/cards", icon: CreditCard },
    { name: "Contact", href: "/contact", icon: Mail },
  ];

  const handleLogout = async () => {
    try {
      await logout();
    } catch (_error) {
      console.error("Failed to logout:", _error);
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-app-light dark:bg-app-dark">
      <MobileNav
        navigation={navigation}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      <div className="flex">
        <nav className="hidden lg:flex flex-col w-64 bg-card-light dark:bg-card-dark border-r border-gray-200 dark:border-gray-700 flex-shrink-0 h-screen sticky top-0">
          <div className="p-4 w-full flex flex-col h-full">
            <h1 className="text-xl font-bold bg-gradient-to-r from-primary-600 to-accent-600 dark:from-primary-400 dark:to-accent-400 bg-clip-text text-transparent mb-8">
              Expense Tracker
            </h1>
            <div className="flex flex-col space-y-1 flex-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                      active
                        ? "bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 font-medium"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                    }`}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>

            {currentUser && (
              <div className="mt-auto border-t border-gray-200 dark:border-gray-700 pt-4">
                <div className="flex items-center gap-3 px-4 py-3 mb-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {currentUser.email}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Account
                    </p>
                  </div>
                </div>

                <button
                  onClick={toggleTheme}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors mb-2"
                >
                  <span className="flex items-center space-x-3">
                    {isDark ? (
                      <Moon className="w-5 h-5 flex-shrink-0" />
                    ) : (
                      <Sun className="w-5 h-5 flex-shrink-0" />
                    )}
                    <span>Theme</span>
                  </span>
                  <span className="text-sm text-gray-500">
                    {isDark ? "Dark" : "Light"}
                  </span>
                </button>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-error-600 dark:text-error-400 hover:bg-error-50 dark:hover:bg-error-900/20 transition-colors"
                >
                  <LogOut className="w-5 h-5 flex-shrink-0" />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </nav>

        <main className="flex-1 w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 max-w-[100vw] lg:max-w-none overflow-x-hidden">
          <div className="max-w-7xl mx-auto">
            <Suspense fallback={<LoadingFallback />}>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/upload-statement" element={<UploadStatement />} />
                <Route path="/statements" element={<Statements />} />
                <Route
                  path="/statements/:statementId"
                  element={<StatementDetail />}
                />
                <Route path="/transactions" element={<Transactions />} />
                <Route path="/bulk-categorize" element={<BulkCategorize />} />
                <Route path="/tags" element={<TagsPage />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/cards" element={<CreditCards />} />
                <Route path="/contact" element={<Contact />} />
              </Routes>
            </Suspense>
          </div>
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router basename="/expense-tracker">
      <AuthProvider>
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <AppContent />
                </ProtectedRoute>
              }
            />
          </Routes>
        </Suspense>
      </AuthProvider>
    </Router>
  );
}

export default App;
