import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-lg border border-white/75 bg-white/65 backdrop-blur-md px-3 py-2 text-base md:text-xs text-[#0B1723] ring-offset-[#F4F8FA] shadow-[inset_0_1px_2px_rgba(11,23,35,0.06),inset_0_0_0_1px_rgba(11,23,35,0.08),inset_0_-1px_0_rgba(255,255,255,0.75)] placeholder:text-[#526474] transition-[background-color,border-color,box-shadow] duration-150 hover:bg-white/80 focus-visible:bg-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B253B] focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50",
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
