import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@bill-reader/shared-auth";
import { PlusCircle } from "lucide-react";
import {
  getTransactions,
  getMonthlyTrends,
} from "../services/firestoreService";
import {
  DateRangeFilter,
  DATE_PRESETS,
  getDateRangeFromPreset,
} from "../components/DateRangeFilter";
import {
  BarChart,
  Bar,
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
import { getCategoryEmoji } from "../utils/categoryEmojis";
import { calculateCategoryBreakdown } from "../services/categoryMappingService";

const COLORS = [
  "#9333EA",
  "#EC4899",
  "#3B82F6",
  "#22C55E",
  "#F97316",
  "#8B5CF6",
  "#EF4444",
  "#10B981",
  "#F59E0B",
  "#6366F1",
];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
        <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
          {label}
        </p>
        {payload.map((entry, index) => (
          <p key={index} className="text-xs text-gray-600 dark:text-gray-400">
            <span style={{ color: entry.color }}>{entry.name}: </span>₹
            {entry.value.toLocaleString("en-IN")}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const CustomPieTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
        <p className="text-sm font-semibold text-gray-900 dark:text-white">
          {getCategoryEmoji(data.name)} {data.name}
        </p>
        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
          ₹{data.value.toLocaleString("en-IN")}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-500">
          {data.payload.percentage}%
        </p>
      </div>
    );
  }
  return null;
};

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
  const [datePreset, setDatePreset] = useState(DATE_PRESETS.THIS_MONTH);
  const [customDateRange, setCustomDateRange] = useState(null);

  const handleCategoryClick = (category) => {
    const dateRange =
      datePreset === DATE_PRESETS.CUSTOM
        ? customDateRange
        : getDateRangeFromPreset(datePreset);

    const params = new URLSearchParams();
    params.set("category", category);

    if (dateRange.startDate) {
      params.set("startDate", dateRange.startDate.toISOString());
    }
    if (dateRange.endDate) {
      params.set("endDate", dateRange.endDate.toISOString());
    }

    navigate(`/transactions?${params.toString()}`);
  };

  const fetchDashboardData = useCallback(async () => {
    if (!currentUser) return;

    try {
      setLoading(true);
      setError(null);

      const dateRange =
        datePreset === DATE_PRESETS.CUSTOM
          ? customDateRange
          : getDateRangeFromPreset(datePreset);

      const filters = {};
      if (dateRange.startDate) {
        filters.startDate = dateRange.startDate.toISOString();
      }
      if (dateRange.endDate) {
        filters.endDate = dateRange.endDate.toISOString();
      }

      const [transactions, trendsData] = await Promise.all([
        getTransactions(currentUser.uid, filters),
        getMonthlyTrends(currentUser.uid, 6),
      ]);

      const categoryBreakdown = calculateCategoryBreakdown(transactions);

      const totalIncome = categoryBreakdown["Income"]?.total || 0;
      const totalExpenses = categoryBreakdown["Expense"]?.total || 0;
      const netSavings = totalIncome - totalExpenses;

      setStats({
        totalIncome,
        totalExpenses,
        netSavings,
        transactionCount: transactions.length,
        categoryBreakdown,
        transactions,
      });
      setMonthlyTrends(trendsData);
    } catch (_err) {
      console.error("Error fetching dashboard data:", _err);
      setError("Failed to load dashboard data. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [currentUser, datePreset, customDateRange]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleDateFilterChange = (preset, customRange = null) => {
    setDatePreset(preset);
    if (preset === DATE_PRESETS.CUSTOM && customRange) {
      setCustomDateRange(customRange);
    }
  };

  const formatCurrency = (amount) => {
    return `₹${Math.abs(amount).toLocaleString("en-IN", {
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
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Track your expenses and income
          </p>
        </div>
        <button
          onClick={() => navigate("/upload-statement")}
          className="btn-primary flex items-center space-x-2 self-start md:self-auto"
        >
          <PlusCircle className="w-5 h-5" />
          <span>Upload Statement</span>
        </button>
      </div>

      {/* Date Filter */}
      <div className="card">
        <DateRangeFilter
          value={datePreset}
          onChange={handleDateFilterChange}
          showCustom={true}
        />
      </div>

      {/* Category Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {/* Income */}
        <div
          onClick={() => handleCategoryClick("Income")}
          className="card bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-700 cursor-pointer hover:shadow-lg transition-all hover:scale-105"
        >
          <div>
            <p className="text-xs font-medium text-green-700 dark:text-green-300 mb-1 flex items-center gap-1">
              💰 Income
            </p>
            <p className="text-2xl font-bold text-green-900 dark:text-green-100">
              {formatCurrency(stats.categoryBreakdown?.["Income"]?.total || 0)}
            </p>
            <p className="text-xs text-green-600 dark:text-green-400 mt-1">
              {stats.categoryBreakdown?.["Income"]?.count || 0} txns
            </p>
          </div>
        </div>

        {/* Expense */}
        <div
          onClick={() => handleCategoryClick("")}
          className="card bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border-red-200 dark:border-red-700 cursor-pointer hover:shadow-lg transition-all hover:scale-105"
        >
          <div>
            <p className="text-xs font-medium text-red-700 dark:text-red-300 mb-1 flex items-center gap-1">
              💸 Expense
            </p>
            <p className="text-2xl font-bold text-red-900 dark:text-red-100">
              {formatCurrency(stats.categoryBreakdown?.["Expense"]?.total || 0)}
            </p>
            <p className="text-xs text-red-600 dark:text-red-400 mt-1">
              {stats.categoryBreakdown?.["Expense"]?.count || 0} txns
            </p>
          </div>
        </div>

        {/* Investments */}
        <div
          onClick={() => handleCategoryClick("Investments")}
          className="card bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-700 cursor-pointer hover:shadow-lg transition-all hover:scale-105"
        >
          <div>
            <p className="text-xs font-medium text-blue-700 dark:text-blue-300 mb-1 flex items-center gap-1">
              📈 Investments
            </p>
            <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
              {formatCurrency(
                stats.categoryBreakdown?.["Investments"]?.total || 0
              )}
            </p>
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
              {stats.categoryBreakdown?.["Investments"]?.count || 0} txns
            </p>
          </div>
        </div>

        {/* Shopping - Online */}
        <div
          onClick={() => handleCategoryClick("Shopping - Online")}
          className="card bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-orange-200 dark:border-orange-700 cursor-pointer hover:shadow-lg transition-all hover:scale-105"
        >
          <div>
            <p className="text-xs font-medium text-orange-700 dark:text-orange-300 mb-1">
              🛍️ Shopping - Online
            </p>
            <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">
              {formatCurrency(
                stats.categoryBreakdown?.["Shopping - Online"]?.total || 0
              )}
            </p>
            <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
              {stats.categoryBreakdown?.["Shopping - Online"]?.count || 0} txns
            </p>
          </div>
        </div>

        {/* Food & Dining */}
        <div
          onClick={() => handleCategoryClick("Food & Dining")}
          className="card bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-900/20 dark:to-pink-800/20 border-pink-200 dark:border-pink-700 cursor-pointer hover:shadow-lg transition-all hover:scale-105"
        >
          <div>
            <p className="text-xs font-medium text-pink-700 dark:text-pink-300 mb-1">
              🍔 Food & Dining
            </p>
            <p className="text-2xl font-bold text-pink-900 dark:text-pink-100">
              {formatCurrency(
                stats.categoryBreakdown?.["Food & Dining"]?.total || 0
              )}
            </p>
            <p className="text-xs text-pink-600 dark:text-pink-400 mt-1">
              {stats.categoryBreakdown?.["Food & Dining"]?.count || 0} txns
            </p>
          </div>
        </div>

        {/* Transport */}
        <div
          onClick={() => handleCategoryClick("Transport")}
          className="card bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 border-yellow-200 dark:border-yellow-700 cursor-pointer hover:shadow-lg transition-all hover:scale-105"
        >
          <div>
            <p className="text-xs font-medium text-yellow-700 dark:text-yellow-300 mb-1">
              🚗 Transport
            </p>
            <p className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">
              {formatCurrency(
                stats.categoryBreakdown?.["Transport"]?.total || 0
              )}
            </p>
            <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
              {stats.categoryBreakdown?.["Transport"]?.count || 0} txns
            </p>
          </div>
        </div>

        {/* Entertainment */}
        <div
          onClick={() => handleCategoryClick("Entertainment")}
          className="card bg-gradient-to-br from-rose-50 to-rose-100 dark:from-rose-900/20 dark:to-rose-800/20 border-rose-200 dark:border-rose-700 cursor-pointer hover:shadow-lg transition-all hover:scale-105"
        >
          <div>
            <p className="text-xs font-medium text-rose-700 dark:text-rose-300 mb-1">
              🎬 Entertainment
            </p>
            <p className="text-2xl font-bold text-rose-900 dark:text-rose-100">
              {formatCurrency(
                stats.categoryBreakdown?.["Entertainment"]?.total || 0
              )}
            </p>
            <p className="text-xs text-rose-600 dark:text-rose-400 mt-1">
              {stats.categoryBreakdown?.["Entertainment"]?.count || 0} txns
            </p>
          </div>
        </div>

        {/* Groceries */}
        <div
          onClick={() => handleCategoryClick("Groceries")}
          className="card bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 border-emerald-200 dark:border-emerald-700 cursor-pointer hover:shadow-lg transition-all hover:scale-105"
        >
          <div>
            <p className="text-xs font-medium text-emerald-700 dark:text-emerald-300 mb-1">
              🛒 Groceries
            </p>
            <p className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">
              {formatCurrency(
                stats.categoryBreakdown?.["Groceries"]?.total || 0
              )}
            </p>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
              {stats.categoryBreakdown?.["Groceries"]?.count || 0} txns
            </p>
          </div>
        </div>

        {/* Rent & Housing */}
        <div
          onClick={() => handleCategoryClick("Rent & Housing")}
          className="card bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-700 cursor-pointer hover:shadow-lg transition-all hover:scale-105"
        >
          <div>
            <p className="text-xs font-medium text-purple-700 dark:text-purple-300 mb-1">
              🏠 Rent & Housing
            </p>
            <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
              {formatCurrency(
                stats.categoryBreakdown?.["Rent & Housing"]?.total || 0
              )}
            </p>
            <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
              {stats.categoryBreakdown?.["Rent & Housing"]?.count || 0} txns
            </p>
          </div>
        </div>

        {/* Bills & Fees */}
        <div
          onClick={() => handleCategoryClick("Bills & Fees")}
          className="card bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20 border-indigo-200 dark:border-indigo-700 cursor-pointer hover:shadow-lg transition-all hover:scale-105"
        >
          <div>
            <p className="text-xs font-medium text-indigo-700 dark:text-indigo-300 mb-1">
              📄 Bills & Fees
            </p>
            <p className="text-2xl font-bold text-indigo-900 dark:text-indigo-100">
              {formatCurrency(
                stats.categoryBreakdown?.["Bills & Fees"]?.total || 0
              )}
            </p>
            <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-1">
              {stats.categoryBreakdown?.["Bills & Fees"]?.count || 0} txns
            </p>
          </div>
        </div>

        {/* Credit Card Bills */}
        <div
          onClick={() => handleCategoryClick("Credit Card Bills")}
          className="card bg-gradient-to-br from-violet-50 to-violet-100 dark:from-violet-900/20 dark:to-violet-800/20 border-violet-200 dark:border-violet-700 cursor-pointer hover:shadow-lg transition-all hover:scale-105"
        >
          <div>
            <p className="text-xs font-medium text-violet-700 dark:text-violet-300 mb-1">
              💳 CC Bill Payments
            </p>
            <p className="text-2xl font-bold text-violet-900 dark:text-violet-100">
              {formatCurrency(
                stats.categoryBreakdown?.["Credit Card Bills"]?.total || 0
              )}
            </p>
            <p className="text-xs text-violet-600 dark:text-violet-400 mt-1">
              {stats.categoryBreakdown?.["Credit Card Bills"]?.count || 0} txns
            </p>
          </div>
        </div>

        {/* Others */}
        <div
          onClick={() => handleCategoryClick("Others")}
          className="card bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900/20 dark:to-gray-800/20 border-gray-200 dark:border-gray-700 cursor-pointer hover:shadow-lg transition-all hover:scale-105"
        >
          <div>
            <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              📌 Others
            </p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(stats.categoryBreakdown?.["Others"]?.total || 0)}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              {stats.categoryBreakdown?.["Others"]?.count || 0} txns
            </p>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      {stats.transactionCount > 0 && (
        <>
          {/* Category Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Spending Categories - Pie Chart */}
            {Object.keys(stats.categoryBreakdown).length > 0 && (
              <div className="card">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                  🍩 Top Spending Categories
                </h2>
                <ResponsiveContainer width="100%" height={350}>
                  <PieChart>
                    <Pie
                      data={Object.entries(stats.categoryBreakdown)
                        .sort(([, a], [, b]) => b.total - a.total)
                        .slice(0, 8)
                        .map(([category, data]) => ({
                          name: category,
                          value: data.total,
                          percentage: (
                            (data.total / stats.totalExpenses) *
                            100
                          ).toFixed(1),
                        }))}
                      cx="50%"
                      cy="45%"
                      labelLine={false}
                      label={({ percentage }) =>
                        percentage >= 5 ? `${percentage}%` : ""
                      }
                      outerRadius={90}
                      innerRadius={40}
                      fill="#8884d8"
                      dataKey="value"
                      paddingAngle={2}
                    >
                      {Object.keys(stats.categoryBreakdown).map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomPieTooltip />} />
                    <Legend
                      verticalAlign="bottom"
                      height={60}
                      iconType="circle"
                      formatter={(value) => {
                        const emoji = getCategoryEmoji(value);
                        return `${emoji} ${value}`;
                      }}
                      wrapperStyle={{
                        paddingTop: "10px",
                        fontSize: "12px",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Category Bar Chart */}
            {Object.keys(stats.categoryBreakdown).length > 0 && (
              <div className="card">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                  📊 Top Categories
                </h2>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart
                    data={Object.entries(stats.categoryBreakdown)
                      .sort(([, a], [, b]) => b.total - a.total)
                      .slice(0, 6)
                      .map(([category, data]) => ({
                        category: `${getCategoryEmoji(category)} ${category}`,
                        amount: data.total,
                        count: data.count,
                      }))}
                    layout="vertical"
                    margin={{ left: 10, right: 30 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      className="stroke-gray-200 dark:stroke-gray-700"
                    />
                    <XAxis
                      type="number"
                      className="text-xs fill-gray-600 dark:fill-gray-400"
                      tick={{ fill: "currentColor" }}
                      tickFormatter={(value) =>
                        `₹${(value / 1000).toFixed(0)}k`
                      }
                    />
                    <YAxis
                      type="category"
                      dataKey="category"
                      className="text-xs fill-gray-600 dark:fill-gray-400"
                      tick={{ fill: "currentColor" }}
                      width={130}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar
                      dataKey="amount"
                      fill="#9333EA"
                      radius={[0, 8, 8, 0]}
                      label={{
                        position: "right",
                        fill: "#9CA3AF",
                        fontSize: 11,
                        formatter: (value) => `₹${(value / 1000).toFixed(1)}k`,
                      }}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Monthly Comparison Bar Chart */}
          {monthlyTrends.length > 0 && (
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                💰 Monthly Comparison
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={monthlyTrends.map((trend) => ({
                    month: new Date(trend.month).toLocaleDateString("en-IN", {
                      month: "short",
                    }),
                    Income: trend.income,
                    Expenses: trend.expenses,
                  }))}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    className="stroke-gray-200 dark:stroke-gray-700"
                  />
                  <XAxis
                    dataKey="month"
                    className="text-xs fill-gray-600 dark:fill-gray-400"
                    tick={{ fill: "currentColor" }}
                  />
                  <YAxis
                    className="text-xs fill-gray-600 dark:fill-gray-400"
                    tick={{ fill: "currentColor" }}
                    tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar dataKey="Income" fill="#22C55E" radius={[8, 8, 0, 0]} />
                  <Bar
                    dataKey="Expenses"
                    fill="#EF4444"
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </>
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
          <button onClick={() => navigate("/upload")} className="btn-primary">
            Upload Your First Statement
          </button>
        </div>
      )}
    </div>
  );
}
