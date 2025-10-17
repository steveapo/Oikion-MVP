import * as React from "react";
import Link from "next/link";
import { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "./button";

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
}

const EmptyState = React.forwardRef<HTMLDivElement, EmptyStateProps>(
  ({ className, icon: Icon, title, description, action, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex flex-col items-center justify-center gap-4 py-12 px-4 text-center",
          className,
        )}
        {...props}
      >
        {Icon && (
          <div className="rounded-full bg-muted p-3">
            <Icon className="size-12 text-muted-foreground" aria-hidden="true" />
          </div>
        )}
        <div className="space-y-2 max-w-md">
          <h3 className="text-xl font-semibold text-foreground">{title}</h3>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
        {action && (
          action.href ? (
            <Button asChild className="mt-2">
              <Link href={action.href}>{action.label}</Link>
            </Button>
          ) : action.onClick ? (
            <Button onClick={action.onClick} className="mt-2">
              {action.label}
            </Button>
          ) : null
        )}
      </div>
    );
  },
);
EmptyState.displayName = "EmptyState";

export { EmptyState };
