import { Edit2, Trash2, Calendar, Tag as TagIcon } from "lucide-react";
import { Badge } from "./ui";

export default function TransactionCard({
  transaction,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
}) {
  const formatCurrency = (amount) => {
    const value = Math.abs(amount);
    return `₹${value.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const isDebit = transaction.amount < 0 || transaction.type === "debit";

  return (
    <div
      className={`card p-4 transition-all ${
        isSelected ? "ring-2 ring-primary-500" : ""
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(e) => onSelect(transaction.id, e.target.checked)}
            className="mt-1 flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <p className="font-medium text-gray-900 dark:text-white text-sm truncate">
              {transaction.description}
            </p>
            <div className="flex items-center gap-2 mt-1 text-xs text-gray-500 dark:text-gray-400">
              <Calendar className="w-3 h-3" />
              <span>{formatDate(transaction.date)}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0 ml-2">
          <button
            onClick={() => onEdit(transaction)}
            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
          >
            <Edit2 className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </button>
          <button
            onClick={() => onDelete(transaction.id)}
            className="p-1.5 hover:bg-error-50 dark:hover:bg-error-900/20 rounded transition-colors"
          >
            <Trash2 className="w-4 h-4 text-error-600 dark:text-error-400" />
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">
            {transaction.category || "Others"}
          </Badge>
          {transaction.tags && transaction.tags.length > 0 && (
            <div className="flex items-center gap-1">
              <TagIcon className="w-3 h-3 text-gray-400" />
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {transaction.tags.length}
              </span>
            </div>
          )}
        </div>
        <div className="text-right">
          <p
            className={`text-lg font-bold ${
              isDebit
                ? "text-error-600 dark:text-error-400"
                : "text-success-600 dark:text-success-400"
            }`}
          >
            {isDebit ? "-" : "+"} {formatCurrency(transaction.amount)}
          </p>
        </div>
      </div>

      {transaction.merchant && transaction.merchant !== "Others" && (
        <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Merchant:{" "}
            <span className="font-medium">{transaction.merchant}</span>
          </p>
        </div>
      )}
    </div>
  );
}
