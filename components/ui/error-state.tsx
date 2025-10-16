import * as React from "react";
import { AlertCircle } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "./button";

export interface ErrorStateProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  message?: string;
  onRetry?: () => void;
  retryLabel?: string;
  showSupport?: boolean;
  supportLink?: string;
}

const ErrorState = React.forwardRef<HTMLDivElement, ErrorStateProps>(
  (
    {
      className,
      title = "Something went wrong",
      message = "An error occurred while loading this content. Please try again.",
      onRetry,
      retryLabel = "Try Again",
      showSupport = true,
      supportLink = "/support",
      ...props
    },
    ref,
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex flex-col items-center justify-center gap-4 py-12 px-4 text-center",
          className,
        )}
        role="alert"
        aria-live="assertive"
        {...props}
      >
        <div className="rounded-full bg-destructive/10 p-3">
          <AlertCircle
            className="size-12 text-destructive"
            aria-hidden="true"
          />
        </div>
        <div className="space-y-2 max-w-md">
          <h3 className="text-xl font-semibold text-foreground">{title}</h3>
          {message && (
            <p className="text-sm text-muted-foreground">{message}</p>
          )}
        </div>
        <div className="flex items-center gap-3 mt-2">
          {onRetry && (
            <Button onClick={onRetry} variant="default">
              {retryLabel}
            </Button>
          )}
          {showSupport && (
            <Button variant="ghost" asChild>
              <a href={supportLink}>Contact Support</a>
            </Button>
          )}
        </div>
      </div>
    );
  },
);
ErrorState.displayName = "ErrorState";

export { ErrorState };
