import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { RegisterForm } from "./register-form"

export default async function RegisterPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get("access_token")?.value

  if (token) {
    redirect("/")
  }

  return <RegisterForm />
}