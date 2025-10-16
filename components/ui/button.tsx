import * as React from "react";
import { cva, VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center text-sm font-medium transition-all duration-fast focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none ring-offset-background select-none active:scale-[0.98]",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:bg-primary/90 shadow-e0 hover:shadow-e1",
        brand:
          "bg-brand text-brand-foreground hover:bg-brand/90 shadow-e0 hover:shadow-e1",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-e0 hover:shadow-e1",
        success:
          "bg-success text-success-foreground hover:bg-success/90 shadow-e0 hover:shadow-e1",
        warning:
          "bg-warning text-warning-foreground hover:bg-warning/90 shadow-e0 hover:shadow-e1",
        outline:
          "border border-input bg-transparent hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "underline-offset-4 hover:underline text-primary",
      },
      size: {
        sm: "h-9 px-3 text-sm min-w-[36px]",
        default: "h-10 px-4 text-sm min-w-[40px]",
        lg: "h-12 px-6 text-base min-w-[48px]",
        icon: "size-10",
        "icon-sm": "size-9",
        "icon-lg": "size-12",
      },
      rounded: {
        default: "rounded-md",
        sm: "rounded-sm",
        lg: "rounded-lg",
        xl: "rounded-xl",
        full: "rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      rounded: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
  loadingText?: string;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      rounded,
      loading = false,
      loadingText,
      children,
      disabled,
      ...props
    },
    ref,
  ) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, rounded, className }))}
        ref={ref}
        disabled={disabled || loading}
        aria-busy={loading}
        {...props}
      >
        {loading && (
          <Loader2
            className="mr-2 size-4 animate-spin"
            aria-hidden="true"
          />
        )}
        {loading && loadingText ? loadingText : children}
      </button>
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
