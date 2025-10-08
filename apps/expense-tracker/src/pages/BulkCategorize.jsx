import { useState, useEffect } from "react";
import { useAuth } from "@bill-reader/shared-auth";
import { Tag, Check, AlertCircle } from "lucide-react";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Badge,
  Checkbox,
  Input,
} from "../components/ui";
import {
  getTransactions,
  updateTransaction,
} from "../services/firestoreService";
import { getCategoryEmoji } from "../utils/categoryEmojis";

export default function BulkCategorize() {
  const { currentUser } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTransactions, setSelectedTransactions] = useState([]);
  const [newCategory, setNewCategory] = useState("");
  const [showOnlyOthers, setShowOnlyOthers] = useState(true);

  useEffect(() => {
    if (currentUser) {
      fetchTransactions();
    }
  }, [currentUser]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const txns = await getTransactions(currentUser.uid);
      setTransactions(txns);
    } catch (_error) {
      alert("Failed to fetch transactions. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const filteredTransactions = showOnlyOthers
    ? transactions.filter(
        (txn) =>
          !txn.category ||
          txn.category === "Others" ||
          txn.category === "Uncategorized" ||
          txn.merchant === "Others"
      )
    : transactions;

  const groupedTransactions = filteredTransactions.reduce((groups, txn) => {
    const key = txn.description || "Unknown";
    const merchantKey = key.substring(0, 50);
    if (!groups[merchantKey]) {
      groups[merchantKey] = [];
    }
    groups[merchantKey].push(txn);
    return groups;
  }, {});

  const handleSelectGroup = (groupKey, checked) => {
    const groupTxnIds = groupedTransactions[groupKey].map((t) => t.id);
    if (checked) {
      setSelectedTransactions([
        ...new Set([...selectedTransactions, ...groupTxnIds]),
      ]);
    } else {
      setSelectedTransactions(
        selectedTransactions.filter((id) => !groupTxnIds.includes(id))
      );
    }
  };

  const handleSelectTransaction = (txnId, checked) => {
    if (checked) {
      setSelectedTransactions([...selectedTransactions, txnId]);
    } else {
      setSelectedTransactions(
        selectedTransactions.filter((id) => id !== txnId)
      );
    }
  };

  const handleApplyCategory = async () => {
    if (selectedTransactions.length === 0) {
      alert("Please select at least one transaction");
      return;
    }
    if (!newCategory.trim()) {
      alert("Please enter a category name");
      return;
    }

    try {
      const updatePromises = selectedTransactions.map((txnId) =>
        updateTransaction(txnId, { category: newCategory.trim() })
      );
      await Promise.all(updatePromises);

      alert(
        `✅ Successfully updated ${selectedTransactions.length} transaction(s) to category "${newCategory.trim()}"`
      );
      setSelectedTransactions([]);
      setNewCategory("");
      await fetchTransactions();
    } catch (_error) {
      alert("Failed to update categories. Please try again.");
    }
  };

  const commonCategories = [
    "Amazon",
    "Flipkart",
    "Swiggy",
    "Zomato",
    "Uber",
    "Ola",
    "Netflix",
    "Spotify",
    "DMart",
    "BigBasket",
    "Groceries",
    "Food Delivery",
    "Transport",
    "Entertainment",
    "Shopping",
    "Utilities",
    "Healthcare",
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Bulk Categorize
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Change categories for multiple transactions at once
        </p>
      </div>

      {showOnlyOthers && filteredTransactions.length === 0 && (
        <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Check className="w-6 h-6 text-green-600 dark:text-green-400" />
              <div>
                <p className="font-semibold text-green-900 dark:text-green-100">
                  All transactions are categorized!
                </p>
                <p className="text-sm text-green-700 dark:text-green-300">
                  No transactions with &quot;Others&quot; category found. Great
                  job!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Select Transactions</CardTitle>
              <CardDescription>
                Selected: {selectedTransactions.length} transaction(s)
              </CardDescription>
            </div>
            <Button
              variant={showOnlyOthers ? "default" : "outline"}
              onClick={() => setShowOnlyOthers(!showOnlyOthers)}
              size="sm"
            >
              {showOnlyOthers ? '✓ Only "Others"' : "Show All"}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <AlertCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No transactions found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(groupedTransactions)
                .sort(([, a], [, b]) => b.length - a.length)
                .map(([groupKey, groupTxns]) => {
                  const totalAmount = groupTxns.reduce(
                    (sum, t) => sum + Math.abs(t.amount),
                    0
                  );
                  const allSelected = groupTxns.every((t) =>
                    selectedTransactions.includes(t.id)
                  );

                  return (
                    <div
                      key={groupKey}
                      className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <Checkbox
                            checked={allSelected}
                            onCheckedChange={(checked) =>
                              handleSelectGroup(groupKey, checked)
                            }
                          />
                          <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                              {groupKey}
                              <Badge variant="default">
                                {groupTxns.length} txns
                              </Badge>
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Total: ₹{totalAmount.toLocaleString("en-IN")} •
                              Current: {groupTxns[0].category || "Others"}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="ml-8 space-y-2 max-h-40 overflow-y-auto">
                        {groupTxns.slice(0, 10).map((txn) => (
                          <div
                            key={txn.id}
                            className="flex items-center justify-between text-sm py-1"
                          >
                            <div className="flex items-center gap-2 flex-1">
                              <Checkbox
                                checked={selectedTransactions.includes(txn.id)}
                                onCheckedChange={(checked) =>
                                  handleSelectTransaction(txn.id, checked)
                                }
                              />
                              <span className="text-gray-600 dark:text-gray-400">
                                {new Date(txn.date).toLocaleDateString("en-IN")}
                              </span>
                              <span className="text-gray-900 dark:text-white truncate max-w-xs">
                                {txn.description}
                              </span>
                              <Badge variant="outline" className="text-xs">
                                {getCategoryEmoji(txn.category)}{" "}
                                {txn.category || "Others"}
                              </Badge>
                            </div>
                            <span className="font-medium text-gray-900 dark:text-white">
                              ₹{Math.abs(txn.amount).toLocaleString("en-IN")}
                            </span>
                          </div>
                        ))}
                        {groupTxns.length > 10 && (
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            + {groupTxns.length - 10} more transactions
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </CardContent>
      </Card>

      {selectedTransactions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Change Category</CardTitle>
            <CardDescription>
              Set a new category for {selectedTransactions.length}{" "}
              transaction(s)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  New Category Name
                </label>
                <Input
                  type="text"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder="e.g., Amazon, Swiggy, Groceries"
                  className="w-full"
                />
              </div>

              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Quick Select:
                </p>
                <div className="flex flex-wrap gap-2">
                  {commonCategories.map((cat) => (
                    <Button
                      key={cat}
                      variant="outline"
                      size="sm"
                      onClick={() => setNewCategory(cat)}
                    >
                      {getCategoryEmoji(cat)} {cat}
                    </Button>
                  ))}
                </div>
              </div>

              <Button
                onClick={handleApplyCategory}
                className="w-full"
                disabled={!newCategory.trim()}
              >
                <Tag className="w-4 h-4 mr-2" />
                Apply Category to {selectedTransactions.length} Transaction(s)
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
