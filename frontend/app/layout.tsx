import type { Metadata } from "next"
import { Plus_Jakarta_Sans } from "next/font/google"
import { JsonLdScript, OrganizationJsonLd } from "next-seo"
import "./globals.css"
import { Providers } from "@/lib/providers"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import {
  DEFAULT_DESCRIPTION,
  ORGANIZATION_NAME,
  SITE_NAME,
  SITE_URL,
  absoluteUrl,
} from "@/lib/seo"

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-geist-sans",
})

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} - Dẫn lối hành trình Sinh viên 5 Tốt`,
    template: `%s | ${SITE_NAME}`,
  },
  description: DEFAULT_DESCRIPTION,
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    type: "website",
    locale: "vi_VN",
    siteName: SITE_NAME,
    title: `${SITE_NAME} - Dẫn lối hành trình Sinh viên 5 Tốt`,
    description: DEFAULT_DESCRIPTION,
    url: SITE_URL,
    images: [
      {
        url: absoluteUrl("/fallback-cube-box.png"),
        width: 1200,
        height: 630,
        alt: SITE_NAME,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} - Dẫn lối hành trình Sinh viên 5 Tốt`,
    description: DEFAULT_DESCRIPTION,
    images: [absoluteUrl("/fallback-cube-box.png")],
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="vi" className={plusJakartaSans.variable}>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <OrganizationJsonLd
          scriptId="organization-jsonld"
          scriptKey="organization-jsonld"
          name={ORGANIZATION_NAME}
          url={SITE_URL}
          logo={absoluteUrl("/fallback-cube-box.png")}
          description={DEFAULT_DESCRIPTION}
        />
        <JsonLdScript
          id="website-jsonld"
          scriptKey="website-jsonld"
          data={{
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: SITE_NAME,
            url: SITE_URL,
            description: DEFAULT_DESCRIPTION,
            publisher: {
              "@type": "Organization",
              name: ORGANIZATION_NAME,
            },
          }}
        />
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
