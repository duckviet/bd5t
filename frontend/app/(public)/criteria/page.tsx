import type { Metadata } from "next"
import Link from "next/link"
import { BreadcrumbJsonLd } from "next-seo"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FileText, Download, Eye } from "lucide-react"
import { absoluteUrl, createMetadata } from "@/lib/seo"

export const metadata: Metadata = createMetadata({
  title: "Tiêu chí xét chọn",
  description:
    "Thư viện tài liệu hướng dẫn và quy định xét chọn danh hiệu Sinh viên 5 Tốt các cấp.",
  path: "/criteria",
})

const criteriaDocs = [
  {
    id: "doc_1",
    title: "Quy định xét chọn cấp Trường",
    slug: "truong",
    reviewLevel: "TRUONG",
    fileUrl: "1_TC_SV5T_DHNN.pdf",
    description: "Quy định về tiêu chuẩn và quy trình xét chọn danh hiệu Sinh viên 5 Tốt cấp Trường Đại học Ngoại ngữ",
  },
  {
    id: "doc_2",
    title: "Quy định xét chọn cấp ĐHQGHN",
    slug: "dhqghn",
    reviewLevel: "DHQGHN",
    fileUrl: "2_TC_SV5T_VNU.pdf",
    description: "Hướng dẫn tiêu chuẩn xét chọn Sinh viên 5 Tốt cấp Đại học Quốc gia Hà Nội",
  },
  {
    id: "doc_3",
    title: "Quy định xét chọn cấp Thành phố",
    slug: "thanh-pho",
    reviewLevel: "THANH_PHO",
    fileUrl: "3_TC_SV5T_TWTP.pdf",
    description: "Tiêu chuẩn và thủ tục xét chọn danh hiệu Sinh viên 5 Tốt cấp Thành phố Hà Nội",
  },
  {
    id: "doc_4",
    title: "Quy định xét chọn cấp Trung ương",
    slug: "trung-uong",
    reviewLevel: "TRUNG_UONG",
    fileUrl: "4_TC_SV5T_TW.pdf",
    description: "Hướng dẫn xét chọn Sinh viên 5 Tốt cấp Trung ương theo quy định của TW Đoàn",
  },
]

export default function CriteriaPage() {
  const mediaBaseUrl = process.env.NEXT_PUBLIC_MEDIA_BASE_URL || ""

  return (
    <div className="min-h-screen py-12">
      <BreadcrumbJsonLd
        scriptId="criteria-breadcrumb-jsonld"
        scriptKey="criteria-breadcrumb-jsonld"
        items={[
          {
            name: "Trang chủ",
            item: absoluteUrl("/"),
          },
          {
            name: "Tiêu chí xét chọn",
            item: absoluteUrl("/criteria"),
          },
        ]}
      />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Tiêu chí xét chọn</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Thư viện tài liệu hướng dẫn và quy định xét chọn danh hiệu Sinh viên 5 Tốt các cấp
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {criteriaDocs.map((doc) => (
            <Card key={doc.id} className="hover:shadow-lg transition-all duration-300 border-border hover:border-primary/20 flex flex-col justify-between">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <FileText className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{doc.title}</CardTitle>
                      <Badge variant="secondary" className="mt-1">
                        {doc.reviewLevel === "TRUONG" && "Cấp Trường"}
                        {doc.reviewLevel === "DHQGHN" && "Cấp ĐHQGHN"}
                        {doc.reviewLevel === "THANH_PHO" && "Cấp Thành phố"}
                        {doc.reviewLevel === "TRUNG_UONG" && "Cấp Trung ương"}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col flex-1 justify-between">
                <p className="text-muted-foreground text-sm mb-6">
                  {doc.description}
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link className="flex gap-2 items-center" href={`/criteria/${doc.slug}`}>
                      <Eye className="h-4 w-4" />
                      <span>Xem chi tiết</span>
                    </Link>
                  </Button>
                  <Button size="sm" className="gap-1" asChild>
                    <a
                      href={`${mediaBaseUrl}/${doc.fileUrl}`}
                      download={doc.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2"
                    >
                      <Download className="h-4 w-4" />
                      <span> Tải xuống</span>
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

