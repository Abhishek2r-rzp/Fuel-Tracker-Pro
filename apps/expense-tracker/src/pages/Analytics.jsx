import { useState, useEffect } from "react";
import { useAuth } from "@bill-reader/shared-auth";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Calendar, TrendingUp, TrendingDown } from "lucide-react";
import {
  getTransactionStats,
  getMonthlyTrends,
} from "../services/firestoreService";

const COLORS = [
  "#8B5CF6",
  "#EC4899",
  "#10B981",
  "#F59E0B",
  "#3B82F6",
  "#EF4444",
  "#6366F1",
];

export default function Analytics() {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("6"); // months
  const [stats, setStats] = useState(null);
  const [monthlyTrends, setMonthlyTrends] = useState([]);
  const [categoryData, setCategoryData] = useState([]);

  useEffect(() => {
    if (currentUser) {
      fetchAnalytics();
    }
  }, [currentUser, timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);

      // Calculate date range
      const endDate = new Date();
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - parseInt(timeRange));

      // Fetch data
      const [statsData, trendsData] = await Promise.all([
        getTransactionStats(currentUser.uid, {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        }),
        getMonthlyTrends(currentUser.uid, parseInt(timeRange)),
      ]);

      setStats(statsData);
      setMonthlyTrends(trendsData);

      // Prepare category data for pie chart
      const categoryArray = Object.entries(statsData.categoryBreakdown).map(
        ([name, data]) => ({
          name,
          value: data.total,
          count: data.count,
        })
      );
      setCategoryData(categoryArray);
    } catch (_error) {
      console.error("Error fetching analytics:", _error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return `₹${Math.abs(amount).toLocaleString("en-IN", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })}`;
  };

  const formatMonth = (monthStr) => {
    const [year, month] = monthStr.split("-");
    return new Date(year, month - 1).toLocaleDateString("en-IN", {
      month: "short",
      year: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        <p className="text-gray-600 dark:text-gray-400 text-lg font-medium">
          Preparing analytics...
        </p>
        <p className="text-gray-500 dark:text-gray-500 text-sm">
          Calculating trends and generating charts
        </p>
      </div>
    );
  }

  if (!stats || stats.transactionCount === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Analytics
        </h1>
        <div className="card text-center py-12">
          <div className="text-6xl mb-4">📊</div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No Data Available
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Upload statements to see analytics and insights
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Analytics
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Visualize your spending patterns and trends
          </p>
        </div>

        {/* Time Range Selector */}
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="input w-auto"
        >
          <option value="3">Last 3 months</option>
          <option value="6">Last 6 months</option>
          <option value="12">Last 12 months</option>
        </select>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-700 dark:text-purple-300 mb-1">
                Total Transactions
              </p>
              <p className="text-3xl font-bold text-purple-900 dark:text-purple-100">
                {stats.transactionCount}
              </p>
            </div>
            <Calendar className="w-12 h-12 text-purple-400 dark:text-purple-600" />
          </div>
        </div>

        <div className="card bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-700 dark:text-green-300 mb-1">
                Avg. Monthly Income
              </p>
              <p className="text-3xl font-bold text-green-900 dark:text-green-100">
                {formatCurrency(
                  monthlyTrends.reduce((sum, m) => sum + m.income, 0) /
                    (monthlyTrends.length || 1)
                )}
              </p>
            </div>
            <TrendingUp className="w-12 h-12 text-green-400 dark:text-green-600" />
          </div>
        </div>

        <div className="card bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-700 dark:text-red-300 mb-1">
                Avg. Monthly Expenses
              </p>
              <p className="text-3xl font-bold text-red-900 dark:text-red-100">
                {formatCurrency(
                  monthlyTrends.reduce((sum, m) => sum + m.expenses, 0) /
                    (monthlyTrends.length || 1)
                )}
              </p>
            </div>
            <TrendingDown className="w-12 h-12 text-red-400 dark:text-red-600" />
          </div>
        </div>
      </div>

      {/* Monthly Trends Chart */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
          Income vs Expenses
        </h2>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={monthlyTrends}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#374151"
              opacity={0.2}
            />
            <XAxis
              dataKey="month"
              tickFormatter={formatMonth}
              stroke="#6B7280"
              style={{ fontSize: "12px" }}
            />
            <YAxis
              tickFormatter={formatCurrency}
              stroke="#6B7280"
              style={{ fontSize: "12px" }}
            />
            <Tooltip
              formatter={(value) => formatCurrency(value)}
              contentStyle={{
                backgroundColor: "#1F2937",
                border: "none",
                borderRadius: "8px",
                color: "#F3F4F6",
              }}
            />
            <Legend />
            <Bar
              dataKey="income"
              fill="#10B981"
              name="Income"
              radius={[8, 8, 0, 0]}
            />
            <Bar
              dataKey="expenses"
              fill="#EF4444"
              name="Expenses"
              radius={[8, 8, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            Spending by Category
          </h2>
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => formatCurrency(value)}
                  contentStyle={{
                    backgroundColor: "#1F2937",
                    border: "none",
                    borderRadius: "8px",
                    color: "#F3F4F6",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center text-gray-500 dark:text-gray-400 py-12">
              No category data available
            </p>
          )}
        </div>

        {/* Category List */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            Top Categories
          </h2>
          <div className="space-y-4">
            {categoryData
              .sort((a, b) => b.value - a.value)
              .slice(0, 7)
              .map((category, index) => {
                const percentage = (
                  (category.value / stats.totalExpenses) *
                  100
                ).toFixed(1);
                return (
                  <div key={category.name}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <div
                          className="w-4 h-4 rounded"
                          style={{
                            backgroundColor: COLORS[index % COLORS.length],
                          }}
                        />
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {category.name}
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                          {formatCurrency(category.value)}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {category.count} transactions
                        </p>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="h-2 rounded-full transition-all duration-500"
                        style={{
                          width: `${percentage}%`,
                          backgroundColor: COLORS[index % COLORS.length],
                        }}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>

      {/* Spending Trend Line Chart */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
          Spending Trend
        </h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={monthlyTrends}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#374151"
              opacity={0.2}
            />
            <XAxis
              dataKey="month"
              tickFormatter={formatMonth}
              stroke="#6B7280"
              style={{ fontSize: "12px" }}
            />
            <YAxis
              tickFormatter={formatCurrency}
              stroke="#6B7280"
              style={{ fontSize: "12px" }}
            />
            <Tooltip
              formatter={(value) => formatCurrency(value)}
              contentStyle={{
                backgroundColor: "#1F2937",
                border: "none",
                borderRadius: "8px",
                color: "#F3F4F6",
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="expenses"
              stroke="#EF4444"
              strokeWidth={3}
              name="Monthly Expenses"
              dot={{ fill: "#EF4444", r: 5 }}
              activeDot={{ r: 7 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Insights */}
      <div className="card bg-gradient-to-br from-primary-50 to-accent-50 dark:from-primary-900/20 dark:to-accent-900/20">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          💡 Key Insights
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Top Spending Category
            </h3>
            <p className="text-lg font-bold text-gray-900 dark:text-white">
              {categoryData.length > 0
                ? categoryData.sort((a, b) => b.value - a.value)[0].name
                : "N/A"}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {categoryData.length > 0
                ? formatCurrency(
                    categoryData.sort((a, b) => b.value - a.value)[0].value
                  )
                : ""}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Average Transaction
            </h3>
            <p className="text-lg font-bold text-gray-900 dark:text-white">
              {formatCurrency(stats.totalExpenses / stats.transactionCount)}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Per transaction
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
