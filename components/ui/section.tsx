import * as React from "react";
import { cva, VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * Section Component - Used for major content sections with consistent vertical rhythm
 */
const sectionVariants = cva("w-full", {
  variants: {
    spacing: {
      none: "py-0",
      tight: "py-6",
      default: "py-8 md:py-10",
      comfortable: "py-10 md:py-12",
      spacious: "py-12 md:py-16",
    },
  },
  defaultVariants: {
    spacing: "default",
  },
});

export interface SectionProps
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof sectionVariants> {
  as?: "section" | "div" | "article" | "aside";
}

const Section = React.forwardRef<HTMLElement, SectionProps>(
  ({ className, spacing, as: Component = "section", ...props }, ref) => {
    return (
      <Component
        ref={ref as any}
        className={cn(sectionVariants({ spacing, className }))}
        {...props}
      />
    );
  },
);
Section.displayName = "Section";

/**
 * Stack Component - Vertical layout with consistent gaps
 */
const stackVariants = cva("flex flex-col", {
  variants: {
    gap: {
      none: "gap-0",
      xs: "gap-1",
      sm: "gap-2",
      default: "gap-4",
      md: "gap-6",
      lg: "gap-8",
      xl: "gap-10",
      "2xl": "gap-12",
    },
    align: {
      start: "items-start",
      center: "items-center",
      end: "items-end",
      stretch: "items-stretch",
    },
    justify: {
      start: "justify-start",
      center: "justify-center",
      end: "justify-end",
      between: "justify-between",
      around: "justify-around",
    },
  },
  defaultVariants: {
    gap: "default",
    align: "stretch",
    justify: "start",
  },
});

export interface StackProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof stackVariants> {}

const Stack = React.forwardRef<HTMLDivElement, StackProps>(
  ({ className, gap, align, justify, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(stackVariants({ gap, align, justify, className }))}
        {...props}
      />
    );
  },
);
Stack.displayName = "Stack";

/**
 * Inline Component - Horizontal layout with wrapping and consistent gaps
 */
const inlineVariants = cva("flex flex-wrap", {
  variants: {
    gap: {
      none: "gap-0",
      xs: "gap-1",
      sm: "gap-2",
      default: "gap-4",
      md: "gap-6",
      lg: "gap-8",
    },
    align: {
      start: "items-start",
      center: "items-center",
      end: "items-end",
      baseline: "items-baseline",
      stretch: "items-stretch",
    },
    justify: {
      start: "justify-start",
      center: "justify-center",
      end: "justify-end",
      between: "justify-between",
      around: "justify-around",
    },
  },
  defaultVariants: {
    gap: "default",
    align: "center",
    justify: "start",
  },
});

export interface InlineProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof inlineVariants> {}

const Inline = React.forwardRef<HTMLDivElement, InlineProps>(
  ({ className, gap, align, justify, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(inlineVariants({ gap, align, justify, className }))}
        {...props}
      />
    );
  },
);
Inline.displayName = "Inline";

export {
  Section,
  sectionVariants,
  Stack,
  stackVariants,
  Inline,
  inlineVariants,
};
