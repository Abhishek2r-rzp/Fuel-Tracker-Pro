import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@bill-reader/shared-auth';
import { TrendingUp, TrendingDown, DollarSign, PlusCircle } from 'lucide-react';
import { getTransactionStats, getMonthlyTrends } from '../services/firestoreService';

export default function Dashboard() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    netSavings: 0,
    transactionCount: 0,
    categoryBreakdown: {},
  });
  const [monthlyTrends, setMonthlyTrends] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (currentUser) {
      fetchDashboardData();
    }
  }, [currentUser]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch current month stats
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const [statsData, trendsData] = await Promise.all([
        getTransactionStats(currentUser.uid, {
          startDate: startOfMonth.toISOString(),
        }),
        getMonthlyTrends(currentUser.uid, 6),
      ]);

      setStats(statsData);
      setMonthlyTrends(trendsData);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return `₹${Math.abs(amount).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        <p className="text-gray-600 dark:text-gray-400 text-lg font-medium">
          Loading dashboard data...
        </p>
        <p className="text-gray-500 dark:text-gray-500 text-sm">
          Fetching your income, expenses, and trends
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="card max-w-md w-full text-center">
          <p className="text-error-600 dark:text-error-400 mb-4">{error}</p>
          <button onClick={fetchDashboardData} className="btn-primary">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Track your expenses and income
          </p>
        </div>
        <button
          onClick={() => navigate('/upload')}
          className="btn-primary flex items-center space-x-2"
        >
          <PlusCircle className="w-5 h-5" />
          <span>Upload Statement</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Income */}
        <div className="card bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-700">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-green-700 dark:text-green-300 mb-1">
                Total Income
              </p>
              <p className="text-3xl font-bold text-green-900 dark:text-green-100">
                {formatCurrency(stats.totalIncome)}
              </p>
            </div>
            <div className="p-3 bg-green-200 dark:bg-green-700 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-700 dark:text-green-200" />
            </div>
          </div>
        </div>

        {/* Total Expenses */}
        <div className="card bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border-red-200 dark:border-red-700">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-red-700 dark:text-red-300 mb-1">
                Total Expenses
              </p>
              <p className="text-3xl font-bold text-red-900 dark:text-red-100">
                {formatCurrency(stats.totalExpenses)}
              </p>
            </div>
            <div className="p-3 bg-red-200 dark:bg-red-700 rounded-lg">
              <TrendingDown className="w-6 h-6 text-red-700 dark:text-red-200" />
            </div>
          </div>
        </div>

        {/* Net Savings */}
        <div className="card bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-700">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-purple-700 dark:text-purple-300 mb-1">
                Net Savings
              </p>
              <p className="text-3xl font-bold text-purple-900 dark:text-purple-100">
                {formatCurrency(stats.netSavings)}
              </p>
            </div>
            <div className="p-3 bg-purple-200 dark:bg-purple-700 rounded-lg">
              <DollarSign className="w-6 h-6 text-purple-700 dark:text-purple-200" />
            </div>
          </div>
        </div>
      </div>

      {/* Category Breakdown */}
      {Object.keys(stats.categoryBreakdown).length > 0 && (
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Spending by Category
          </h2>
          <div className="space-y-4">
            {Object.entries(stats.categoryBreakdown)
              .sort(([, a], [, b]) => b.total - a.total)
              .slice(0, 5)
              .map(([category, data]) => {
                const percentage = ((data.total / stats.totalExpenses) * 100).toFixed(1);
                return (
                  <div key={category}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {category}
                      </span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {formatCurrency(data.total)} ({percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-primary-500 to-accent-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Monthly Trends */}
      {monthlyTrends.length > 0 && (
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Monthly Trends
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Month
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Income
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Expenses
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Savings
                  </th>
                </tr>
              </thead>
              <tbody>
                {monthlyTrends.map((trend) => {
                  const savings = trend.income - trend.expenses;
                  return (
                    <tr
                      key={trend.month}
                      className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                    >
                      <td className="py-3 px-4 text-sm text-gray-900 dark:text-gray-100">
                        {new Date(trend.month).toLocaleDateString('en-IN', {
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="py-3 px-4 text-sm text-right text-green-600 dark:text-green-400">
                        {formatCurrency(trend.income)}
                      </td>
                      <td className="py-3 px-4 text-sm text-right text-red-600 dark:text-red-400">
                        {formatCurrency(trend.expenses)}
                      </td>
                      <td
                        className={`py-3 px-4 text-sm text-right font-medium ${
                          savings >= 0
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-red-600 dark:text-red-400'
                        }`}
                      >
                        {formatCurrency(savings)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty State */}
      {stats.transactionCount === 0 && (
        <div className="card text-center py-12">
          <div className="text-6xl mb-4">📊</div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Dashboard features coming in Phase 7-10
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Upload statements, view analytics, and track spending patterns
          </p>
          <button onClick={() => navigate('/upload')} className="btn-primary">
            Upload Your First Statement
          </button>
        </div>
      )}
    </div>
  );
}
