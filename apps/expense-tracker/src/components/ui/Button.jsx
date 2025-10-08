import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import { cn } from "../../lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-lg text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-r from-primary-500 to-primary-600 dark:from-primary-600 dark:to-primary-700 text-white shadow hover:from-primary-600 hover:to-primary-700 dark:hover:from-primary-700 dark:hover:to-primary-800 focus-visible:ring-primary-500",
        destructive:
          "bg-red-600 text-white shadow-sm hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 focus-visible:ring-red-500",
        outline:
          "border-2 border-gray-300 dark:border-gray-600 bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-900 dark:text-gray-100 focus-visible:ring-primary-500",
        secondary:
          "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm hover:bg-gray-300 dark:hover:bg-gray-600 focus-visible:ring-gray-500",
        ghost:
          "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-900 dark:text-gray-100 focus-visible:ring-primary-500",
        link: "text-primary-600 dark:text-primary-400 underline-offset-4 hover:underline focus-visible:ring-primary-500",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-lg px-3 text-xs",
        lg: "h-11 rounded-lg px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

const Button = React.forwardRef(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
