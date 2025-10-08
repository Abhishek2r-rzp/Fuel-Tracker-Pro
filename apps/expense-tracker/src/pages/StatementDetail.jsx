import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@bill-reader/shared-auth";
import {
  ArrowLeft,
  Calendar,
  TrendingDown,
  TrendingUp,
  FileText,
} from "lucide-react";
import {
  getTransactionsByStatement,
  getStatements,
} from "../services/firestoreService";

export default function StatementDetail() {
  const { statementId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [statement, setStatement] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser && statementId) {
      fetchData();
    }
  }, [currentUser, statementId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [allStatements, txns] = await Promise.all([
        getStatements(currentUser.uid),
        getTransactionsByStatement(statementId),
      ]);

      const stmt = allStatements.find((s) => s.id === statementId);
      setStatement(stmt);
      setTransactions(txns);
    } catch (_error) {
      console.error("Error fetching data:", _error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return `₹${Math.abs(amount).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const totalIncome = transactions
    .filter((t) => t.type === "credit" || t.amount > 0)
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const totalExpense = transactions
    .filter((t) => t.type === "debit" || t.amount < 0)
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const netAmount = totalIncome - totalExpense;

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        <p className="text-gray-600 dark:text-gray-400 text-lg font-medium">
          Loading statement...
        </p>
      </div>
    );
  }

  if (!statement) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center space-y-4">
        <FileText className="w-16 h-16 text-gray-400" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Statement Not Found
        </h2>
        <button onClick={() => navigate("/statements")} className="btn-primary">
          Back to Statements
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate("/statements")}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {statement.fileName}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Uploaded on {formatDate(statement.uploadedAt)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card border-l-4 border-success-500">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Total Income
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {formatCurrency(totalIncome)}
              </p>
            </div>
            <div className="p-3 bg-success-100 dark:bg-success-900/20 rounded-lg">
              <TrendingUp className="w-6 h-6 text-success-600 dark:text-success-400" />
            </div>
          </div>
        </div>

        <div className="card border-l-4 border-error-500">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Total Expenses
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {formatCurrency(totalExpense)}
              </p>
            </div>
            <div className="p-3 bg-error-100 dark:bg-error-900/20 rounded-lg">
              <TrendingDown className="w-6 h-6 text-error-600 dark:text-error-400" />
            </div>
          </div>
        </div>

        <div
          className={`card border-l-4 ${netAmount >= 0 ? "border-primary-500" : "border-warning-500"}`}
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Net Amount
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {netAmount >= 0 ? "+" : "-"}
                {formatCurrency(Math.abs(netAmount))}
              </p>
            </div>
            <div
              className={`p-3 rounded-lg ${netAmount >= 0 ? "bg-primary-100 dark:bg-primary-900/20" : "bg-warning-100 dark:bg-warning-900/20"}`}
            >
              <Calendar
                className={`w-6 h-6 ${netAmount >= 0 ? "text-primary-600 dark:text-primary-400" : "text-warning-600 dark:text-warning-400"}`}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Transactions ({transactions.length})
          </h2>
        </div>

        {transactions.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600 dark:text-gray-400">
              No transactions found in this statement
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Date
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Description
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Category
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((txn) => (
                  <tr
                    key={txn.id}
                    className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                      {formatDate(txn.date)}
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-md">
                        {txn.description}
                      </p>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 dark:bg-primary-900/20 text-primary-800 dark:text-primary-300">
                        {txn.category || "Uncategorized"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span
                        className={`text-sm font-semibold ${
                          txn.type === "credit" || txn.amount > 0
                            ? "text-success-600 dark:text-success-400"
                            : "text-error-600 dark:text-error-400"
                        }`}
                      >
                        {txn.type === "credit" || txn.amount > 0 ? "+" : "-"}
                        {formatCurrency(txn.amount)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
