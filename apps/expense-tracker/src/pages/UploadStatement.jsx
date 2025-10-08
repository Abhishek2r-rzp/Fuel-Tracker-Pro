import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDropzone } from "react-dropzone";
import { useAuth } from "@bill-reader/shared-auth";
import {
  Upload,
  CheckCircle,
  XCircle,
  Loader,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { processFile } from "../services/fileProcessor";
import {
  addTransactionsBatch,
  addStatement,
  getTransactions,
} from "../services/firestoreService";
import { detectDuplicates } from "../utils/duplicateDetection";
import { getMainCategory, CATEGORY_HIERARCHY } from "../utils/categoryEmojis";

function UploadStatement() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [file, setFile] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [duplicates, setDuplicates] = useState([]);
  const [duplicateAction, setDuplicateAction] = useState("skip");
  const [showCategories, setShowCategories] = useState(false);

  const onDrop = async (acceptedFiles) => {
    if (acceptedFiles.length === 0) return;

    const selectedFile = acceptedFiles[0];
    setFile(selectedFile);
    setError(null);
    setResult(null);
    setDuplicates([]);
    setProcessing(true);

    try {
      const parsed = await processFile(selectedFile);
      console.log("📊 File processed:", parsed);

      if (!parsed.transactions || !Array.isArray(parsed.transactions)) {
        console.warn("⚠️ No transactions array found, using empty array");
        parsed.transactions = [];
      }

      console.log("✅ Transactions with categories:", parsed.transactions);

      const existingTransactions = await getTransactions(currentUser.uid);
      const { newTransactions, duplicates: foundDuplicates } = detectDuplicates(
        parsed.transactions,
        existingTransactions
      );

      setDuplicates(foundDuplicates);
      setResult({
        ...parsed,
        newTransactions,
        duplicateCount: foundDuplicates.length,
      });
    } catch (_err) {
      setError(_err.message);
    } finally {
      setProcessing(false);
    }
  };

  const handleSaveTransactions = async () => {
    try {
      setSaving(true);

      let transactionsToSave = result.newTransactions;
      if (duplicateAction === "import") {
        transactionsToSave = result.transactions;
      }

      const statementId = await addStatement(currentUser.uid, {
        fileName: file.name,
        fileType: result.type,
        fileSize: result.size,
        transactionCount: transactionsToSave.length,
        duplicateCount: duplicates.length,
      });

      await addTransactionsBatch(
        currentUser.uid,
        transactionsToSave,
        statementId
      );

      navigate("/statements");
    } catch (_err) {
      console.error("Error saving transactions:", _err);
      setError("Failed to save transactions. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const getCategoryBreakdown = (transactions) => {
    if (!transactions || !Array.isArray(transactions)) return {};

    const breakdown = {};

    transactions.forEach((txn) => {
      if (txn.category) {
        const mainCat = getMainCategory(txn.category);

        if (!breakdown[mainCat]) {
          breakdown[mainCat] = {
            count: 0,
            subcategories: new Set(),
          };
        }

        breakdown[mainCat].count++;
        breakdown[mainCat].subcategories.add(txn.category);
      }
    });

    Object.keys(breakdown).forEach((cat) => {
      breakdown[cat].subcategories = Array.from(
        breakdown[cat].subcategories
      ).sort();
    });

    return breakdown;
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
        ".xlsx",
      ],
      "application/vnd.ms-excel": [".xls"],
      "text/csv": [".csv"],
    },
    maxFiles: 1,
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
          Upload Statement
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Upload bank statements or credit card bills (PDF, Excel, CSV)
        </p>
      </div>

      {/* Upload Area */}
      <div
        {...getRootProps()}
        className={`
          card cursor-pointer border-2 border-dashed transition-all duration-200
          ${
            isDragActive
              ? "border-primary-500 bg-primary-50 dark:bg-primary-900/10"
              : "border-gray-300 dark:border-gray-600"
          }
          ${
            processing
              ? "opacity-50 pointer-events-none"
              : "hover:border-primary-400"
          }
        `}
      >
        <input {...getInputProps()} />
        <div className="text-center py-12">
          <Upload
            className={`w-16 h-16 mx-auto mb-4 ${
              isDragActive ? "text-primary-600" : "text-gray-400"
            }`}
          />
          {isDragActive ? (
            <p className="text-lg text-primary-600 dark:text-primary-400 font-semibold">
              Drop file here...
            </p>
          ) : (
            <>
              <p className="text-lg text-gray-700 dark:text-gray-300 font-semibold mb-2">
                Drag & drop your file here
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                or click to browse
              </p>
              <div className="flex justify-center space-x-2 text-xs text-gray-400 dark:text-gray-500">
                <span>PDF</span>
                <span>•</span>
                <span>XLSX</span>
                <span>•</span>
                <span>XLS</span>
                <span>•</span>
                <span>CSV</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Processing Status */}
      {processing && (
        <div className="card text-center py-8">
          <Loader className="w-12 h-12 mx-auto mb-4 text-primary-600 animate-spin" />
          <p className="text-lg text-gray-700 dark:text-gray-300 font-semibold">
            Processing {file?.name}...
          </p>
          <div className="mt-4 space-y-2">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              ⚙️ Parsing file content
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              🏷️ Auto-categorizing transactions
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              🔍 Checking for duplicates
            </p>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-4">
            This may take a few moments...
          </p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="card border-2 border-error-200 dark:border-error-800 bg-error-50 dark:bg-error-900/20">
          <div className="flex items-start space-x-3">
            <XCircle className="w-6 h-6 text-error-600 dark:text-error-400 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-semibold text-error-900 dark:text-error-100">
                Error Processing File
              </h3>
              <p className="text-error-700 dark:text-error-300 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Success Result */}
      {result && !processing && (
        <div className="card border-2 border-success-200 dark:border-success-800">
          <div className="flex items-start space-x-3 mb-4">
            <CheckCircle className="w-6 h-6 text-success-600 dark:text-success-400 flex-shrink-0" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                File Processed Successfully
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                {result.fileName}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
              <p className="text-xs text-gray-500 dark:text-gray-400">Type</p>
              <p className="text-sm font-semibold text-gray-900 dark:text-white uppercase">
                {result.type}
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
              <p className="text-xs text-gray-500 dark:text-gray-400">Size</p>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                {(result.size / 1024).toFixed(1)} KB
              </p>
            </div>
            {result.pages && (
              <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Pages
                </p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  {result.pages}
                </p>
              </div>
            )}
            {result.transactions && (
              <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Transactions Found
                </p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  {result.transactions.length}
                </p>
              </div>
            )}
          </div>

          {result.transactions && result.transactions.length > 0 && (
            <div className="mb-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Categories Breakdown
                </h4>
                <button
                  onClick={() => setShowCategories(!showCategories)}
                  className="text-xs text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium flex items-center space-x-1"
                >
                  <span>{showCategories ? "Collapse" : "Expand"}</span>
                  {showCategories ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>
              </div>

              {showCategories && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {Object.entries(getCategoryBreakdown(result.transactions))
                    .sort(([, a], [, b]) => b.count - a.count)
                    .map(([mainCat, data]) => (
                      <div
                        key={mainCat}
                        className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
                      >
                        <div className="flex flex-col items-center text-center space-y-2">
                          <div className="text-4xl">
                            {CATEGORY_HIERARCHY[mainCat]?.emoji || "📌"}
                          </div>
                          <div className="w-full">
                            <h5 className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-1">
                              {mainCat}
                            </h5>
                            <div className="mt-1 flex items-center justify-center space-x-1">
                              <span className="text-lg font-bold text-primary-600 dark:text-primary-400">
                                {data.count}
                              </span>
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {data.count === 1
                                  ? "transaction"
                                  : "transactions"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}

          {result.transactions && result.transactions.length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                Preview
              </h4>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 max-h-64 overflow-y-auto">
                {result.transactions.slice(0, 5).map((txn, idx) => (
                  <div
                    key={idx}
                    className="py-2 border-b border-gray-200 dark:border-gray-700 last:border-0"
                  >
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {txn.description || "N/A"}
                      </span>
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">
                        {txn.amount ? `₹${txn.amount.toFixed(2)}` : "N/A"}
                      </span>
                    </div>
                    {txn.date && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {String(txn.date)}
                      </p>
                    )}
                  </div>
                ))}
                {result.transactions.length > 5 && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-3">
                    ...and {result.transactions.length - 5} more
                  </p>
                )}
              </div>
            </div>
          )}

          {result.requiresManualReview && (
            <div className="mt-4 p-3 bg-warning-50 dark:bg-warning-900/20 border border-warning-200 dark:border-warning-800 rounded-lg">
              <p className="text-sm text-warning-800 dark:text-warning-200">
                ⚠️ Manual review required:{" "}
                {result.message || "Could not auto-detect all fields"}
              </p>
            </div>
          )}

          {/* Duplicate Warning */}
          {duplicates.length > 0 && (
            <div className="mt-4 p-4 bg-warning-50 dark:bg-warning-900/30 border border-warning-200 dark:border-warning-700 rounded-lg">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 text-warning-600 dark:text-warning-300 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-semibold text-warning-900 dark:text-white mb-2">
                    {duplicates.length} Duplicate Transaction
                    {duplicates.length > 1 ? "s" : ""} Found
                  </h4>
                  <p className="text-sm text-warning-800 dark:text-gray-200 mb-3">
                    Some transactions appear to already exist in your records.
                    Choose how to handle them:
                  </p>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="duplicateAction"
                        value="skip"
                        checked={duplicateAction === "skip"}
                        onChange={(e) => setDuplicateAction(e.target.value)}
                        className="text-primary-600"
                      />
                      <span className="text-sm text-warning-900 dark:text-gray-100">
                        Skip duplicates (import only{" "}
                        {result.newTransactions?.length || 0} new transactions)
                      </span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="duplicateAction"
                        value="import"
                        checked={duplicateAction === "import"}
                        onChange={(e) => setDuplicateAction(e.target.value)}
                        className="text-primary-600"
                      />
                      <span className="text-sm text-warning-900 dark:text-gray-100">
                        Import all (including {duplicates.length} duplicates)
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="mt-6 flex space-x-3">
            <button
              onClick={handleSaveTransactions}
              disabled={saving || processing}
              className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {saving ? (
                <>
                  <Loader className="w-5 h-5 mr-2 animate-spin" />
                  Saving to database...
                </>
              ) : (
                <>
                  Save{" "}
                  {duplicateAction === "skip"
                    ? result.newTransactions?.length || 0
                    : result.transactions?.length || 0}{" "}
                  Transactions
                </>
              )}
            </button>
            <button
              onClick={() => {
                setFile(null);
                setResult(null);
                setError(null);
                setDuplicates([]);
              }}
              disabled={saving}
              className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Upload Another
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default UploadStatement;
