
import * as React from "react"

import type {
  ToastActionElement,
  ToastProps,
} from "@/components/ui/toast"

const TOAST_LIMIT = 5
const TOAST_REMOVE_DELAY = 5000

type ToasterToast = ToastProps & {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: ToastActionElement
  duration?: number
  variant?: "default" | "destructive" | "success" | "warning" | "info"
}

let count = 0

function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER
  return count.toString()
}

const toasts = new Map<string, ToasterToast>()

const observers = new Set<(toasts: Map<string, ToasterToast>) => void>()

function emitChange() {
  observers.forEach((o) => o(new Map(toasts)))
}

export function toast({
  title,
  description,
  action,
  variant = "default",
  duration = 5000,
  ...props
}: Omit<ToasterToast, "id">) {
  const id = genId()

  const newToast: ToasterToast = {
    id,
    title,
    description,
    action,
    variant,
    duration,
    ...props,
  }

  toasts.set(newToast.id, newToast)
  emitChange()

  return {
    id: newToast.id,
    dismiss: () => dismiss(newToast.id),
    update: (props: ToasterToast) => update(newToast.id, props),
  }
}

function dismiss(toastId: string) {
  toasts.delete(toastId)
  emitChange()
}

function update(toastId: string, toast: ToasterToast) {
  if (toasts.has(toastId)) {
    const newToast = { ...toasts.get(toastId), ...toast }
    toasts.set(toastId, newToast)
    emitChange()
  }
}

export function useToast() {
  const [toastState, setToastState] = React.useState<Map<string, ToasterToast>>(
    new Map()
  )

  React.useEffect(() => {
    observers.add(setToastState)
    return () => {
      observers.delete(setToastState)
    }
  }, [])

  return {
    toasts: Array.from(toastState.values()),
    toast,
    dismiss,
    update,
  }
}

// Convenience wrappers for different toast types
toast.error = (message: string, options = {}) => {
  return toast({
    variant: "destructive",
    title: "Error",
    description: message,
    ...options,
  })
}

toast.success = (message: string, options = {}) => {
  return toast({
    variant: "success",
    title: "Success",
    description: message,
    ...options,
  })
}

toast.warning = (message: string, options = {}) => {
  return toast({
    variant: "warning",
    title: "Warning",
    description: message,
    ...options,
  })
}

toast.info = (message: string, options = {}) => {
  return toast({
    variant: "info",
    title: "Info",
    description: message,
    ...options,
  })
}
