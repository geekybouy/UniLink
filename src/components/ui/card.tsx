
import * as React from "react"

import { cn } from "@/lib/utils"

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { 
    variant?: "default" | "bordered" | "ghost" | "elevated" | "interactive" 
    hoverEffect?: "lift" | "scale" | "glow" | "border" | "none"
  }
>(({ className, variant = "default", hoverEffect = "none", ...props }, ref) => {
  const variantClasses = {
    default: "rounded-lg border bg-card text-card-foreground shadow-sm",
    bordered: "rounded-lg border-2 bg-card text-card-foreground",
    ghost: "rounded-lg bg-transparent text-card-foreground",
    elevated: "rounded-lg border bg-card text-card-foreground shadow-md",
    interactive: "rounded-lg border bg-card text-card-foreground shadow-sm hover:shadow-md transition-shadow cursor-pointer",
  }
  
  const hoverClasses = {
    none: "",
    lift: "transition-transform duration-200 ease-out hover:-translate-y-1",
    scale: "transition-transform duration-200 ease-out hover:scale-[1.02]",
    glow: "transition-all duration-200 ease-out dark:hover:shadow-[0_0_15px_rgba(93,158,255,0.15)] hover:shadow-[0_0_15px_rgba(0,0,0,0.1)]",
    border: "transition-all duration-200 ease-out hover:border-primary/50",
  }
  
  return (
    <div
      ref={ref}
      className={cn(
        variantClasses[variant],
        hoverEffect !== "none" && hoverClasses[hoverEffect],
        className
      )}
      {...props}
    />
  )
})
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement> & { 
    as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6"
  }
>(({ className, as = "h3", ...props }, ref) => {
  const Component = as;
  
  return (
    <Component
      ref={ref}
      className={cn(
        "text-2xl font-semibold leading-none tracking-tight",
        className
      )}
      {...props}
    />
  )
})
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
