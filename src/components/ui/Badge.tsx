import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors select-none",
  {
    variants: {
      variant: {
        success: "bg-[#ccf6c5] text-[#34a853]",
        info: "bg-[#c3ecf6] text-[#4285f4]",
        warning: "bg-[#ffe7a5] text-[#1e1e1e]",
        danger: "bg-[#f8d8d8] text-[#ea4335]",
        neutral: "bg-[#f0f0f0] text-[#1e1e1e]/60",
      },
    },
    defaultVariants: {
      variant: "neutral",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }

