"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuthStore } from "@/features/auth/store/authStore"

interface HomeActionsProps {
  variant: "hero" | "cta"
}

export function HomeActions({ variant }: HomeActionsProps) {
  const { isAuth } = useAuthStore()
  const showRegister = isAuth !== true

  if (variant === "hero") {
    return (
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        {showRegister && (
          <Link href="/register">
            <Button size="lg" className="gap-2">
              Đăng ký ngay
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        )}
        <Link href="/activities">
          <Button size="lg" variant="outline">
            Khám phá hoạt động
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
      {showRegister && (
        <Link href="/register">
          <Button
            size="lg"
            variant="secondary"
            className="gap-2 px-8 shadow-lg"
          >
            Đăng ký ngay
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      )}
      <Link href="/activities">
        <Button
          size="lg"
          variant="outline"
          className="border-primary-foreground/30 px-8 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
        >
          Khám phá hoạt động
        </Button>
      </Link>
    </div>
  )
}
