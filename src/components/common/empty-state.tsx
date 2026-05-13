"use client"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Inbox, Search, FileX, AlertCircle } from "lucide-react"

interface EmptyStateProps {
  title: string
  description?: string
  icon?: "inbox" | "search" | "file" | "custom"
  action?: {
    label: string
    onClick: () => void
  }
  className?: string
}

export function EmptyState({ 
  title, 
  description, 
  icon = "inbox",
  action,
  className 
}: EmptyStateProps) {
  const getIcon = () => {
    switch (icon) {
      case "search":
        return <Search className="h-12 w-12 text-muted-foreground/50" />
      case "file":
        return <FileX className="h-12 w-12 text-muted-foreground/50" />
      default:
        return <Inbox className="h-12 w-12 text-muted-foreground/50" />
    }
  }

  return (
    <div className={cn("flex flex-col items-center justify-center py-12 px-4 text-center", className)}>
      <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
        {getIcon()}
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-muted-foreground max-w-sm mb-6">
          {description}
        </p>
      )}
      {action && (
        <Button onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  )
}

interface ErrorStateProps {
  title?: string
  message?: string
  onRetry?: () => void
  className?: string
}

export function ErrorState({
  title = "Đã xảy ra lỗi",
  message = "Vui lòng thử lại sau",
  onRetry,
  className
}: ErrorStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-12 px-4 text-center", className)}>
      <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
        <AlertCircle className="h-12 w-12 text-destructive" />
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-sm mb-6">
        {message}
      </p>
      {onRetry && (
        <Button variant="outline" onClick={onRetry}>
          Thử lại
        </Button>
      )}
    </div>
  )
}