import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { BreadcrumbJsonLd } from "next-seo"
import {
  ArrowLeft,
  Scale,
  GraduationCap,
  Dumbbell,
  Heart,
  Globe,
  Info,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { absoluteUrl, createMetadata } from "@/lib/seo"
import { CRITERIA_LEVELS_DATA } from "@/lib/constants/criteria-data"

interface CriteriaDetailPageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return [
    { slug: "truong" },
    { slug: "dhqghn" },
    { slug: "thanh-pho" },
    { slug: "trung-uong" },
  ]
}

export async function generateMetadata({
  params,
}: CriteriaDetailPageProps): Promise<Metadata> {
  const { slug } = await params
  const data = CRITERIA_LEVELS_DATA[slug]

  if (!data) {
    return createMetadata({
      title: "Tiêu chí xét chọn",
      path: `/criteria/${slug}`,
    })
  }

  return createMetadata({
    title: data.title,
    description: data.description,
    path: `/criteria/${slug}`,
  })
}

const STANDARDS_CONFIG = [
  {
    key: "ethics" as const,
    label: "Đạo đức tốt",
    icon: Scale,
  },
  {
    key: "study" as const,
    label: "Học tập tốt",
    icon: GraduationCap,
  },
  {
    key: "health" as const,
    label: "Thể lực tốt",
    icon: Dumbbell,
  },
  {
    key: "volunteer" as const,
    label: "Tình nguyện tốt",
    icon: Heart,
  },
  {
    key: "integration" as const,
    label: "Hội nhập tốt",
    icon: Globe,
  },
]

export default async function CriteriaDetailPage({
  params,
}: CriteriaDetailPageProps) {
  const { slug } = await params
  const data = CRITERIA_LEVELS_DATA[slug]

  if (!data) {
    notFound()
  }

  const reviewLevelLabels = {
    TRUONG: "Cấp Trường",
    DHQGHN: "Cấp ĐHQGHN",
    THANH_PHO: "Cấp Thành phố",
    TRUNG_UONG: "Cấp Trung ương",
  }

  return (
    <div className="min-h-screen py-12">
      <BreadcrumbJsonLd
        scriptId="criteria-detail-breadcrumb-jsonld"
        scriptKey="criteria-detail-breadcrumb-jsonld"
        items={[
          { name: "Trang chủ", item: absoluteUrl("/") },
          { name: "Tiêu chí xét chọn", item: absoluteUrl("/criteria") },
          { name: data.title, item: absoluteUrl(`/criteria/${slug}`) },
        ]}
      />

      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* Back Link */}
        <Link
          href="/criteria"
          className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Quay lại danh sách tiêu chí
        </Link>


        {/* Header */}
        <header className="relative rounded-2xl overflow-hidden border border-border p-8 md:p-10 mb-8 bg-linear-to-r from-primary/5 via-primary/0 to-transparent">
          <div className="absolute top-0 right-0 h-full w-1/3 bg-radial from-primary/5 to-transparent pointer-events-none" />
          <div className="flex flex-wrap items-center gap-2 mb-5">
            <Badge
              variant="secondary"
              className="rounded-full font-medium px-3 py-1"
            >
              {reviewLevelLabels[data.reviewLevel]}
            </Badge>
            {data.note && (
              <Badge
                variant="outline"
                className="rounded-full text-amber-600 dark:text-amber-400 border-amber-500/40 bg-amber-500/5 px-3 py-1"
              >
                {data.note}
              </Badge>
            )}
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4 text-foreground">
            {data.title}
          </h1>
          <p className="text-muted-foreground max-w-3xl text-base sm:text-lg leading-relaxed">
            {data.description}
          </p>
        </header>

        {/* General Standard */}
        <section className="mb-12">
          <div className="flex items-start gap-4 rounded-xl bg-muted/40 border border-border p-5 sm:p-6">
            <div className="h-9 w-9 rounded-lg bg-background border border-border flex items-center justify-center shrink-0 text-primary">
              <Info className="h-4.5 w-4.5" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-foreground mb-1.5 uppercase tracking-wide">
                Tiêu chuẩn chung
              </h2>
              <p className="text-foreground/90 text-sm sm:text-base leading-relaxed">
                {data.generalStandard}
              </p>
            </div>
          </div>
        </section>

        {/* 5 Standards */}
        <section>
          <div className="flex items-baseline justify-between mb-8">
            <h2 className="text-2xl font-bold tracking-tight">
              Bộ 5 tiêu chuẩn chi tiết
            </h2>
            <span className="text-xs text-muted-foreground font-mono">
              05 / 05
            </span>
          </div>

          <ol className="space-y-3">
            {STANDARDS_CONFIG.map((std, index) => {
              const standard = data.standards[std.key]
              const Icon = std.icon
              return (
                <li
                  key={std.key}
                  className="group rounded-xl border border-border bg-card hover:border-foreground/20 transition-colors overflow-hidden"
                >
                  <div className="flex flex-col sm:flex-row">
                    {/* Number + Icon column */}
                    <div className="sm:w-56 sm:shrink-0 flex sm:flex-col items-center sm:items-start justify-between sm:justify-start gap-3 p-5 sm:p-6 sm:border-r border-b sm:border-b-0 border-border bg-muted/20">
                      <span className="text-lg font-mono text-muted-foreground">
                        0{index + 1}
                      </span>
                      <div className="flex items-center gap-2.5">
                        <Icon className="h-4 w-4 text-muted-foreground" />
                        <h3 className="font-semibold text-foreground md:text-xl">
                          {std.label}
                        </h3>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 p-5 sm:p-6 space-y-4">
                      <div>
                        <div className="text-xs font-bold uppercase tracking-wide text-foreground/70 mb-1.5">
                          Yêu cầu bắt buộc
                        </div>
                        <p className="text-sm text-foreground/90 leading-relaxed">
                          {standard.required}
                        </p>
                      </div>
                      {standard.optional && (
                        <div className="pt-4 border-t border-dashed border-border">
                          <div className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-1.5">
                            Tiêu chí ưu tiên
                          </div>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {standard.optional}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </li>
              )
            })}
          </ol>
        </section>
      </div>
    </div>
  )
}