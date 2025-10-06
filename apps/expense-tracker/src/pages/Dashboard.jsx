import { PlusCircle, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';

function Dashboard() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h2>
        <button className="btn-primary flex items-center space-x-2">
          <PlusCircle className="w-5 h-5" />
          <span>Upload Statement</span>
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Income</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">₹0.00</p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Expenses</p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">₹0.00</p>
            </div>
            <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-lg">
              <TrendingDown className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Net Savings</p>
              <p className="text-2xl font-bold text-primary-600 dark:text-primary-400 mt-1">₹0.00</p>
            </div>
            <div className="p-3 bg-primary-100 dark:bg-primary-900/20 rounded-lg">
              <DollarSign className="w-6 h-6 text-primary-600 dark:text-primary-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Coming Soon */}
      <div className="card text-center py-12">
        <p className="text-xl text-gray-600 dark:text-gray-400">
          📊 Dashboard features coming in Phase 7-10
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
          Upload statements, view analytics, and track spending patterns
        </p>
      </div>
    </div>
  );
}

export default Dashboard;

