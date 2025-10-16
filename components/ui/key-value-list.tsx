import * as React from "react";
import { cva, VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const keyValueListVariants = cva("divide-y divide-border", {
  variants: {
    spacing: {
      tight: "[&>*]:py-2",
      default: "[&>*]:py-3",
      comfortable: "[&>*]:py-4",
    },
  },
  defaultVariants: {
    spacing: "default",
  },
});

export interface KeyValueListProps
  extends React.HTMLAttributes<HTMLDListElement>,
    VariantProps<typeof keyValueListVariants> {}

const KeyValueList = React.forwardRef<HTMLDListElement, KeyValueListProps>(
  ({ className, spacing, children, ...props }, ref) => {
    return (
      <dl
        ref={ref}
        className={cn(keyValueListVariants({ spacing, className }))}
        {...props}
      >
        {children}
      </dl>
    );
  },
);
KeyValueList.displayName = "KeyValueList";

export interface KeyValueItemProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  value: React.ReactNode;
  layout?: "horizontal" | "vertical";
}

const KeyValueItem = React.forwardRef<HTMLDivElement, KeyValueItemProps>(
  ({ className, label, value, layout = "horizontal", ...props }, ref) => {
    if (layout === "vertical") {
      return (
        <div ref={ref} className={cn("space-y-1", className)} {...props}>
          <dt className="text-sm font-medium text-muted-foreground">{label}</dt>
          <dd className="text-sm text-foreground">{value}</dd>
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className={cn("flex justify-between items-start gap-4", className)}
        {...props}
      >
        <dt className="text-sm font-medium text-muted-foreground flex-shrink-0">
          {label}
        </dt>
        <dd className="text-sm text-foreground text-right">{value}</dd>
      </div>
    );
  },
);
KeyValueItem.displayName = "KeyValueItem";

export { KeyValueList, keyValueListVariants, KeyValueItem };
