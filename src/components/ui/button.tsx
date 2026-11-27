import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium tracking-[-0.005em] ring-offset-[#F6FFFF] transition-[transform,background-color,border-color,color,box-shadow] duration-150 [transition-timing-function:cubic-bezier(0.23,1,0.32,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B253B] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 select-none touch-manipulation [@media(hover:hover)_and_(pointer:fine)]:hover:-translate-y-[1px] active:translate-y-[1px] active:scale-[0.985] active:duration-75 cursor-pointer [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-[#006EB3] text-white shadow-[0_1px_2px_rgba(11,37,59,0.12)] hover:bg-[#00588F] hover:shadow-[0_4px_12px_-2px_rgba(0,110,179,0.28)] active:bg-[#075985]",
        destructive:
          "bg-[#DC2626] text-white shadow-[0_1px_2px_rgba(185,28,28,0.14)] hover:bg-[#B91C1C] hover:shadow-[0_4px_12px_-2px_rgba(220,38,38,0.24)] active:bg-[#991B1B]",
        outline:
          "border border-[#D5E4E4] bg-white/95 text-[#0B253B] shadow-[0_1px_2px_rgba(11,37,59,0.04)] hover:bg-[#D5ECEB]/55 hover:border-[#9EC7C6] hover:text-[#071422] active:bg-[#D5ECEB]/85",
        secondary:
          "border border-[#B0D4D3] bg-[#D5ECEB] text-[#0B253B] hover:bg-[#C3E5E4] hover:border-[#8DBBB9] hover:text-[#071422] active:bg-[#B3DCDB]",
        ghost:
          "text-[#2D4659] hover:bg-[#D5ECEB]/60 hover:text-[#071422] active:bg-[#D5ECEB]",
        link:
          "text-[#006EB3] underline-offset-4 hover:underline hover:text-[#00588F] [@media(hover:hover)_and_(pointer:fine)]:hover:translate-y-0 active:translate-y-0 active:scale-100",
      },
      size: {
        default: "h-10 px-4 py-2 text-xs md:text-sm",
        sm: "h-9 rounded-md px-3 text-xs",
        lg: "h-11 rounded-md px-8 text-sm",
        icon: "h-9 w-9 rounded-md",
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
