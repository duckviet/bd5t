"use client"

import * as React from "react"
import { useMediaQuery } from "@/hooks/use-media-query"
import { cn } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "./dialog"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  DrawerFooter,
  DrawerClose,
} from "./drawer"

export function ResponsiveDialog({ children, ...props }: React.ComponentProps<typeof Dialog>) {
  const { isMobile } = useMediaQuery()

  if (isMobile) {
    return <Drawer {...props}>{children}</Drawer>
  }

  return <Dialog {...props}>{children}</Dialog>
}

export function ResponsiveDialogTrigger({ children, ...props }: React.ComponentProps<typeof DialogTrigger>) {
  const { isMobile } = useMediaQuery()

  if (isMobile) {
    return <DrawerTrigger {...props}>{children}</DrawerTrigger>
  }

  return <DialogTrigger {...props}>{children}</DialogTrigger>
}

export function ResponsiveDialogClose({ children, ...props }: React.ComponentProps<typeof DialogClose>) {
  const { isMobile } = useMediaQuery()

  if (isMobile) {
    return <DrawerClose {...props}>{children}</DrawerClose>
  }

  return <DialogClose {...props}>{children}</DialogClose>
}

export function ResponsiveDialogContent({ className, children, ...props }: React.ComponentProps<typeof DialogContent>) {
  const { isMobile } = useMediaQuery()

  if (isMobile) {
    return <DrawerContent className={cn("p-4 bg-white", className)} {...props}>{children}</DrawerContent>
  }

  return <DialogContent className={cn("p-4 bg-white", className)} {...props}>{children}</DialogContent>
}

export function ResponsiveDialogHeader({ className, children, ...props }: React.ComponentProps<typeof DialogHeader>) {
  const { isMobile } = useMediaQuery()

  if (isMobile) {
    return <DrawerHeader className={className} {...props}>{children}</DrawerHeader>
  }

  return <DialogHeader className={className} {...props}>{children}</DialogHeader>
}

export function ResponsiveDialogFooter({ className, children, ...props }: React.ComponentProps<typeof DialogFooter>) {
  const { isMobile } = useMediaQuery()

  if (isMobile) {
    return <DrawerFooter className={className} {...props}>{children}</DrawerFooter>
  }

  return <DialogFooter className={className} {...props}>{children}</DialogFooter>
}

export function ResponsiveDialogTitle({ className, children, ...props }: React.ComponentProps<typeof DialogTitle>) {
  const { isMobile } = useMediaQuery()

  if (isMobile) {
    return <DrawerTitle className={className} {...props}>{children}</DrawerTitle>
  }

  return <DialogTitle className={className} {...props}>{children}</DialogTitle>
}

export function ResponsiveDialogDescription({ className, children, ...props }: React.ComponentProps<typeof DialogDescription>) {
  const { isMobile } = useMediaQuery()

  if (isMobile) {
    return <DrawerDescription className={className} {...props}>{children}</DrawerDescription>
  }

  return <DialogDescription className={className} {...props}>{children}</DialogDescription>
}
