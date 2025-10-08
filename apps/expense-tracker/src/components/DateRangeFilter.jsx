import { useState } from "react";
import { Calendar } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/Select";
import { Button } from "./ui/Button";

export const DATE_PRESETS = {
  TODAY: "today",
  YESTERDAY: "yesterday",
  LAST_7_DAYS: "last_7_days",
  LAST_30_DAYS: "last_30_days",
  THIS_MONTH: "this_month",
  LAST_MONTH: "last_month",
  THIS_YEAR: "this_year",
  LAST_YEAR: "last_year",
  CUSTOM: "custom",
  ALL_TIME: "all_time",
};

export function getDateRangeFromPreset(preset) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  switch (preset) {
    case DATE_PRESETS.TODAY: {
      return {
        startDate: today,
        endDate: tomorrow,
        label: "Today",
      };
    }

    case DATE_PRESETS.YESTERDAY: {
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      return {
        startDate: yesterday,
        endDate: today,
        label: "Yesterday",
      };
    }

    case DATE_PRESETS.LAST_7_DAYS: {
      const weekAgo = new Date(today);
      weekAgo.setDate(weekAgo.getDate() - 7);
      return {
        startDate: weekAgo,
        endDate: tomorrow,
        label: "Last 7 Days",
      };
    }

    case DATE_PRESETS.LAST_30_DAYS: {
      const monthAgo = new Date(today);
      monthAgo.setDate(monthAgo.getDate() - 30);
      return {
        startDate: monthAgo,
        endDate: tomorrow,
        label: "Last 30 Days",
      };
    }

    case DATE_PRESETS.THIS_MONTH: {
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      return {
        startDate: startOfMonth,
        endDate: tomorrow,
        label: "This Month",
      };
    }

    case DATE_PRESETS.LAST_MONTH: {
      const startOfLastMonth = new Date(
        today.getFullYear(),
        today.getMonth() - 1,
        1
      );
      const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      return {
        startDate: startOfLastMonth,
        endDate: endOfLastMonth,
        label: "Last Month",
      };
    }

    case DATE_PRESETS.THIS_YEAR: {
      const startOfYear = new Date(today.getFullYear(), 0, 1);
      return {
        startDate: startOfYear,
        endDate: tomorrow,
        label: "This Year",
      };
    }

    case DATE_PRESETS.LAST_YEAR: {
      const startOfLastYear = new Date(today.getFullYear() - 1, 0, 1);
      const endOfLastYear = new Date(today.getFullYear(), 0, 1);
      return {
        startDate: startOfLastYear,
        endDate: endOfLastYear,
        label: "Last Year",
      };
    }

    case DATE_PRESETS.ALL_TIME:
    default:
      return {
        startDate: null,
        endDate: null,
        label: "All Time",
      };
  }
}

export function DateRangeFilter({
  value = DATE_PRESETS.ALL_TIME,
  onChange,
  showCustom = true,
}) {
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [showCustomInputs, setShowCustomInputs] = useState(false);

  const handlePresetChange = (preset) => {
    if (preset === DATE_PRESETS.CUSTOM) {
      setShowCustomInputs(true);
    } else {
      setShowCustomInputs(false);
      onChange(preset);
    }
  };

  const handleCustomApply = () => {
    if (customStartDate && customEndDate) {
      onChange(DATE_PRESETS.CUSTOM, {
        startDate: new Date(customStartDate),
        endDate: new Date(customEndDate),
      });
      setShowCustomInputs(false);
    }
  };

  const currentRange =
    value === DATE_PRESETS.CUSTOM
      ? { label: "Custom Range" }
      : getDateRangeFromPreset(value);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Calendar className="w-5 h-5 text-gray-500 dark:text-gray-400" />
        <Select value={value} onValueChange={handlePresetChange}>
          <SelectTrigger className="w-full md:w-64">
            <SelectValue>
              <span className="flex items-center gap-2">
                <span className="font-medium">{currentRange.label}</span>
              </span>
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={DATE_PRESETS.ALL_TIME}>All Time</SelectItem>
            <SelectItem value={DATE_PRESETS.TODAY}>Today</SelectItem>
            <SelectItem value={DATE_PRESETS.YESTERDAY}>Yesterday</SelectItem>
            <SelectItem value={DATE_PRESETS.LAST_7_DAYS}>
              Last 7 Days
            </SelectItem>
            <SelectItem value={DATE_PRESETS.LAST_30_DAYS}>
              Last 30 Days
            </SelectItem>
            <SelectItem value={DATE_PRESETS.THIS_MONTH}>This Month</SelectItem>
            <SelectItem value={DATE_PRESETS.LAST_MONTH}>Last Month</SelectItem>
            <SelectItem value={DATE_PRESETS.THIS_YEAR}>This Year</SelectItem>
            <SelectItem value={DATE_PRESETS.LAST_YEAR}>Last Year</SelectItem>
            {showCustom && (
              <SelectItem value={DATE_PRESETS.CUSTOM}>
                Custom Range...
              </SelectItem>
            )}
          </SelectContent>
        </Select>
      </div>

      {showCustomInputs && (
        <div className="bg-primary-50 dark:bg-primary-900/20 rounded-lg p-4 border-2 border-primary-200 dark:border-primary-800">
          <div className="space-y-3">
            <div className="text-sm font-medium text-gray-900 dark:text-white mb-3">
              Select Custom Date Range
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Start Date
                </label>
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  max={customEndDate || undefined}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  End Date
                </label>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  min={customStartDate || undefined}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <Button
                onClick={handleCustomApply}
                disabled={!customStartDate || !customEndDate}
                size="sm"
              >
                Apply
              </Button>
              <Button
                onClick={() => {
                  setShowCustomInputs(false);
                  setCustomStartDate("");
                  setCustomEndDate("");
                }}
                variant="outline"
                size="sm"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
