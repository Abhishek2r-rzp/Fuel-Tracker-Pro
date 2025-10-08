import { useState, useEffect } from "react";
import { useAuth } from "@bill-reader/shared-auth";
import { Tag, Check } from "lucide-react";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Badge,
  Checkbox,
} from "../components/ui";
import { getTransactions } from "../services/firestoreService";
import { getUserTags, addTagsToTransactions } from "../services/tagService";
import { getMerchantEmoji } from "../services/merchantDetector";

export default function BulkTag() {
  const { currentUser } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTransactions, setSelectedTransactions] = useState([]);
  const [groupBy, setGroupBy] = useState("merchant");
  const [selectedTags, setSelectedTags] = useState([]);
  const [hideTagged, setHideTagged] = useState(false);

  useEffect(() => {
    if (currentUser) {
      fetchData();
    }
  }, [currentUser]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [txns, userTags] = await Promise.all([
        getTransactions(currentUser.uid),
        getUserTags(currentUser.uid),
      ]);
      setTransactions(txns);
      setTags(userTags);
    } catch (_error) {
      alert("Failed to fetch data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const filteredTransactions = hideTagged
    ? transactions.filter((txn) => !txn.tags || txn.tags.length === 0)
    : transactions;

  const groupedTransactions = filteredTransactions.reduce((groups, txn) => {
    const key = groupBy === "merchant" ? txn.merchant : txn.category;
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(txn);
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

  const handleTagToggle = (tagName) => {
    if (selectedTags.includes(tagName)) {
      setSelectedTags(selectedTags.filter((t) => t !== tagName));
    } else {
      setSelectedTags([...selectedTags, tagName]);
    }
  };

  const handleApplyTags = async () => {
    if (selectedTransactions.length === 0) {
      alert("Please select at least one transaction");
      return;
    }
    if (selectedTags.length === 0) {
      alert("Please select at least one tag");
      return;
    }

    try {
      await addTagsToTransactions(selectedTransactions, selectedTags);
      alert(
        `✅ Successfully tagged ${selectedTransactions.length} transactions with ${selectedTags.length} tag(s)`
      );
      setSelectedTransactions([]);
      setSelectedTags([]);
      await fetchData();
    } catch (_error) {
      alert("Failed to apply tags. Please try again.");
    }
  };

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
          Bulk Tagging
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Group similar transactions and apply tags in bulk
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Select Transactions</CardTitle>
              <CardDescription>
                Selected: {selectedTransactions.length} transaction(s)
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant={groupBy === "merchant" ? "default" : "outline"}
                onClick={() => setGroupBy("merchant")}
                size="sm"
              >
                Group by Merchant
              </Button>
              <Button
                variant={groupBy === "category" ? "default" : "outline"}
                onClick={() => setGroupBy("category")}
                size="sm"
              >
                Group by Category
              </Button>
              <Button
                variant={hideTagged ? "default" : "outline"}
                onClick={() => setHideTagged(!hideTagged)}
                size="sm"
              >
                {hideTagged ? "✓ Hide Tagged" : "Show All"}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
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
                            {groupBy === "merchant" &&
                              getMerchantEmoji(groupKey)}
                            {groupKey}
                            <Badge variant="default">
                              {groupTxns.length} txns
                            </Badge>
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Total: ₹{totalAmount.toLocaleString("en-IN")}
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
                            {txn.tags && txn.tags.length > 0 && (
                              <div className="flex gap-1">
                                {txn.tags.map((tag, idx) => (
                                  <Badge
                                    key={idx}
                                    variant="outline"
                                    className="text-xs"
                                  >
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            )}
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
        </CardContent>
      </Card>

      {selectedTransactions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Apply Tags</CardTitle>
            <CardDescription>
              Select tags to apply to {selectedTransactions.length}{" "}
              transaction(s)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {tags.length === 0 ? (
              <div className="text-center py-8">
                <Tag className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  No tags available. Create tags first.
                </p>
                <Button onClick={() => (window.location.href = "/tags")}>
                  Go to Tags Page
                </Button>
              </div>
            ) : (
              <>
                <div className="flex flex-wrap gap-2 mb-4">
                  {tags.map((tag) => (
                    <button
                      key={tag.id}
                      onClick={() => handleTagToggle(tag.name)}
                      className={`px-4 py-2 rounded-lg border-2 flex items-center gap-2 transition-all ${
                        selectedTags.includes(tag.name)
                          ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20"
                          : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                      }`}
                      style={{
                        borderColor: selectedTags.includes(tag.name)
                          ? tag.color
                          : undefined,
                      }}
                    >
                      <span>{tag.icon}</span>
                      <span className="font-medium">{tag.name}</span>
                      {selectedTags.includes(tag.name) && (
                        <Check className="w-4 h-4" />
                      )}
                    </button>
                  ))}
                </div>

                <Button
                  onClick={handleApplyTags}
                  disabled={selectedTags.length === 0}
                >
                  <Tag className="w-4 h-4 mr-2" />
                  Apply {selectedTags.length} Tag(s) to{" "}
                  {selectedTransactions.length} Transaction(s)
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
