import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[#4285f4] focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-50 min-h-[40px] px-4 py-2",
  {
    variants: {
      variant: {
        default:
          "bg-[#4285f4] text-white hover:bg-[#3367d6]",
        destructive:
          "bg-[#ea4335] text-white hover:bg-[#d93025]",
        outline:
          "border border-[#1e1e1e]/20 bg-white text-[#1e1e1e] hover:bg-[#f0f0f0]",
        secondary:
          "bg-[#f0f0f0] text-[#1e1e1e] hover:bg-[#e4e4e4]",
        ghost:
          "hover:bg-[#f0f0f0] text-[#1e1e1e]",
        link:
          "text-[#4285f4] underline-offset-4 hover:underline",
      },
      size: {
        default: "min-h-[40px] px-4 py-2",
        sm: "h-9 rounded-md px-3 text-xs min-h-[36px]",
        lg: "h-11 rounded-md px-8 min-h-[44px]",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
