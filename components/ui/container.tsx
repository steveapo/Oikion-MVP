import * as React from "react";
import { cva, VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const containerVariants = cva("mx-auto w-full", {
  variants: {
    maxWidth: {
      sm: "max-w-screen-sm",
      md: "max-w-screen-md",
      lg: "max-w-screen-lg",
      xl: "max-w-screen-xl",
      "2xl": "max-w-screen-2xl",
      full: "max-w-full",
    },
    padding: {
      none: "px-0",
      default: "px-4 sm:px-4 md:px-6 lg:px-6 xl:px-8 2xl:px-8",
      tight: "px-2 sm:px-2 md:px-4 lg:px-4 xl:px-6 2xl:px-6",
      wide: "px-6 sm:px-6 md:px-8 lg:px-8 xl:px-10 2xl:px-10",
    },
  },
  defaultVariants: {
    maxWidth: "2xl",
    padding: "default",
  },
});

export interface ContainerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof containerVariants> {}

const Container = React.forwardRef<HTMLDivElement, ContainerProps>(
  ({ className, maxWidth, padding, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(containerVariants({ maxWidth, padding, className }))}
        {...props}
      />
    );
  },
);
Container.displayName = "Container";

export { Container, containerVariants };
