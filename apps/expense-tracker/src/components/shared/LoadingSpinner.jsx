export default function LoadingSpinner({
  size = "md",
  message,
  fullScreen = false,
}) {
  const sizeClasses = {
    sm: "h-6 w-6 border-2",
    md: "h-12 w-12 border-t-2 border-b-2",
    lg: "h-16 w-16 border-t-3 border-b-3",
  };

  const spinner = (
    <>
      <div
        className={`animate-spin rounded-full ${sizeClasses[size]} border-primary-600`}
      ></div>
      {message && (
        <p className="text-gray-600 dark:text-gray-400 text-lg font-medium mt-4">
          {message}
        </p>
      )}
    </>
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center space-y-4">
        {spinner}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center space-y-4 py-8">
      {spinner}
    </div>
  );
}
