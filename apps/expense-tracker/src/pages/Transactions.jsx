import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "@bill-reader/shared-auth";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Search,
  Filter,
  Trash2,
  Edit,
  Calendar,
  TrendingDown,
  TrendingUp,
  X,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Save,
  CreditCard,
  Upload,
  RefreshCw,
  LayoutList,
  LayoutGrid,
} from "lucide-react";
import {
  getTransactions,
  deleteTransaction,
  deleteTransactionsBulk,
  deleteAllTransactions,
  updateTransaction,
} from "../services/firestoreService";
import { getUserTags } from "../services/tagService";
import { getCategoryWithMapping } from "../services/categoryMappingService";
import {
  getFilteredCategories,
  getMainCategory,
} from "../utils/categoryEmojis";
import {
  Button,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Badge,
  Checkbox,
} from "../components/ui";
import { getCategoryEmoji } from "../utils/categoryEmojis";
import CreditCardUploadModal from "../components/CreditCardUploadModal";

const ITEMS_PER_PAGE = 25;

export default function Transactions() {
  const { currentUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [selectedTransactions, setSelectedTransactions] = useState([]);
  const [currentPage, setCurrentPage] = useState(() => {
    const params = new URLSearchParams(location.search);
    return parseInt(params.get("page")) || 1;
  });
  const [sortField, setSortField] = useState("date");
  const [sortDirection, setSortDirection] = useState("desc");
  const [showCCModal, setShowCCModal] = useState(false);
  const [selectedCCTransaction, setSelectedCCTransaction] = useState(null);
  const [availableTags, setAvailableTags] = useState([]);
  const [viewMode, setViewMode] = useState("table");
  const previousFiltersRef = useRef({ searchTerm: "", selectedCategory: "" });

  useEffect(() => {
    if (currentUser) {
      getUserTags(currentUser.uid).then(setAvailableTags).catch(console.error);
    }
  }, [currentUser]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const category = params.get("category");
    const page = params.get("page");

    if (category) {
      setSelectedCategory(category);
    }

    if (page) {
      const pageNum = parseInt(page);
      if (!isNaN(pageNum) && pageNum > 0) {
        setCurrentPage(pageNum);
      }
    }
  }, [location.search]);

  const fetchTransactions = useCallback(async () => {
    if (!currentUser) return;

    try {
      setLoading(true);

      const params = new URLSearchParams(location.search);
      const startDate = params.get("startDate");
      const endDate = params.get("endDate");

      const filters = {};
      if (startDate) {
        filters.startDate = startDate;
      }
      if (endDate) {
        filters.endDate = endDate;
      }

      const data = await getTransactions(currentUser.uid, filters);
      setTransactions(data);
    } catch (_error) {
      console.error("Error fetching transactions:", _error);
    } finally {
      setLoading(false);
    }
  }, [currentUser, location.search]);

  const filterTransactions = useCallback(() => {
    let filtered = [...transactions];

    if (searchTerm) {
      filtered = filtered.filter(
        (t) =>
          t.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          t.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          t.merchant?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter((t) => {
        const mappedCategory = getCategoryWithMapping(t);
        const mainCategory = getMainCategory(mappedCategory);
        return mainCategory === selectedCategory;
      });
    }

    setFilteredTransactions(filtered);
  }, [transactions, searchTerm, selectedCategory]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  useEffect(() => {
    const filtersChanged =
      previousFiltersRef.current.searchTerm !== searchTerm ||
      previousFiltersRef.current.selectedCategory !== selectedCategory;

    filterTransactions();

    if (filtersChanged) {
      setCurrentPage(1);
      const params = new URLSearchParams(location.search);
      params.set("page", "1");
      navigate({ search: params.toString() }, { replace: true });
    }

    setSelectedTransactions([]);

    previousFiltersRef.current = { searchTerm, selectedCategory };
  }, [
    filterTransactions,
    searchTerm,
    selectedCategory,
    location.search,
    navigate,
  ]);

  const handleDelete = async (id) => {
    try {
      await deleteTransaction(id);
      setTransactions(transactions.filter((t) => t.id !== id));
      setShowDeleteConfirm(null);
    } catch (_error) {
      console.error("Error deleting transaction:", _error);
      alert("Failed to delete transaction. Please try again.");
    }
  };

  const handleBulkDelete = async () => {
    if (selectedTransactions.length === 0) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete ${
        selectedTransactions.length
      } selected transaction${
        selectedTransactions.length > 1 ? "s" : ""
      }? This action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      await deleteTransactionsBulk(selectedTransactions);
      setTransactions(
        transactions.filter((t) => !selectedTransactions.includes(t.id))
      );
      setSelectedTransactions([]);
      alert(
        `✅ Successfully deleted ${selectedTransactions.length} transactions`
      );
    } catch (_error) {
      console.error("Error deleting transactions:", _error);
      alert("Failed to delete transactions. Please try again.");
    }
  };

  const handleDeleteAll = async () => {
    const confirmed = window.prompt(
      `⚠️ DANGER: This will delete ALL ${transactions.length} transactions!\n\nThis action CANNOT be undone!\n\nType "DELETE ALL" (in capital letters) to confirm:`
    );

    if (confirmed !== "DELETE ALL") {
      if (confirmed !== null) {
        alert("❌ Deletion cancelled. Transactions are safe.");
      }
      return;
    }

    try {
      const deletedCount = await deleteAllTransactions(currentUser.uid);
      setTransactions([]);
      setSelectedTransactions([]);
      setCurrentPage(1);
      alert(`✅ Successfully deleted ${deletedCount} transactions!`);
    } catch (_error) {
      console.error("Error deleting all transactions:", _error);
      alert("❌ Failed to delete transactions. Please try again.");
    }
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      const currentPageIds = paginatedTransactions.map((t) => t.id);
      setSelectedTransactions(currentPageIds);
    } else {
      setSelectedTransactions([]);
    }
  };

  const handleSelectTransaction = (id, checked) => {
    if (checked) {
      setSelectedTransactions([...selectedTransactions, id]);
    } else {
      setSelectedTransactions(selectedTransactions.filter((tid) => tid !== id));
    }
  };

  const handleCreditCardClick = (transaction) => {
    setSelectedCCTransaction(transaction);
    setShowCCModal(true);
  };

  const handleCCUploadSuccess = () => {
    fetchTransactions();
  };

  const handleManualRefresh = async () => {
    setRefreshing(true);
    await fetchTransactions();
    setRefreshing(false);
  };

  const handleEdit = (transaction) => {
    setEditingId(transaction.id);
    setEditForm({
      description: transaction.description || "",
      category: transaction.category || "",
      amount: Math.abs(transaction.amount),
    });
  };

  const handleSaveEdit = async () => {
    try {
      const finalCategory =
        editForm.category === "custom"
          ? editForm.customCategory
          : editForm.category;

      await updateTransaction(editingId, {
        description: editForm.description,
        category: finalCategory,
        amount: parseFloat(editForm.amount),
      });

      // Update local state
      setTransactions(
        transactions.map((t) =>
          t.id === editingId
            ? {
                ...t,
                description: editForm.description,
                category: finalCategory,
                amount: parseFloat(editForm.amount),
              }
            : t
        )
      );

      setEditingId(null);
      setEditForm({});
    } catch (_error) {
      console.error("Error updating transaction:", _error);
      alert("Failed to update transaction. Please try again.");
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

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
    setCurrentPage(1);
    const params = new URLSearchParams(location.search);
    params.set("page", "1");
    navigate({ search: params.toString() }, { replace: true });
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    const params = new URLSearchParams(location.search);
    params.set("page", newPage.toString());
    navigate({ search: params.toString() }, { replace: true });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const getSortedTransactions = () => {
    const sorted = [...filteredTransactions].sort((a, b) => {
      let aValue, bValue;

      switch (sortField) {
        case "date":
          aValue = new Date(a.date).getTime();
          bValue = new Date(b.date).getTime();
          break;
        case "description":
          aValue = (a.description || "").toLowerCase();
          bValue = (b.description || "").toLowerCase();
          break;
        case "category":
          aValue = (a.category || "").toLowerCase();
          bValue = (b.category || "").toLowerCase();
          break;
        case "amount":
          aValue = Math.abs(a.amount || 0);
          bValue = Math.abs(b.amount || 0);
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    return sorted;
  };

  const sortedTransactions = getSortedTransactions();
  const totalPages = Math.ceil(sortedTransactions.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedTransactions = sortedTransactions.slice(startIndex, endIndex);

  const allCurrentPageSelected =
    paginatedTransactions.length > 0 &&
    paginatedTransactions.every((t) => selectedTransactions.includes(t.id));

  const categories = getFilteredCategories();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        <p className="text-gray-600 dark:text-gray-400 text-lg font-medium">
          Loading transactions...
        </p>
        <p className="text-gray-500 dark:text-gray-500 text-sm">
          Retrieving your transaction history
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            Transactions
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">
            View and manage all your transactions
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="hidden sm:flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => setViewMode("table")}
              className={`p-2 rounded transition-colors ${
                viewMode === "table"
                  ? "bg-white dark:bg-gray-700 shadow"
                  : "hover:bg-gray-200 dark:hover:bg-gray-700"
              }`}
              title="Table view"
            >
              <LayoutList className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("cards")}
              className={`p-2 rounded transition-colors ${
                viewMode === "cards"
                  ? "bg-white dark:bg-gray-700 shadow"
                  : "hover:bg-gray-200 dark:hover:bg-gray-700"
              }`}
              title="Card view"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleManualRefresh}
            disabled={refreshing}
            className="flex items-center gap-2"
          >
            <RefreshCw
              className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
            />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
          {transactions.length > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDeleteAll}
              className="flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              <span className="hidden sm:inline">
                Delete All ({transactions.length})
              </span>
              <span className="sm:hidden">Delete ({transactions.length})</span>
            </Button>
          )}
        </div>
      </div>

      {/* Filters */}
      <Card className="bg-gradient-to-br from-primary-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 border-2 border-primary-100 dark:border-gray-700">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            <CardTitle className="text-lg">Search & Filter</CardTitle>
          </div>
          <CardDescription>
            Find transactions by searching or filtering by category
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary-600 dark:group-focus-within:text-primary-400 transition-colors z-10" />
              <Input
                type="text"
                placeholder="Search by description, category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 pr-10 h-11"
              />
              {searchTerm && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSearchTerm("")}
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                  title="Clear search"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>

            {/* Category Filter */}
            <div className="relative group">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary-600 dark:group-focus-within:text-primary-400 transition-colors z-10" />
              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger className="pl-12 h-11">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Active Filters */}
          {(searchTerm || selectedCategory) && (
            <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-primary-200 dark:border-gray-700">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Active:
              </span>
              {searchTerm && (
                <Badge
                  variant="default"
                  className="flex items-center gap-1.5 px-3 py-1.5 cursor-pointer hover:bg-primary-200 dark:hover:bg-primary-800"
                  onClick={() => setSearchTerm("")}
                >
                  <Search className="w-3 h-3" />
                  &quot;{searchTerm}&quot;
                  <X className="w-3 h-3 ml-1" />
                </Badge>
              )}
              {selectedCategory && (
                <Badge
                  variant="default"
                  className="flex items-center gap-1.5 px-3 py-1.5 cursor-pointer hover:bg-primary-200 dark:hover:bg-primary-800"
                  onClick={() => setSelectedCategory("")}
                >
                  <Filter className="w-3 h-3" />
                  {selectedCategory}
                  <X className="w-3 h-3 ml-1" />
                </Badge>
              )}
              <Button
                variant="link"
                size="sm"
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("");
                }}
                className="ml-auto h-auto p-0"
              >
                Clear all
              </Button>
            </div>
          )}

          {/* Results Count & Bulk Actions */}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-4 text-sm">
            <p className="text-gray-600 dark:text-gray-400">
              Showing{" "}
              <Badge variant="default" className="mx-1">
                {startIndex + 1}-{Math.min(endIndex, sortedTransactions.length)}
              </Badge>{" "}
              of{" "}
              <Badge variant="secondary" className="mx-1">
                {sortedTransactions.length}
              </Badge>{" "}
              transactions
            </p>
            {selectedTransactions.length > 0 && (
              <div className="flex items-center gap-2">
                <Badge variant="default" className="px-3 py-1.5">
                  {selectedTransactions.length} selected
                </Badge>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleBulkDelete}
                  className="h-8"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Selected
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Transactions List */}
      <div className="card">
        {filteredTransactions.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">💳</div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {transactions.length === 0
                ? "No transactions yet"
                : "No matching transactions"}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {transactions.length === 0
                ? "Upload a statement to get started"
                : "Try adjusting your filters"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 w-12">
                    <Checkbox
                      checked={allCurrentPageSelected}
                      onCheckedChange={handleSelectAll}
                    />
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    <button
                      onClick={() => handleSort("date")}
                      className="flex items-center gap-2 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                    >
                      Date
                      {sortField === "date" ? (
                        sortDirection === "asc" ? (
                          <ArrowUp className="w-4 h-4" />
                        ) : (
                          <ArrowDown className="w-4 h-4" />
                        )
                      ) : (
                        <ArrowUpDown className="w-4 h-4 opacity-40" />
                      )}
                    </button>
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    <button
                      onClick={() => handleSort("description")}
                      className="flex items-center gap-2 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                    >
                      Description
                      {sortField === "description" ? (
                        sortDirection === "asc" ? (
                          <ArrowUp className="w-4 h-4" />
                        ) : (
                          <ArrowDown className="w-4 h-4" />
                        )
                      ) : (
                        <ArrowUpDown className="w-4 h-4 opacity-40" />
                      )}
                    </button>
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    <button
                      onClick={() => handleSort("category")}
                      className="flex items-center gap-2 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                    >
                      Category
                      {sortField === "category" ? (
                        sortDirection === "asc" ? (
                          <ArrowUp className="w-4 h-4" />
                        ) : (
                          <ArrowDown className="w-4 h-4" />
                        )
                      ) : (
                        <ArrowUpDown className="w-4 h-4 opacity-40" />
                      )}
                    </button>
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    <button
                      onClick={() => handleSort("amount")}
                      className="flex items-center gap-2 ml-auto hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                    >
                      Amount
                      {sortField === "amount" ? (
                        sortDirection === "asc" ? (
                          <ArrowUp className="w-4 h-4" />
                        ) : (
                          <ArrowDown className="w-4 h-4" />
                        )
                      ) : (
                        <ArrowUpDown className="w-4 h-4 opacity-40" />
                      )}
                    </button>
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedTransactions.map((transaction) => (
                  <tr
                    key={transaction.id}
                    className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  >
                    {editingId === transaction.id ? (
                      // Edit Mode
                      <>
                        <td className="py-3 px-4" colSpan="6">
                          <div className="bg-primary-50 dark:bg-primary-900/20 rounded-lg p-4 border-2 border-primary-200 dark:border-primary-800">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div>
                                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                  Description
                                </label>
                                <Input
                                  type="text"
                                  value={editForm.description}
                                  onChange={(e) =>
                                    setEditForm({
                                      ...editForm,
                                      description: e.target.value,
                                    })
                                  }
                                  placeholder="Transaction description"
                                  className="w-full"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                  Category / Tag
                                </label>
                                <Select
                                  value={editForm.category}
                                  onValueChange={(value) =>
                                    setEditForm({
                                      ...editForm,
                                      category: value,
                                    })
                                  }
                                >
                                  <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select category or tag" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="custom">
                                      💬 Custom (type below)
                                    </SelectItem>
                                    {availableTags.map((tag) => (
                                      <SelectItem key={tag.id} value={tag.name}>
                                        {tag.emoji || "🏷️"} {tag.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                {editForm.category === "custom" && (
                                  <Input
                                    type="text"
                                    value={editForm.customCategory || ""}
                                    onChange={(e) =>
                                      setEditForm({
                                        ...editForm,
                                        customCategory: e.target.value,
                                      })
                                    }
                                    placeholder="Enter custom category"
                                    className="w-full mt-2"
                                  />
                                )}
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                  Amount (₹)
                                </label>
                                <Input
                                  type="number"
                                  value={editForm.amount}
                                  onChange={(e) =>
                                    setEditForm({
                                      ...editForm,
                                      amount: e.target.value,
                                    })
                                  }
                                  placeholder="0.00"
                                  step="0.01"
                                  className="w-full"
                                />
                              </div>
                            </div>
                            <div className="flex items-center justify-between mt-4 pt-4 border-t border-primary-200 dark:border-primary-800">
                              <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                                <Calendar className="w-4 h-4" />
                                {formatDate(transaction.date)}
                              </div>
                              <div className="flex items-center gap-2">
                                <Button
                                  onClick={handleSaveEdit}
                                  size="sm"
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  <Save className="w-3 h-3 mr-1.5" />
                                  Save
                                </Button>
                                <Button
                                  onClick={() => {
                                    setEditingId(null);
                                    setEditForm({});
                                  }}
                                  variant="outline"
                                  size="sm"
                                >
                                  <X className="w-3 h-3 mr-1.5" />
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          </div>
                        </td>
                      </>
                    ) : (
                      // View Mode
                      <>
                        <td className="py-3 px-4">
                          <Checkbox
                            checked={selectedTransactions.includes(
                              transaction.id
                            )}
                            onCheckedChange={(checked) =>
                              handleSelectTransaction(transaction.id, checked)
                            }
                          />
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                            <Calendar className="w-4 h-4 mr-2" />
                            {formatDate(transaction.date)}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {transaction.description || "No description"}
                          </div>
                          {transaction.merchant && (
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              {transaction.merchant}
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex flex-col gap-1">
                            <Badge variant="default" className="text-base">
                              {getCategoryEmoji(transaction.category)}{" "}
                              {transaction.category || "Uncategorized"}
                            </Badge>
                            {transaction.isCreditCardPayment && (
                              <Button
                                onClick={() =>
                                  handleCreditCardClick(transaction)
                                }
                                size="sm"
                                variant={
                                  transaction.hasLinkedStatement
                                    ? "outline"
                                    : "default"
                                }
                                className="text-xs h-6"
                              >
                                <CreditCard className="w-3 h-3 mr-1" />
                                {transaction.hasLinkedStatement ? (
                                  `${transaction.linkedTransactionCount} txns`
                                ) : (
                                  <>
                                    <Upload className="w-3 h-3 ml-1" />
                                    Upload Statement
                                  </>
                                )}
                              </Button>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div
                            className={`text-sm font-semibold flex items-center justify-end ${
                              transaction.type === "credit" ||
                              transaction.amount > 0
                                ? "text-green-600 dark:text-green-400"
                                : "text-red-600 dark:text-red-400"
                            }`}
                          >
                            {transaction.type === "credit" ||
                            transaction.amount > 0 ? (
                              <TrendingUp className="w-4 h-4 mr-1" />
                            ) : (
                              <TrendingDown className="w-4 h-4 mr-1" />
                            )}
                            {formatCurrency(transaction.amount)}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(transaction)}
                              title="Edit"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() =>
                                setShowDeleteConfirm(transaction.id)
                              }
                              className="hover:text-red-600 dark:hover:text-red-400"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {filteredTransactions.length > ITEMS_PER_PAGE && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-gray-700">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Page {currentPage} of {totalPages}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Previous
              </Button>
              <div className="flex items-center gap-1">
                {[...Array(totalPages)].map((_, i) => {
                  const page = i + 1;
                  if (
                    page === 1 ||
                    page === totalPages ||
                    (page >= currentPage - 1 && page <= currentPage + 1)
                  ) {
                    return (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(page)}
                        className="w-10"
                      >
                        {page}
                      </Button>
                    );
                  } else if (
                    page === currentPage - 2 ||
                    page === currentPage + 2
                  ) {
                    return (
                      <span key={page} className="px-2 text-gray-400">
                        ...
                      </span>
                    );
                  }
                  return null;
                })}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  handlePageChange(Math.min(totalPages, currentPage + 1))
                }
                disabled={currentPage === totalPages}
              >
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full">
            <CardHeader>
              <CardTitle>Delete Transaction?</CardTitle>
              <CardDescription>
                Are you sure you want to delete this transaction? This action
                cannot be undone.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteConfirm(null)}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleDelete(showDeleteConfirm)}
                >
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Credit Card Upload Modal */}
      {showCCModal && selectedCCTransaction && (
        <CreditCardUploadModal
          isOpen={showCCModal}
          onClose={() => {
            setShowCCModal(false);
            setSelectedCCTransaction(null);
          }}
          paymentTransaction={selectedCCTransaction}
          userId={currentUser.uid}
          onSuccess={handleCCUploadSuccess}
        />
      )}
    </div>
  );
}
