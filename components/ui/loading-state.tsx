import * as React from "react";
import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";

export interface LoadingStateProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "spinner" | "skeleton";
  size?: "sm" | "default" | "lg";
  text?: string;
}

const LoadingState = React.forwardRef<HTMLDivElement, LoadingStateProps>(
  (
    { className, variant = "spinner", size = "default", text, ...props },
    ref,
  ) => {
    if (variant === "spinner") {
      const sizeClasses = {
        sm: "size-4",
        default: "size-6",
        lg: "size-12",
      };

      return (
        <div
          ref={ref}
          className={cn(
            "flex flex-col items-center justify-center gap-3 py-8",
            className,
          )}
          role="status"
          aria-live="polite"
          {...props}
        >
          <Loader2
            className={cn("animate-spin text-muted-foreground", sizeClasses[size])}
            aria-hidden="true"
          />
          {text && (
            <p className="text-sm text-muted-foreground">{text}</p>
          )}
          <span className="sr-only">Loading...</span>
        </div>
      );
    }

    // Skeleton variant
    return (
      <div
        ref={ref}
        className={cn("space-y-4 w-full", className)}
        role="status"
        aria-live="polite"
        {...props}
      >
        <div className="space-y-2">
          <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
          <div className="h-4 bg-muted rounded animate-pulse w-1/2" />
        </div>
        <div className="space-y-2">
          <div className="h-4 bg-muted rounded animate-pulse w-full" />
          <div className="h-4 bg-muted rounded animate-pulse w-5/6" />
        </div>
        <span className="sr-only">Loading content...</span>
      </div>
    );
  },
);
LoadingState.displayName = "LoadingState";

/**
 * Skeleton Component - Individual skeleton element for custom layouts
 */
export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "text" | "rectangular" | "circular";
}

const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, variant = "rectangular", ...props }, ref) => {
    const variantClasses = {
      text: "h-4 rounded",
      rectangular: "rounded",
      circular: "rounded-full aspect-square",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "bg-muted animate-pulse",
          variantClasses[variant],
          className,
        )}
        role="status"
        aria-hidden="true"
        {...props}
      />
    );
  },
);
Skeleton.displayName = "Skeleton";

export { LoadingState, Skeleton };
