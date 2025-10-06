function UploadStatement() {
  return (
    <div className="card max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Upload Statement</h2>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        📄 PDF/Excel/CSV parser coming in Phase 7
      </p>
      <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-12 text-center">
        <p className="text-gray-500 dark:text-gray-400">Drag & drop or click to upload</p>
        <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">PDF, CSV, XLSX, XLS supported</p>
      </div>
    </div>
  );
}

export default UploadStatement;
