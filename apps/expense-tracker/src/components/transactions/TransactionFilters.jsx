import { Search, Filter, X } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Badge,
  Button,
} from "../ui";

export default function TransactionFilters({
  searchTerm,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  categories,
  resultsCount,
  totalCount,
  onClearFilters,
}) {
  const hasActiveFilters = searchTerm || selectedCategory;

  return (
    <Card className="bg-gradient-to-br from-primary-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 border-2 border-primary-100 dark:border-gray-700">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-primary-600 dark:text-primary-400" />
          <CardTitle className="text-primary-900 dark:text-primary-100">
            Search & Filter
          </CardTitle>
        </div>
        <CardDescription className="text-primary-700 dark:text-primary-300">
          Find transactions by searching or filtering by category
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary-600 dark:group-focus-within:text-primary-400 transition-colors z-10" />
            <Input
              type="text"
              placeholder="Search by description, category..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-12 h-11"
            />
          </div>

          <div className="relative group">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary-600 dark:group-focus-within:text-primary-400 transition-colors z-10" />
            <Select value={selectedCategory} onValueChange={onCategoryChange}>
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

        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-primary-200 dark:border-gray-700">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Active:
            </span>
            {searchTerm && (
              <Badge
                variant="default"
                className="flex items-center gap-1.5 px-3 py-1.5 cursor-pointer hover:bg-primary-200 dark:hover:bg-primary-800"
                onClick={() => onSearchChange("")}
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
                onClick={() => onCategoryChange("")}
              >
                <Filter className="w-3 h-3" />
                {selectedCategory}
                <X className="w-3 h-3 ml-1" />
              </Badge>
            )}
            <Button
              variant="link"
              size="sm"
              onClick={onClearFilters}
              className="ml-auto h-auto p-0"
            >
              Clear all
            </Button>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-4 text-sm pt-2">
          <p className="text-gray-600 dark:text-gray-400">
            Showing{" "}
            <Badge variant="default" className="mx-1">
              {resultsCount}
            </Badge>{" "}
            of{" "}
            <Badge variant="secondary" className="mx-1">
              {totalCount}
            </Badge>{" "}
            transactions
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
