export default function EmptyState({
  icon = "📭",
  title = "No data available",
  description,
  action,
  className = "",
}) {
  return (
    <div className={`text-center py-12 ${className}`}>
      <div className="text-6xl mb-4">{icon}</div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        {title}
      </h3>
      {description && (
        <p className="text-gray-600 dark:text-gray-400 mb-4">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
