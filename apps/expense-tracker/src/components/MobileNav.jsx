import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Sun, Moon, User } from "lucide-react";
import { useTheme } from "../hooks";

export default function MobileNav({ navigation, currentUser, onLogout }) {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { isDark, toggleTheme } = useTheme();

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <div className="lg:hidden bg-card-light dark:bg-card-dark border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40 backdrop-blur-sm bg-opacity-95 dark:bg-opacity-95">
        <div className="flex items-center justify-between px-4 py-3">
          <h1 className="text-lg font-bold bg-gradient-to-r from-primary-600 to-accent-600 dark:from-primary-400 dark:to-accent-400 bg-clip-text text-transparent">
            Expense Tracker
          </h1>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Toggle menu"
          >
            {isOpen ? (
              <X className="w-6 h-6 text-gray-700 dark:text-gray-300" />
            ) : (
              <Menu className="w-6 h-6 text-gray-700 dark:text-gray-300" />
            )}
          </button>
        </div>
      </div>

      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 z-30 bg-black bg-opacity-50 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="fixed top-[57px] right-0 bottom-0 w-72 bg-card-light dark:bg-card-dark shadow-2xl transform transition-transform duration-300 ease-in-out overflow-y-auto flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <nav className="p-4 space-y-1 flex-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setIsOpen(false)}
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
            </nav>

            {currentUser && (
              <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3 px-4 py-3 mb-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {currentUser.email}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Account Settings
                    </p>
                  </div>
                </div>

                <button
                  onClick={toggleTheme}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors mb-2"
                >
                  <span className="flex items-center gap-3">
                    {isDark ? (
                      <Moon className="w-5 h-5" />
                    ) : (
                      <Sun className="w-5 h-5" />
                    )}
                    <span>Theme</span>
                  </span>
                  <span className="text-sm text-gray-500">
                    {isDark ? "Dark" : "Light"}
                  </span>
                </button>

                <button
                  onClick={() => {
                    onLogout();
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-error-600 dark:text-error-400 hover:bg-error-50 dark:hover:bg-error-900/20 transition-colors"
                >
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
