import { useState, useEffect } from 'react';
import { useAuth } from '@bill-reader/shared-auth';
import { getTransactions } from '../services/firestoreService';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { CreditCard, TrendingUp, TrendingDown, DollarSign, Calendar, AlertCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { getCategoryColor, getCategoryIcon } from '../utils/categorization';

function CreditCards() {
  const { currentUser } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCard, setSelectedCard] = useState('all');

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!currentUser) return;
      setLoading(true);
      setError(null);
      try {
        const fetchedTransactions = await getTransactions(currentUser.uid);
        setTransactions(fetchedTransactions);
      } catch (err) {
        console.error('Error fetching transactions:', err);
        setError('Failed to load credit card data.');
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [currentUser]);

  const formatCurrency = (amount) => {
    return `₹${Math.abs(amount).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  // Extract credit card transactions (negative amounts = expenses)
  const creditCardTransactions = transactions.filter(txn => {
    const amount = parseFloat(txn.amount);
    return !isNaN(amount) && amount < 0; // Only expenses
  });

  // Group by card (using account number or card identifier from transaction metadata)
  const groupByCard = () => {
    const cardMap = new Map();

    creditCardTransactions.forEach(txn => {
      // Try to extract card identifier from transaction metadata
      // This could be from statement metadata like "accountNumber", "cardNumber", etc.
      const cardId = txn.accountNumber || txn.cardNumber || txn.account || 'Unknown Card';
      
      if (!cardMap.has(cardId)) {
        cardMap.set(cardId, {
          cardId,
          transactions: [],
          totalSpending: 0,
          transactionCount: 0,
          categories: {},
          monthlySpending: new Map(),
        });
      }

      const cardData = cardMap.get(cardId);
      const amount = Math.abs(parseFloat(txn.amount));
      
      cardData.transactions.push(txn);
      cardData.totalSpending += amount;
      cardData.transactionCount++;

      // Category breakdown
      const category = txn.category || 'Uncategorized';
      cardData.categories[category] = (cardData.categories[category] || 0) + amount;

      // Monthly spending
      const monthYear = format(new Date(txn.date), 'MMM yy');
      cardData.monthlySpending.set(
        monthYear,
        (cardData.monthlySpending.get(monthYear) || 0) + amount
      );
    });

    return Array.from(cardMap.values()).sort((a, b) => b.totalSpending - a.totalSpending);
  };

  const cardData = groupByCard();

  // Get selected card data
  const getSelectedCardData = () => {
    if (selectedCard === 'all') {
      return {
        cardId: 'All Cards',
        transactions: creditCardTransactions,
        totalSpending: creditCardTransactions.reduce((sum, txn) => sum + Math.abs(parseFloat(txn.amount)), 0),
        transactionCount: creditCardTransactions.length,
      };
    }
    return cardData.find(card => card.cardId === selectedCard) || cardData[0];
  };

  const selectedCardData = getSelectedCardData();

  // Calculate monthly trends for selected card
  const getMonthlyTrends = () => {
    const monthlyMap = new Map();
    const relevantTransactions = selectedCard === 'all' 
      ? creditCardTransactions 
      : selectedCardData?.transactions || [];

    // Initialize last 6 months
    for (let i = 0; i < 6; i++) {
      const month = format(subMonths(new Date(), i), 'MMM yy');
      monthlyMap.set(month, 0);
    }

    relevantTransactions.forEach(txn => {
      const monthYear = format(new Date(txn.date), 'MMM yy');
      if (monthlyMap.has(monthYear)) {
        monthlyMap.set(monthYear, monthlyMap.get(monthYear) + Math.abs(parseFloat(txn.amount)));
      }
    });

    return Array.from(monthlyMap.entries())
      .map(([month, spending]) => ({ month, spending }))
      .reverse();
  };

  const monthlyTrends = getMonthlyTrends();

  // Get top categories for selected card
  const getTopCategories = () => {
    const categoryMap = {};
    const relevantTransactions = selectedCard === 'all' 
      ? creditCardTransactions 
      : selectedCardData?.transactions || [];

    relevantTransactions.forEach(txn => {
      const category = txn.category || 'Uncategorized';
      const amount = Math.abs(parseFloat(txn.amount));
      categoryMap[category] = (categoryMap[category] || 0) + amount;
    });

    return Object.entries(categoryMap)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([category, amount]) => ({ category, amount }));
  };

  const topCategories = getTopCategories();

  // Get top merchants
  const getTopMerchants = () => {
    const merchantMap = {};
    const relevantTransactions = selectedCard === 'all' 
      ? creditCardTransactions 
      : selectedCardData?.transactions || [];

    relevantTransactions.forEach(txn => {
      const merchant = txn.description || 'Unknown';
      const amount = Math.abs(parseFloat(txn.amount));
      merchantMap[merchant] = (merchantMap[merchant] || 0) + amount;
    });

    return Object.entries(merchantMap)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([merchant, amount]) => ({ merchant, amount }));
  };

  const topMerchants = getTopMerchants();

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg text-sm">
          <p className="font-semibold text-gray-900 dark:text-white mb-1">{label}</p>
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
          <h2 className="text-2xl font-bold text-error-600 dark:text-error-400 mb-4">Error</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
        </div>
      </div>
    );
  }

  if (creditCardTransactions.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Credit Cards</h1>
        <div className="card text-center py-12">
          <CreditCard className="w-20 h-20 mx-auto mb-6 text-gray-400 dark:text-gray-600" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
            No credit card transactions yet!
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Upload a credit card statement to see your spending insights.
          </p>
          <button
            onClick={() => window.location.href = 'http://localhost:3002/upload'}
            className="btn-primary"
          >
            Upload Statement
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Credit Cards</h1>
        
        {/* Card Selector */}
        {cardData.length > 1 && (
          <select
            value={selectedCard}
            onChange={(e) => setSelectedCard(e.target.value)}
            className="input w-auto"
          >
            <option value="all">All Cards</option>
            {cardData.map((card) => (
              <option key={card.cardId} value={card.cardId}>
                {card.cardId}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card flex items-center space-x-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-900/40">
          <div className="p-3 rounded-full bg-purple-200 dark:bg-purple-700 text-purple-800 dark:text-purple-200">
            <CreditCard className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Spending</p>
            <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">
              {formatCurrency(selectedCardData?.totalSpending || 0)}
            </p>
          </div>
        </div>

        <div className="card flex items-center space-x-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/40">
          <div className="p-3 rounded-full bg-blue-200 dark:bg-blue-700 text-blue-800 dark:text-blue-200">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Transactions</p>
            <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
              {selectedCardData?.transactionCount || 0}
            </p>
          </div>
        </div>

        <div className="card flex items-center space-x-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-900/40">
          <div className="p-3 rounded-full bg-green-200 dark:bg-green-700 text-green-800 dark:text-green-200">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Avg per Transaction</p>
            <p className="text-2xl font-bold text-green-700 dark:text-green-300">
              {formatCurrency(
                selectedCardData?.transactionCount > 0
                  ? selectedCardData.totalSpending / selectedCardData.transactionCount
                  : 0
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Spending Trend */}
        <div className="card">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Monthly Spending Trend
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyTrends}>
              <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.3} />
              <XAxis dataKey="month" stroke="#888" tick={{ fill: 'var(--color-text-secondary)' }} />
              <YAxis stroke="#888" tick={{ fill: 'var(--color-text-secondary)' }} tickFormatter={(value) => `₹${value}`} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line type="monotone" dataKey="spending" stroke="#8B5CF6" name="Spending" activeDot={{ r: 8 }} strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Top Categories */}
        <div className="card">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Top Spending Categories
          </h3>
          <div className="space-y-4">
            {topCategories.length > 0 ? (
              topCategories.map((cat) => {
                const percentage = (cat.amount / (selectedCardData?.totalSpending || 1)) * 100;
                const Icon = getCategoryIcon(cat.category);
                const color = getCategoryColor(cat.category);
                return (
                  <div key={cat.category} className="flex items-center space-x-3">
                    <div
                      className="p-2 rounded-full"
                      style={{ backgroundColor: color + '20' }}
                    >
                      <Icon className="w-5 h-5" style={{ color }} />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                          {cat.category}
                        </p>
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          {formatCurrency(cat.amount)} ({percentage.toFixed(1)}%)
                        </p>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="h-2 rounded-full"
                          style={{
                            width: `${percentage}%`,
                            backgroundColor: color,
                          }}
                        ></div>
                      </div>
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

      {/* Top Merchants & Card List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Merchants */}
        <div className="card">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Top Merchants
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Merchant
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Total Spent
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {topMerchants.map((merchant, idx) => (
                  <tr key={idx}>
                    <td className="px-4 py-4 text-sm text-gray-900 dark:text-white">
                      {merchant.merchant.length > 40 
                        ? merchant.merchant.substring(0, 40) + '...' 
                        : merchant.merchant}
                    </td>
                    <td className="px-4 py-4 text-sm text-right font-semibold text-purple-600 dark:text-purple-400">
                      {formatCurrency(merchant.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* All Cards Summary */}
        {cardData.length > 1 && (
          <div className="card">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              All Cards Summary
            </h3>
            <div className="space-y-3">
              {cardData.map((card) => (
                <div
                  key={card.cardId}
                  className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer"
                  onClick={() => setSelectedCard(card.cardId)}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                      <CreditCard className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {card.cardId}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {card.transactionCount} transactions
                        </p>
                      </div>
                    </div>
                    <p className="font-bold text-purple-600 dark:text-purple-400">
                      {formatCurrency(card.totalSpending)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CreditCards;
