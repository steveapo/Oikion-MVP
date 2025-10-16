import * as React from "react";
import { cva, VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const pageHeaderVariants = cva("space-y-2", {
  variants: {
    spacing: {
      tight: "pb-4",
      default: "pb-6",
      comfortable: "pb-8",
      spacious: "pb-10",
    },
    align: {
      start: "text-left",
      center: "text-center items-center",
      end: "text-right items-end",
    },
  },
  defaultVariants: {
    spacing: "default",
    align: "start",
  },
});

export interface PageHeaderProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof pageHeaderVariants> {
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
}

const PageHeader = React.forwardRef<HTMLDivElement, PageHeaderProps>(
  (
    { className, spacing, align, title, description, actions, ...props },
    ref,
  ) => {
    return (
      <div
        ref={ref}
        className={cn(pageHeaderVariants({ spacing, align, className }))}
        {...props}
      >
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="space-y-1.5 flex-1 min-w-0">
            {typeof title === "string" ? (
              <h1 className="text-3xl font-bold tracking-tight text-foreground">
                {title}
              </h1>
            ) : (
              title
            )}
            {description && (
              <div className="text-sm text-muted-foreground max-w-2xl">
                {description}
              </div>
            )}
          </div>
          {actions && (
            <div className="flex items-center gap-2 flex-shrink-0">
              {actions}
            </div>
          )}
        </div>
      </div>
    );
  },
);
PageHeader.displayName = "PageHeader";

export { PageHeader, pageHeaderVariants };
