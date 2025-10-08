import { Trash2 } from "lucide-react";
import { Button, Checkbox, Badge } from "../ui";

export default function BulkActions({
  totalCount,
  selectedCount,
  allSelected,
  onSelectAll,
  onDeleteSelected,
  disabled = false,
}) {
  if (totalCount === 0) return null;

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-3">
        <Checkbox
          checked={allSelected}
          onCheckedChange={onSelectAll}
          disabled={disabled}
          aria-label="Select all transactions"
        />
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Select All
          </span>
          {selectedCount > 0 && (
            <Badge variant="default" className="ml-1">
              {selectedCount} selected
            </Badge>
          )}
        </div>
      </div>

      {selectedCount > 0 && (
        <Button
          variant="destructive"
          size="sm"
          onClick={onDeleteSelected}
          disabled={disabled}
          className="gap-2"
        >
          <Trash2 className="w-4 h-4" />
          Delete Selected ({selectedCount})
        </Button>
      )}
    </div>
  );
}
