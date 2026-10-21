import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-surface-inverse text-white shadow-xs",
        secondary:
          "border-transparent bg-surface-sunken text-neutral-800 hover:bg-line/80",
        destructive:
          "border-transparent bg-danger text-white shadow-xs",
        outline: "text-neutral-800 border-line-strong",
        gold: "border-brand-gold-600/30 bg-brand-gold-600/10 text-brand-gold-800",
        emerald: "border-success-line bg-success-soft text-success",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
