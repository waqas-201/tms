import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-[#14281D] focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-[#14281D] text-white shadow-xs",
        secondary:
          "border-transparent bg-stone-100 text-stone-800 hover:bg-stone-200/80",
        destructive:
          "border-transparent bg-rose-500 text-white shadow-xs",
        outline: "text-stone-800 border-stone-300",
        gold: "border-[#9E7D3B]/30 bg-[#9E7D3B]/10 text-[#725721]",
        emerald: "border-emerald-200 bg-emerald-50 text-emerald-800",
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
