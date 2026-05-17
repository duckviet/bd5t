import Link from "next/link"
import type { Metadata } from "next"
import { BreadcrumbJsonLd } from "next-seo"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Trophy, 
  Users, 
  Calendar, 
  Target, 
  ArrowRight
} from "lucide-react"
import { HomeLeaderboardPreview } from "./components/home-leaderboard-preview"
import { SITE_NAME, absoluteUrl, createMetadata } from "@/lib/seo"

export const metadata: Metadata = createMetadata({
  title: "Dẫn lối hành trình Sinh viên 5 Tốt",
  path: "/",
})

const stats = [
  { label: "Hoạt động", value: "134", icon: Calendar },
  { label: "Sinh viên tham gia", value: "1,839", icon: Users },
  { label: "Hoàn thành 5 tiêu chí", value: "629", icon: Trophy },
]

const criteriaList = [
  { key: "DAO_DUC", name: "Đạo đức tốt", icon: Target, color: "bg-rose-500" },
  { key: "HOC_TAP", name: "Học tập tốt", icon: Target, color: "bg-blue-500" },
  { key: "THE_LUC", name: "Thể lực tốt", icon: Target, color: "bg-green-500" },
  { key: "TINH_NGUYEN", name: "Tình nguyện tốt", icon: Target, color: "bg-orange-500" },
  { key: "HOI_NHAP", name: "Hội nhập tốt", icon: Target, color: "bg-purple-500" },
]

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <BreadcrumbJsonLd
        scriptId="home-breadcrumb-jsonld"
        scriptKey="home-breadcrumb-jsonld"
        items={[
          {
            name: SITE_NAME,
            item: absoluteUrl("/"),
          },
        ]}
      />
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 via-background to-background py-20 lg:py-32">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="secondary" className="mb-4">
              Sinh viên 5 Tốt - ĐHQGHN
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl mb-6">
              Dẫn lối hành trình{" "}
              <span className="text-primary">Sinh viên 5 Tốt</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Nền tảng số hỗ trợ sinh viên Trường Đại học Ngoại ngữ - ĐHQGHN tiếp cận, 
              theo dõi và hoàn thành các tiêu chí của phong trào &quot;Sinh viên 5 Tốt&quot; một cách thuận tiện và hiệu quả.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <Button size="lg" className="gap-2">
                  Đăng ký ngay
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/activities">
                <Button size="lg" variant="outline">
                  Khám phá hoạt động
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {stats.map((stat) => (
              <Card key={stat.label} className="text-center p-6">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <stat.icon className="h-6 w-6 text-primary" />
                </div>
                <div className="text-3xl font-bold mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 5 Tiers Section */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">5 Tiêu chí Sinh viên 5 Tốt</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Tích lũy thành tích và hoàn thành đầy đủ các tiêu chí để đạt danh hiệu Sinh viên 5 Tốt
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {criteriaList.map((criteria) => (
              <Card key={criteria.key} className="p-6 text-center hover:shadow-lg transition-shadow">
                <div className={`mx-auto mb-4 h-12 w-12 rounded-xl ${criteria.color} flex items-center justify-center`}>
                  <criteria.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold">{criteria.name}</h3>
              </Card>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link href="/criteria">
              <Button variant="outline" className="gap-2">
                Xem chi tiết tiêu chí
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Leaderboard Preview */}
      <section className="py-20 bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-bold mb-2">Bảng xếp hạng</h2>
              <p className="text-muted-foreground">Top sinh viên tích cực nhất</p>
            </div>
            <Link href="/leaderboard">
              <Button variant="ghost" className="gap-2">
                Xem tất cả
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          <HomeLeaderboardPreview />
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Card className="relative overflow-hidden bg-primary text-primary-foreground p-8 lg:p-12">
            <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary opacity-90" />
            <div className="relative mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold mb-4">Sẵn sàng bắt đầu?</h2>
              <p className="text-primary-foreground/80 mb-8 text-lg">
                Đăng ký ngay để bắt đầu hành trình chinh phục danh hiệu Sinh viên 5 Tốt
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/register">
                  <Button size="lg" variant="secondary">
                    Đăng ký ngay
                  </Button>
                </Link>
                <Link href="/activities">
                  <Button size="lg" variant="outline" className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10">
                    Khám phá hoạt động
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        </div>
      </section>
    </div>
  )
}
