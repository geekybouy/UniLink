
import { cn } from "@/lib/utils"

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "card" | "avatar" | "button" | "text";
  animation?: "pulse" | "shimmer" | "none";
}

function Skeleton({
  className,
  variant = "default",
  animation = "pulse",
  ...props
}: SkeletonProps) {
  const baseClasses = "rounded-md bg-muted";
  
  const variantClasses = {
    default: "",
    card: "w-full h-32",
    avatar: "h-10 w-10 rounded-full",
    button: "h-10 w-20",
    text: "h-4 w-full",
  };
  
  const animationClasses = {
    pulse: "animate-pulse",
    shimmer: "skeleton",
    none: "",
  };
  
  return (
    <div
      className={cn(
        baseClasses,
        variantClasses[variant],
        animationClasses[animation],
        className
      )}
      {...props}
    />
  )
}

export { Skeleton }
