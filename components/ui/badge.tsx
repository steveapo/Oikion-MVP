import * as React from "react";
import { VariantProps, cva } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center border rounded-full font-semibold transition-all duration-fast focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "bg-primary hover:bg-primary/80 border-transparent text-primary-foreground",
        brand:
          "bg-brand hover:bg-brand/90 border-transparent text-brand-foreground",
        secondary:
          "bg-secondary hover:bg-secondary/80 border-transparent text-secondary-foreground",
        success:
          "bg-success hover:bg-success/90 border-transparent text-success-foreground",
        warning:
          "bg-warning hover:bg-warning/90 border-transparent text-warning-foreground",
        destructive:
          "bg-destructive hover:bg-destructive/90 border-transparent text-destructive-foreground",
        outline:
          "text-foreground border-border hover:bg-accent hover:text-accent-foreground",
        "brand-outline":
          "text-brand border-brand/30 bg-brand/5 hover:bg-brand/10",
        "success-outline":
          "text-success border-success/30 bg-success/5 hover:bg-success/10",
        "warning-outline":
          "text-warning border-warning/30 bg-warning/5 hover:bg-warning/10",
        "destructive-outline":
          "text-destructive border-destructive/30 bg-destructive/5 hover:bg-destructive/10",
      },
      size: {
        sm: "px-2 py-0.5 text-xs",
        default: "px-2.5 py-0.5 text-xs",
        lg: "px-3 py-1 text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, size, ...props }: BadgeProps) {
  return (
    <div
      className={cn(badgeVariants({ variant, size }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
