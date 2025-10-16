import * as React from "react";
import { cva, VariantProps } from "class-variance-authority";
import { AlertCircle, CheckCircle, Info } from "lucide-react";

import { cn } from "@/lib/utils";

const inputVariants = cva(
  "flex w-full rounded-md border bg-transparent px-3 py-2 ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-fast",
  {
    variants: {
      size: {
        sm: "h-9 px-3 py-2 text-sm",
        default: "h-10 px-3 py-2 text-base md:text-sm",
        lg: "h-12 px-4 py-3 text-base",
      },
      inputState: {
        default: "border-input hover:border-neutral-9 focus-visible:border-ring",
        error:
          "border-destructive bg-destructive/5 focus-visible:ring-destructive",
        success:
          "border-success bg-success/5 focus-visible:ring-success",
      },
    },
    defaultVariants: {
      size: "default",
      inputState: "default",
    },
  },
);

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement>,
    VariantProps<typeof inputVariants> {
  error?: string;
  success?: string;
  helperText?: string;
  inputState?: "default" | "error" | "success";
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type,
      size,
      inputState = "default",
      error,
      success,
      helperText,
      ...props
    },
    ref,
  ) => {
    // Determine state based on error/success props
    const derivedState = error
      ? "error"
      : success
        ? "success"
        : inputState;

    const message = error || success || helperText;

    return (
      <div className="w-full">
        <input
          type={type}
          className={cn(inputVariants({ size, inputState: derivedState, className }))}
          ref={ref}
          aria-invalid={!!error}
          aria-describedby={message ? `${props.id}-message` : undefined}
          {...props}
        />
        {message && (
          <div
            id={`${props.id}-message`}
            className={cn(
              "mt-1 flex items-center gap-1.5 text-xs",
              error && "text-destructive",
              success && "text-success",
              !error && !success && "text-muted-foreground",
            )}
          >
            {error && <AlertCircle className="size-3.5" aria-hidden="true" />}
            {success && (
              <CheckCircle className="size-3.5" aria-hidden="true" />
            )}
            {!error && !success && helperText && (
              <Info className="size-3.5" aria-hidden="true" />
            )}
            <span>{message}</span>
          </div>
        )}
      </div>
    );
  },
);
Input.displayName = "Input";

export { Input, inputVariants };
