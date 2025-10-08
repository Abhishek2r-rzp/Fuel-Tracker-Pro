import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "../../lib/utils";

const Checkbox = React.forwardRef(
  ({ className, checked, onCheckedChange, ...props }, ref) => {
    return (
      <button
        ref={ref}
        type="button"
        role="checkbox"
        aria-checked={checked}
        onClick={() => onCheckedChange?.(!checked)}
        className={cn(
          "peer h-5 w-5 shrink-0 rounded border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all",
          checked &&
            "bg-primary-600 dark:bg-primary-600 border-primary-600 dark:border-primary-600",
          className
        )}
        {...props}
      >
        {checked && <Check className="h-4 w-4 text-white" strokeWidth={3} />}
      </button>
    );
  }
);
Checkbox.displayName = "Checkbox";

export { Checkbox };
