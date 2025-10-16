import * as React from "react";
import { cva, VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const cardVariants = cva(
  "overflow-hidden rounded-lg border bg-card text-card-foreground transition-all duration-fast",
  {
    variants: {
      padding: {
        compact: "[&>[data-card-content]]:p-4 [&>[data-card-header]]:p-4 [&>[data-card-footer]]:p-4",
        comfortable: "[&>[data-card-content]]:p-6 [&>[data-card-header]]:p-6 [&>[data-card-footer]]:p-6",
        spacious: "[&>[data-card-content]]:p-8 [&>[data-card-header]]:p-8 [&>[data-card-footer]]:p-8",
      },
      elevation: {
        e0: "shadow-e0",
        e1: "shadow-e1",
        e2: "shadow-e2",
      },
      hoverable: {
        true: "hover:shadow-e1 cursor-pointer",
        false: "",
      },
    },
    defaultVariants: {
      padding: "comfortable",
      elevation: "e0",
      hoverable: false,
    },
  },
);

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, padding, elevation, hoverable, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(cardVariants({ padding, elevation, hoverable, className }))}
      {...props}
    />
  ),
);
Card.displayName = "Card";

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-card-header
    className={cn("flex flex-col space-y-1.5", className)}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-xl font-semibold leading-none tracking-tight",
      className,
    )}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-card-content
    className={cn("pt-0", className)}
    {...props}
  />
));
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-card-footer
    className={cn("flex items-center pt-0 border-t mt-4 pt-4", className)}
    {...props}
  />
));
CardFooter.displayName = "CardFooter";

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
  cardVariants,
};
