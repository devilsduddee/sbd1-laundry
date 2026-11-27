import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"

import { cn } from "@/lib/utils"

const Tabs = TabsPrimitive.Root

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      "inline-flex h-10 items-center justify-center rounded-full border border-white/65 bg-[#0B1723]/[0.05] backdrop-blur-md p-1 text-[#526474] shadow-[inset_0_1px_2px_rgba(11,23,35,0.06)]",
      className
    )}
    {...props}
  />
))
TabsList.displayName = TabsPrimitive.List.displayName

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      "inline-flex items-center justify-center whitespace-nowrap rounded-full px-3.5 py-1.5 text-sm font-medium ring-offset-[#F4F8FA] transition-[color,background-color,box-shadow] duration-150 [transition-timing-function:cubic-bezier(0.22,0.8,0.3,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B253B] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:text-[#0B1723] data-[state=active]:bg-white/90 data-[state=active]:text-[#0B1723] data-[state=active]:shadow-[0_2px_8px_-2px_rgba(11,23,35,0.12),inset_0_1px_0_rgba(255,255,255,0.95)]",
      className
    )}
    {...props}
  />
))
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-2 ring-offset-[#F8FAFA] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B253B] focus-visible:ring-offset-2",
      className
    )}
    {...props}
  />
))
TabsContent.displayName = TabsPrimitive.Content.displayName

export { Tabs, TabsList, TabsTrigger, TabsContent }
