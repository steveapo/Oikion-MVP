import * as React from "react";
import { LucideIcon } from "lucide-react";
import { cva, VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";
import { Card, CardContent } from "./card";

const statGridVariants = cva("grid gap-4", {
  variants: {
    cols: {
      1: "grid-cols-1",
      2: "grid-cols-1 sm:grid-cols-2",
      3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
      4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
    },
  },
  defaultVariants: {
    cols: 4,
  },
});

export interface StatGridProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof statGridVariants> {}

const StatGrid = React.forwardRef<HTMLDivElement, StatGridProps>(
  ({ className, cols, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(statGridVariants({ cols, className }))}
        {...props}
      >
        {children}
      </div>
    );
  },
);
StatGrid.displayName = "StatGrid";

export interface StatCardProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  change?: {
    value: string;
    trend: "up" | "down" | "neutral";
  };
  variant?: "default" | "brand" | "success" | "warning" | "destructive";
}

const StatCard = React.forwardRef<HTMLDivElement, StatCardProps>(
  (
    {
      className,
      label,
      value,
      icon: Icon,
      change,
      variant = "default",
      ...props
    },
    ref,
  ) => {
    const iconColors = {
      default: "text-muted-foreground",
      brand: "text-brand",
      success: "text-success",
      warning: "text-warning",
      destructive: "text-destructive",
    };

    const trendColors = {
      up: "text-success",
      down: "text-destructive",
      neutral: "text-muted-foreground",
    };

    return (
      <Card
        ref={ref}
        className={cn("overflow-hidden", className)}
        padding="comfortable"
        {...props}
      >
        <CardContent className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            <div className="space-y-1">
              <p className="text-3xl font-bold tracking-tight text-foreground">
                {value}
              </p>
              {change && (
                <p className={cn("text-sm font-medium", trendColors[change.trend])}>
                  {change.value}
                </p>
              )}
            </div>
          </div>
          {Icon && (
            <div className={cn("p-2 rounded-lg bg-muted", iconColors[variant])}>
              <Icon className="size-5" aria-hidden="true" />
            </div>
          )}
        </CardContent>
      </Card>
    );
  },
);
StatCard.displayName = "StatCard";

export { StatGrid, statGridVariants, StatCard };
