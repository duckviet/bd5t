import type { Metadata } from "next"
import { Plus_Jakarta_Sans } from "next/font/google"
import "./globals.css"
import { Providers } from "@/lib/providers"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-geist-sans",
})

export const metadata: Metadata = {
  title: "Bản đồ 5 Tốt - Dẫn lối hành trình Sinh viên 5 Tốt",
  description: "Nền tảng số hỗ trợ sinh viên Trường Đại học Ngoại ngữ - ĐHQGHN tiếp cận, theo dõi và hoàn thành các tiêu chí của phong trào Sinh viên 5 Tốt",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="vi" className={plusJakartaSans.variable}>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <Providers>
          <Navbar />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  )
}