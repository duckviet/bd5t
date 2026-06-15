import Link from "next/link";
import type { Metadata } from "next";
import { BreadcrumbJsonLd } from "next-seo";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Trophy,
  Users,
  Calendar,
  ArrowRight,
  Heart,
  Dumbbell,
  GraduationCap,
  Scale,
  Globe,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { HomeLeaderboardPreview } from "./components/home-leaderboard-preview";
import { HomeActions } from "./components/home-actions";
import { SITE_NAME, absoluteUrl, createMetadata } from "@/lib/seo";

export const metadata: Metadata = createMetadata({
  title: "Dẫn lối hành trình Sinh viên 5 Tốt",
  path: "/",
});

const stats = [
  {
    label: "Hoạt động",
    value: "134",
    suffix: "+",
    icon: Calendar,
    trend: "+12% tháng này",
  },
  {
    label: "Sinh viên tham gia",
    value: "1,839",
    suffix: "",
    icon: Users,
    trend: "+89 thành viên mới",
  },
  {
    label: "Hoàn thành 5 tiêu chí",
    value: "629",
    suffix: "",
    icon: Trophy,
    trend: "42 sinh viên xuất sắc",
  },
];

const criteriaList = [
  {
    key: "DAO_DUC",
    name: "Đạo đức tốt",
    icon: Scale,
    color: "bg-rose-500",
    hoverBorder: "hover:border-rose-200",
    hoverShadow: "hover:shadow-rose-500/10",
    description: "Phẩm chất đạo đức, lối sống lành mạnh",
  },
  {
    key: "HOC_TAP",
    name: "Học tập tốt",
    icon: GraduationCap,
    color: "bg-blue-500",
    hoverBorder: "hover:border-blue-200",
    hoverShadow: "hover:shadow-blue-500/10",
    description: "Kết quả học tập xuất sắc",
  },
  {
    key: "THE_LUC",
    name: "Thể lực tốt",
    icon: Dumbbell,
    color: "bg-green-500",
    hoverBorder: "hover:border-green-200",
    hoverShadow: "hover:shadow-green-500/10",
    description: "Sức khỏe thể chất và tinh thần tốt",
  },
  {
    key: "TINH_NGUYEN",
    name: "Tình nguyện tốt",
    icon: Heart,
    color: "bg-orange-500",
    hoverBorder: "hover:border-orange-200",
    hoverShadow: "hover:shadow-orange-500/10",
    description: "Hoạt động tình nguyện xã hội",
  },
  {
    key: "HOI_NHAP",
    name: "Hội nhập tốt",
    icon: Globe,
    color: "bg-purple-500",
    hoverBorder: "hover:border-purple-200",
    hoverShadow: "hover:shadow-purple-500/10",
    description: "Hòa nhập cộng đồng và hoạt động ngoại khóa",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
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
      <section className="relative min-h-[85dvh] overflow-hidden bg-background py-20 lg:py-32">
        <div className="absolute inset-0 bg-linear-to-b from-primary/10 via-background to-background" />
        <div className="absolute inset-0 bg-radial-[at_top_right] from-primary/15 via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-border to-transparent" />

        {/* Floating decoration */}
        <div className="absolute left-10 top-20 h-64 w-64 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-20 right-10 h-96 w-96 rounded-full bg-secondary/5 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <Badge
              variant="secondary"
              className="mb-6 inline-flex items-center gap-1.5 px-4 py-1.5 text-sm font-medium"
            >
              Sinh viên 5 Tốt - ĐHQGHN
            </Badge>

            <h1 className="mb-6 flex flex-col items-center justify-center gap-2 text-4xl font-bold tracking-tight sm:text-5xl md:flex-row lg:text-6xl">
              <span className="text-nowrap">Dẫn lối hành trình </span>
              <span className="text-nowrap rounded-2xl bg-primary/10 px-4 py-1 text-primary">
                Sinh viên 5 Tốt
              </span>
            </h1>

            <p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground">
              Nền tảng số hỗ trợ sinh viên Trường Đại học Ngoại ngữ - ĐHQGHN
              tiếp cận, theo dõi và hoàn thành các tiêu chí của phong trào
              &quot;Sinh viên 5 Tốt&quot; một cách thuận tiện và hiệu quả.
            </p>

            <HomeActions variant="hero" />
          </div>

          {/* Trust indicators */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="flex -space-x-3">
                {["N", "D", "V", "L"].map((n, i) => (
                  <div
                    key={i}
                    className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-background bg-muted text-xs font-medium text-primary"
                  >
                    <span className="font-semibold">{n}</span>
                  </div>
                ))}
              </div>
              <span>1,800+ sinh viên tham gia</span>
            </div>
            <div className="hidden h-4 w-px bg-border sm:block" />
            <div className="flex items-center gap-1.5">
              <Trophy className="h-4 w-4 text-amber-500" />
              <span>629 danh hiệu đạt được</span>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative bg-linear-to-b from-background via-muted/40 to-background py-16">
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 sm:grid-cols-3">
            {stats.map((stat) => (
              <Card
                key={stat.label}
                className="group relative overflow-hidden border border-border/80 bg-card p-6 text-center transition-all duration-300 hover:-translate-y-1 hover:border-primary/20 hover:shadow-xl"
              >
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 transition-colors group-hover:bg-primary/15">
                  <stat.icon className="h-6 w-6 text-primary" />
                </div>
                <div className="mb-1 text-3xl font-bold">{stat.value}</div>
                <div className="mb-3 text-sm text-muted-foreground">
                  {stat.label}
                </div>
                <div className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                  <TrendingUp className="h-3 w-3" />
                  {stat.trend}
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 5 Tiers Section */}
      <section className="bg-linear-to-b from-background via-primary/[0.02] to-background py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold">
              5 Tiêu chí Sinh viên 5 Tốt
            </h2>
            <p className="mx-auto max-w-2xl text-muted-foreground">
              Tích lũy thành tích và hoàn thành đầy đủ các tiêu chí để đạt danh
              hiệu Sinh viên 5 Tốt
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {criteriaList.map((criteria) => (
              <Card
                key={criteria.key}
                className={`cursor-pointer border border-border bg-card p-6 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${criteria.hoverBorder} ${criteria.hoverShadow}`}
              >
                <div
                  className={`mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl ${criteria.color} shadow-xs`}
                >
                  <criteria.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="mb-2 font-semibold">{criteria.name}</h3>
                <p className="text-xs text-muted-foreground">
                  {criteria.description}
                </p>
              </Card>
            ))}
          </div>

          <div className="mt-8 text-center">
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
      <section className="bg-linear-to-b from-background via-muted/50 to-background py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h2 className="mb-2 text-3xl font-bold">Bảng xếp hạng</h2>
              <p className="text-muted-foreground">
                Top sinh viên tích cực nhất
              </p>
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
      <section className="bg-linear-to-b from-background to-muted/30 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Card className="relative overflow-hidden border-none shadow-2xl shadow-primary/15">
            <div className="absolute inset-0 bg-linear-to-br from-primary via-primary to-primary/80" />
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10" />
            <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-white/5" />

            <div className="relative px-8 py-16 text-center lg:px-12 lg:py-20">
              <div className="mx-auto max-w-2xl">
                <h2 className="mb-4 text-3xl font-bold text-primary-foreground lg:text-4xl">
                  Sẵn sàng bắt đầu hành trình?
                </h2>
                <p className="mb-10 text-lg text-primary-foreground/80">
                  Đăng ký ngay để bắt đầu hành trình chinh phục danh hiệu Sinh
                  viên 5 Tốt cùng hàng nghìn sinh viên khác
                </p>
                <HomeActions variant="cta" />
              </div>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}