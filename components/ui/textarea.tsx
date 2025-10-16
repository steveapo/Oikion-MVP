import * as React from "react";
import { cva, VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const textareaVariants = cva(
  "flex w-full rounded-md border bg-transparent px-3 py-2 ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-fast resize-y",
  {
    variants: {
      size: {
        sm: "min-h-[80px] text-sm",
        default: "min-h-[100px] text-base md:text-sm",
        lg: "min-h-[120px] text-base",
      },
      textareaState: {
        default: "border-input hover:border-neutral-9 focus-visible:border-ring",
        error:
          "border-destructive bg-destructive/5 focus-visible:ring-destructive",
      },
      autoResize: {
        true: "resize-none overflow-hidden",
        false: "resize-y",
      },
    },
    defaultVariants: {
      size: "default",
      textareaState: "default",
      autoResize: false,
    },
  },
);

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    VariantProps<typeof textareaVariants> {
  error?: string;
  helperText?: string;
  showCharCount?: boolean;
  autoResize?: boolean;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      className,
      size,
      textareaState = "default",
      error,
      helperText,
      showCharCount = false,
      autoResize = false,
      maxLength,
      onChange,
      ...props
    },
    ref,
  ) => {
    const [charCount, setCharCount] = React.useState(0);
    const textareaRef = React.useRef<HTMLTextAreaElement | null>(null);

    const derivedState = error ? "error" : textareaState;

    // Auto-resize functionality
    React.useEffect(() => {
      if (autoResize && textareaRef.current) {
        const textarea = textareaRef.current;
        textarea.style.height = "auto";
        textarea.style.height = `${textarea.scrollHeight}px`;
      }
    }, [autoResize, props.value]);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setCharCount(e.target.value.length);
      if (autoResize && textareaRef.current) {
        textareaRef.current.style.height = "auto";
        textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
      }
      onChange?.(e);
    };

    return (
      <div className="w-full">
        <textarea
          className={cn(
            textareaVariants({
              size,
              textareaState: derivedState,
              autoResize,
              className,
            }),
          )}
          ref={(node) => {
            textareaRef.current = node;
            if (typeof ref === "function") {
              ref(node);
            } else if (ref) {
              ref.current = node;
            }
          }}
          aria-invalid={!!error}
          aria-describedby={
            error || helperText || showCharCount
              ? `${props.id}-message`
              : undefined
          }
          maxLength={maxLength}
          onChange={handleChange}
          {...props}
        />
        {(error || helperText || showCharCount) && (
          <div
            id={`${props.id}-message`}
            className="mt-1 flex items-center justify-between gap-2"
          >
            <div
              className={cn(
                "text-xs",
                error && "text-destructive",
                !error && "text-muted-foreground",
              )}
            >
              {error || helperText}
            </div>
            {showCharCount && (
              <div className="text-xs text-muted-foreground">
                {charCount}
                {maxLength && `/${maxLength}`}
              </div>
            )}
          </div>
        )}
      </div>
    );
  },
);
Textarea.displayName = "Textarea";

export { Textarea, textareaVariants };
