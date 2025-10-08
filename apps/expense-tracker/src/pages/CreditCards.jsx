import { useState, useEffect } from "react";
import { useAuth } from "@bill-reader/shared-auth";
import { CreditCard, TrendingUp, DollarSign, Calendar } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { getCreditCardStats } from "../services/creditCardService";
import { getCategoryEmoji } from "../utils/categoryEmojis";
import { getMerchantEmoji } from "../services/merchantDetector";

function CreditCards() {
  const { currentUser } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!currentUser) return;
      setLoading(true);
      setError(null);
      try {
        const creditCardStats = await getCreditCardStats(currentUser.uid);
        setStats(creditCardStats);
      } catch (_err) {
        setError("Failed to load credit card data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentUser]);

  const formatCurrency = (amount) => {
    return `₹${Math.abs(amount).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg text-sm">
          <p className="font-semibold text-gray-900 dark:text-white mb-1">
            {label}
          </p>
          {payload.map((entry, index) => (
            <p key={`item-${index}`} style={{ color: entry.color }}>
              {entry.name}: {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        <p className="text-gray-600 dark:text-gray-400 text-lg font-medium">
          Loading credit card data...
        </p>
        <p className="text-gray-500 dark:text-gray-500 text-sm">
          Analyzing your credit card spending
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="card max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-error-600 dark:text-error-400 mb-4">
            Error
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
        </div>
      </div>
    );
  }

  if (!stats || stats.transactionCount === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Credit Cards
        </h1>
        <div className="card text-center py-12">
          <CreditCard className="w-20 h-20 mx-auto mb-6 text-gray-400 dark:text-gray-600" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
            No credit card transactions yet!
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
            When you upload a bank statement with credit card payments,
            you&apos;ll be able to link the credit card statement here to see
            detailed transaction breakdowns.
          </p>
          <button
            onClick={() => (window.location.href = "/transactions")}
            className="btn-primary"
          >
            Go to Transactions
          </button>
        </div>
      </div>
    );
  }

  const monthlyTrendData = Object.entries(stats.monthlyTrend || {})
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-6)
    .map(([month, amount]) => ({
      month: month.substring(5) + "/" + month.substring(0, 4),
      spending: amount,
    }));

  const topCategories = Object.entries(stats.categoryBreakdown || {})
    .sort(([, a], [, b]) => b.total - a.total)
    .slice(0, 5);

  const topMerchants = Object.entries(stats.merchantBreakdown || {})
    .sort(([, a], [, b]) => b.total - a.total)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
        Credit Cards
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card flex items-center space-x-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-900/40 border-purple-200 dark:border-purple-700">
          <div className="p-3 rounded-full bg-purple-200 dark:bg-purple-700 text-purple-800 dark:text-purple-200">
            <CreditCard className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-purple-700 dark:text-purple-300">
              Total Spending
            </p>
            <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
              {formatCurrency(stats.totalSpending)}
            </p>
          </div>
        </div>

        <div className="card flex items-center space-x-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/40 border-blue-200 dark:border-blue-700">
          <div className="p-3 rounded-full bg-blue-200 dark:bg-blue-700 text-blue-800 dark:text-blue-200">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Transactions
            </p>
            <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
              {stats.transactionCount}
            </p>
          </div>
        </div>

        <div className="card flex items-center space-x-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-900/40 border-green-200 dark:border-green-700">
          <div className="p-3 rounded-full bg-green-200 dark:bg-green-700 text-green-800 dark:text-green-200">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-green-700 dark:text-green-300">
              Avg per Transaction
            </p>
            <p className="text-2xl font-bold text-green-900 dark:text-green-100">
              {formatCurrency(stats.avgPerTransaction)}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Monthly Spending Trend
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyTrendData}>
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
              <Line
                type="monotone"
                dataKey="spending"
                stroke="#8B5CF6"
                name="Spending"
                activeDot={{ r: 8 }}
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Top Spending Categories
          </h3>
          <div className="space-y-4">
            {topCategories.length > 0 ? (
              topCategories.map(([category, data]) => {
                const percentage = (data.total / stats.totalSpending) * 100;
                return (
                  <div key={category}>
                    <div className="flex justify-between items-center mb-1">
                      <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                        {getCategoryEmoji(category)} {category}
                      </p>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        {formatCurrency(data.total)} ({percentage.toFixed(1)}%)
                      </p>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="h-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-gray-600 dark:text-gray-400 text-center py-4">
                No category data available.
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Top Merchants
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Merchant
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Total Spent
                  </th>
                </tr>
              </thead>
              <tbody>
                {topMerchants.map(([merchant, data]) => (
                  <tr
                    key={merchant}
                    className="border-b border-gray-100 dark:border-gray-800"
                  >
                    <td className="py-3 px-4 text-sm text-gray-900 dark:text-white">
                      {getMerchantEmoji(merchant)}{" "}
                      {merchant.length > 40
                        ? merchant.substring(0, 40) + "..."
                        : merchant}
                    </td>
                    <td className="py-3 px-4 text-sm text-right font-semibold text-purple-600 dark:text-purple-400">
                      {formatCurrency(data.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Linked Credit Cards
          </h3>
          <div className="space-y-3">
            {stats.cards && stats.cards.length > 0 ? (
              stats.cards.map((card) => (
                <div
                  key={card.id}
                  className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg border border-purple-200 dark:border-purple-800"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">
                        {card.bank === "American Express" ? "💎" : "💳"}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {card.displayName || card.bank + " Credit Card"}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          <Calendar className="w-3 h-3 inline mr-1" />
                          {card.uploadDate?.toDate
                            ? card.uploadDate
                                .toDate()
                                .toLocaleDateString("en-IN")
                            : "Recently added"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-600 dark:text-gray-400 text-center py-4">
                No linked credit cards yet.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreditCards;
