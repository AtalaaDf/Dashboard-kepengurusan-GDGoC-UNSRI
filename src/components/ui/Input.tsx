import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  isError?: boolean
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, isError, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex min-h-[40px] w-full rounded-lg border bg-white px-3 py-2 text-sm text-[#1e1e1e] transition-colors outline-none file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-[#1e1e1e]/40 disabled:cursor-not-allowed disabled:opacity-50",
          isError
            ? "border-[#ea4335] focus:ring-2 focus:ring-[#ea4335]/30 focus:border-[#ea4335]"
            : "border-[#1e1e1e]/20 focus:ring-2 focus:ring-[#4285f4]/30 focus:border-[#4285f4]",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
