import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)] active:bg-[var(--color-primary-active)]",
        destructive:
          "bg-[var(--color-danger)] text-white hover:opacity-90",
        outline:
          "border border-[var(--color-border-strong)] bg-[var(--color-surface)] text-[var(--color-fg1)] hover:bg-[var(--color-surface-hover)]",
        secondary:
          "bg-[var(--color-surface-muted)] text-[var(--color-fg1)] hover:bg-[var(--color-surface-hover)]",
        ghost:
          "text-[var(--color-fg2)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-fg1)]",
        link:
          "text-[var(--color-primary)] underline-offset-4 hover:underline",
        warning:
          "bg-[var(--color-warn)] text-white hover:opacity-90",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-7 rounded-md px-2.5 text-xs",
        lg: "h-11 rounded-md px-6 text-sm font-semibold",
        xl: "h-14 rounded-lg px-8 text-base font-semibold",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };