import { Suspense } from "react"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { LoginForm } from "./login-form"

interface LoginPageProps {
  searchParams: Promise<{ callbackUrl?: string }>
}

function getSafeCallbackUrl(callbackUrl?: string): string {
  if (!callbackUrl || !callbackUrl.startsWith("/") || callbackUrl.startsWith("//")) {
    return "/"
  }
  return callbackUrl
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const cookieStore = await cookies()
  const token = cookieStore.get("access_token")?.value

  const { callbackUrl } = await searchParams
  const dest = getSafeCallbackUrl(callbackUrl)

  if (token) {
    redirect(dest)
  }

  return (
    <Suspense fallback={null}>
      <LoginForm callbackUrl={dest} />
    </Suspense>
  )
}
