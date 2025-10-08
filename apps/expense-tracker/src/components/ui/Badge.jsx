import { cva } from "class-variance-authority";
import { cn } from "../../lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-200 hover:bg-primary-200 dark:hover:bg-primary-900/50",
        secondary:
          "border-transparent bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-700",
        destructive:
          "border-transparent bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 hover:bg-red-200 dark:hover:bg-red-900/50",
        success:
          "border-transparent bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 hover:bg-green-200 dark:hover:bg-green-900/50",
        warning:
          "border-transparent bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200 hover:bg-orange-200 dark:hover:bg-orange-900/50",
        outline:
          "text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

function Badge({ className, variant, ...props }) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
