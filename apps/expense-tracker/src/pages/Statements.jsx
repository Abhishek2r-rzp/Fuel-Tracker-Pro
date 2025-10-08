import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@bill-reader/shared-auth";
import {
  FileText,
  Trash2,
  Eye,
  Calendar,
  Download,
  AlertTriangle,
  Loader,
} from "lucide-react";
import { getStatements, deleteStatement } from "../services/firestoreService";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "../components/ui";

export default function Statements() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [statements, setStatements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  useEffect(() => {
    if (currentUser) {
      fetchStatements();
    }
  }, [currentUser]);

  const fetchStatements = async () => {
    try {
      setLoading(true);
      const data = await getStatements(currentUser.uid);
      setStatements(data);
    } catch (_error) {
      console.error("Error fetching statements:", _error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (statementId) => {
    try {
      setDeleting(statementId);
      const deletedCount = await deleteStatement(statementId);
      setStatements(statements.filter((s) => s.id !== statementId));
      setShowDeleteConfirm(null);
      alert(`✅ Deleted statement and ${deletedCount} transactions`);
    } catch (_error) {
      console.error("Error deleting statement:", _error);
      alert("Failed to delete statement. Please try again.");
    } finally {
      setDeleting(null);
    }
  };

  const handleView = (statementId) => {
    navigate(`/statements/${statementId}`);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getFileTypeIcon = (fileType) => {
    switch (fileType) {
      case "excel":
        return "📊";
      case "csv":
        return "📄";
      case "pdf":
        return "📕";
      default:
        return "📎";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        <p className="text-gray-600 dark:text-gray-400 text-lg font-medium">
          Loading statements...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Statement History
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            View and manage all your uploaded bank statements
          </p>
        </div>
        <Button onClick={() => navigate("/upload-statement")}>
          <Download className="w-5 h-5 mr-2" />
          Upload New Statement
        </Button>
      </div>

      {statements.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent className="flex flex-col items-center">
            <FileText className="w-16 h-16 mb-4 text-gray-400" />
            <CardTitle className="mb-2">No Statements Yet</CardTitle>
            <CardDescription className="mb-6">
              Upload your first bank statement to get started
            </CardDescription>
            <Button onClick={() => navigate("/upload-statement")}>
              Upload Statement
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {statements.map((statement) => (
            <Card
              key={statement.id}
              className="hover:shadow-lg transition-shadow duration-200"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  <div className="text-4xl">
                    {getFileTypeIcon(statement.fileType)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                      {statement.fileName}
                    </h3>

                    <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(statement.uploadedAt)}</span>
                      </div>

                      <div className="flex items-center space-x-1">
                        <FileText className="w-4 h-4" />
                        <span>{statement.fileType.toUpperCase()}</span>
                      </div>

                      <div className="flex items-center space-x-1">
                        <span className="font-medium">
                          {statement.transactionCount}
                        </span>
                        <span>transactions</span>
                      </div>

                      {statement.duplicateCount > 0 && (
                        <div className="flex items-center space-x-1 text-warning-600 dark:text-warning-400">
                          <AlertTriangle className="w-4 h-4" />
                          <span>{statement.duplicateCount} duplicates</span>
                        </div>
                      )}

                      <div className="text-gray-500">
                        {formatFileSize(statement.fileSize)}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 ml-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleView(statement.id)}
                    className="text-primary-600 dark:text-primary-400"
                    title="View transactions"
                  >
                    <Eye className="w-5 h-5" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowDeleteConfirm(statement.id)}
                    disabled={deleting === statement.id}
                    className="text-red-600 dark:text-red-400"
                    title="Delete statement"
                  >
                    {deleting === statement.id ? (
                      <Loader className="w-5 h-5 animate-spin" />
                    ) : (
                      <Trash2 className="w-5 h-5" />
                    )}
                  </Button>
                </div>
              </div>

              {showDeleteConfirm === statement.id && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="bg-red-50 dark:bg-red-950/30 border-2 border-red-300 dark:border-red-700 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <h4 className="font-semibold text-red-900 dark:text-red-100 mb-1">
                          Delete Statement?
                        </h4>
                        <p className="text-sm text-red-800 dark:text-red-200 mb-3">
                          This will permanently delete the statement and all{" "}
                          <strong className="text-red-900 dark:text-red-100">
                            {statement.transactionCount} transactions
                          </strong>{" "}
                          associated with it. This action cannot be undone.
                        </p>
                        <div className="flex space-x-3">
                          <Button
                            variant="destructive"
                            onClick={() => handleDelete(statement.id)}
                            disabled={deleting === statement.id}
                          >
                            {deleting === statement.id
                              ? "Deleting..."
                              : "Yes, Delete"}
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => setShowDeleteConfirm(null)}
                            disabled={deleting === statement.id}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
