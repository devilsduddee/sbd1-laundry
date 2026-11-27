import * as React from "react"
import { Slot, Slottable } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "relative inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium tracking-[-0.005em] ring-offset-[#F4F8FA] transition-[transform,background-color,border-color,color,box-shadow] duration-150 [transition-timing-function:cubic-bezier(0.22,0.8,0.3,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B253B] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 select-none touch-manipulation [@media(hover:hover)_and_(pointer:fine)]:hover:-translate-y-[1px] active:translate-y-[1px] active:scale-[0.985] active:duration-75 cursor-pointer [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "overflow-hidden glass-btn-primary text-white",
        destructive: "overflow-hidden glass-btn-destructive text-white",
        outline: "overflow-hidden glass-btn-soft text-[#0B1723]",
        secondary: "overflow-hidden glass-btn-tonal text-[#006EB3]",
        ghost:
          "overflow-hidden text-[#2E3E4E] hover:bg-white/75 hover:text-[#0B1723] active:bg-white/90",
        link:
          "text-[#006EB3] underline-offset-4 hover:underline hover:text-[#00558A] [@media(hover:hover)_and_(pointer:fine)]:hover:translate-y-0 active:translate-y-0 active:scale-100",
      },
      size: {
        default: "h-11 sm:h-10 px-5 py-2 text-xs md:text-sm",
        sm: "h-11 sm:h-9 px-3.5 text-xs",
        lg: "h-11 px-8 text-sm",
        icon: "h-11 w-11 sm:h-9 sm:w-9 p-0",
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
  ({ className, variant, size, asChild = false, onPointerDown, children, ...props }, ref) => {
    const bloomRef = React.useRef<HTMLSpanElement | null>(null)
    const Comp = asChild ? Slot : "button"

    const handlePointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
      onPointerDown?.(e)
      if (e.defaultPrevented || props.disabled || variant === "link") return
      if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        return
      }
      const el = bloomRef.current
      const target = e.currentTarget
      if (!el || !target) return
      const rect = target.getBoundingClientRect()
      const diameter = Math.max(rect.width, rect.height) * 2
      el.style.width = `${diameter}px`
      el.style.height = `${diameter}px`
      el.style.left = `${e.clientX - rect.left - diameter / 2}px`
      el.style.top = `${e.clientY - rect.top - diameter / 2}px`
      el.animate?.(
        [
          { opacity: 0, transform: "scale(0.1)" },
          { opacity: 0.75, transform: "scale(0.45)", offset: 0.2 },
          { opacity: 0, transform: "scale(1)" },
        ],
        { duration: 520, easing: "cubic-bezier(0.22, 0.8, 0.3, 1)" }
      )
    }

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        onPointerDown={handlePointerDown}
        {...props}
      >
        {variant !== "link" && (
          <span ref={bloomRef} className="lg-button-bloom" aria-hidden="true" />
        )}
        <Slottable>{children}</Slottable>
      </Comp>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
