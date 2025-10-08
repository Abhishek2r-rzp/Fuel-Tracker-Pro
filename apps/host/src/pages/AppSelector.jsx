import { useNavigate } from "react-router-dom";
import { useAuth } from "@bill-reader/shared-auth";
import { Fuel, Receipt, LogOut, ArrowRight } from "lucide-react";

function AppSelector() {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Failed to logout:", error);
    }
  };

  const apps = [
    {
      id: "fuel-tracker",
      name: "Fuel Tracker Pro",
      description: "Track motorcycle fuel consumption with bill scanning",
      icon: Fuel,
      color: "from-blue-500 to-blue-600",
      url:
        import.meta.env.MODE === "production"
          ? "/fuel-tracker"
          : "http://localhost:3001",
      available: true,
    },
    {
      id: "expense-tracker",
      name: "Expense Tracker",
      description:
        "Manage expenses with PDF bank statements and credit card bills",
      icon: Receipt,
      color: "from-purple-500 to-purple-600",
      url:
        import.meta.env.MODE === "production"
          ? "/expense-tracker"
          : "http://localhost:3002",
      available: true,
    },
  ];

  const handleAppClick = (app) => {
    if (app.available) {
      // Redirect to the app's port
      window.location.href = app.url;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-accent-50 to-secondary-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="bg-white dark:bg-card-dark shadow-sm border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-accent-600 dark:from-primary-400 dark:to-accent-400 bg-clip-text text-transparent">
              Bill Reader Suite
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Welcome, {currentUser?.email}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
            Select an Application
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Choose from your financial management tools
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {apps.map((app) => {
            const Icon = app.icon;
            return (
              <button
                key={app.id}
                onClick={() => handleAppClick(app)}
                disabled={!app.available}
                className={`
                  group relative overflow-hidden rounded-2xl p-8 text-left transition-all duration-300
                  ${
                    app.available
                      ? "bg-white dark:bg-card-dark shadow-lg hover:shadow-2xl hover:scale-105 cursor-pointer"
                      : "bg-gray-100 dark:bg-gray-800 opacity-60 cursor-not-allowed"
                  }
                  border border-gray-200 dark:border-gray-700
                `}
              >
                {/* Gradient Background */}
                <div
                  className={`
                  absolute inset-0 bg-gradient-to-br ${app.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300
                `}
                />

                {/* Content */}
                <div className="relative z-10">
                  <div
                    className={`
                    inline-flex p-4 rounded-xl bg-gradient-to-br ${app.color} mb-4 shadow-lg
                  `}
                  >
                    <Icon className="w-8 h-8 text-white" />
                  </div>

                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    {app.name}
                  </h3>

                  <p className="text-gray-600 dark:text-gray-400 mb-6 min-h-[3rem]">
                    {app.description}
                  </p>

                  {app.available ? (
                    <div className="flex items-center text-primary-600 dark:text-primary-400 font-semibold group-hover:translate-x-2 transition-transform">
                      <span>Open App</span>
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </div>
                  ) : (
                    <div className="text-gray-400 dark:text-gray-600 font-semibold">
                      Coming Soon
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Info Note */}
        <div className="mt-12 max-w-2xl mx-auto">
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <p className="text-sm text-blue-800 dark:text-blue-200 text-center">
              💡 <strong>Tip:</strong> Each app works independently but shares
              your authentication and preferences.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default AppSelector;
