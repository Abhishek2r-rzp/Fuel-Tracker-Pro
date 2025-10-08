import { useState } from "react";
import { Upload, X, CreditCard, AlertCircle } from "lucide-react";
import { Button, Card, CardContent, CardHeader, CardTitle } from "./ui";
import { extractTransactionsFromExcel } from "../services/excelParser";
import { extractTransactionsFromCSV } from "../services/csvParser";
import {
  linkCreditCardStatement,
  addCreditCardTransactions,
} from "../services/creditCardService";
import { getCreditCardEmoji } from "../services/creditCardDetector";

export default function CreditCardUploadModal({
  isOpen,
  onClose,
  paymentTransaction,
  userId,
  onSuccess,
}) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file");
      return;
    }

    try {
      setUploading(true);
      setError(null);

      let transactions = [];
      const fileExtension = file.name.split(".").pop().toLowerCase();

      if (fileExtension === "xlsx" || fileExtension === "xls") {
        transactions = await extractTransactionsFromExcel(file);
      } else if (fileExtension === "csv") {
        transactions = await extractTransactionsFromCSV(file);
      } else {
        throw new Error(
          "Unsupported file format. Please upload Excel or CSV file."
        );
      }

      if (transactions.length === 0) {
        throw new Error("No transactions found in the file");
      }

      const creditCardId = await linkCreditCardStatement(
        userId,
        paymentTransaction.id,
        {
          ...paymentTransaction.creditCardInfo,
          fileName: file.name,
        }
      );

      await addCreditCardTransactions(
        creditCardId,
        paymentTransaction.id,
        transactions
      );

      onSuccess();
      onClose();
    } catch (_err) {
      setError(_err.message || "Failed to upload credit card statement");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-lg bg-white dark:bg-gray-900">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Upload Credit Card Statement
            </CardTitle>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </CardHeader>

        <CardContent>
          <div className="space-y-4">
            <div className="bg-primary-50 dark:bg-primary-900/20 rounded-lg p-4 border border-primary-200 dark:border-primary-800">
              <div className="flex items-start gap-3">
                <div className="text-2xl">
                  {getCreditCardEmoji(paymentTransaction.creditCardInfo?.bank)}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {paymentTransaction.creditCardInfo?.displayName ||
                      "Credit Card"}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Payment: ₹
                    {Math.abs(paymentTransaction.amount).toLocaleString(
                      "en-IN"
                    )}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    {new Date(paymentTransaction.date).toLocaleDateString(
                      "en-IN",
                      {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      }
                    )}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Credit Card Statement (Excel or CSV)
              </label>
              <div className="relative">
                <input
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleFileChange}
                  className="hidden"
                  id="cc-file-upload"
                />
                <label
                  htmlFor="cc-file-upload"
                  className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
                >
                  <Upload className="w-5 h-5 text-gray-400" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {file ? file.name : "Click to upload or drag and drop"}
                  </span>
                </label>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Supported formats: Excel (.xlsx, .xls) or CSV (.csv)
              </p>
            </div>

            {error && (
              <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-600 dark:text-red-400">
                  {error}
                </p>
              </div>
            )}

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
              <p className="text-xs text-blue-800 dark:text-blue-200">
                💡 <strong>Tip:</strong> Upload the statement for this credit
                card to see detailed transaction breakdown. These transactions
                won&apos;t be counted twice in your expenses.
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                onClick={handleUpload}
                disabled={!file || uploading}
                className="flex-1"
              >
                {uploading ? "Uploading..." : "Upload Statement"}
              </Button>
              <Button onClick={onClose} variant="outline" disabled={uploading}>
                Cancel
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
