import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FileText, Download, Eye } from "lucide-react"

const criteriaDocs = [
  {
    id: "doc_1",
    title: "Quy định xét chọn cấp Trường",
    reviewLevel: "TRUONG",
    fileUrl: "#",
    description: "Quy định về tiêu chuẩn và quy trình xét chọn danh hiệu Sinh viên 5 Tốt cấp Trường Đại học Ngoại ngữ",
  },
  {
    id: "doc_2",
    title: "Quy định xét chọn cấp ĐHQGHN",
    reviewLevel: "DHQGHN",
    fileUrl: "#",
    description: "Hướng dẫn tiêu chuẩn xét chọn Sinh viên 5 Tốt cấp Đại học Quốc gia Hà Nội",
  },
  {
    id: "doc_3",
    title: "Quy định xét chọn cấp Thành phố",
    reviewLevel: "THANH_PHO",
    fileUrl: "#",
    description: "Tiêu chuẩn và thủ tục xét chọn danh hiệu Sinh viên 5 Tốt cấp Thành phố Hà Nội",
  },
  {
    id: "doc_4",
    title: "Quy định xét chọn cấp Trung ương",
    reviewLevel: "TRUNG_UONG",
    fileUrl: "#",
    description: "Hướng dẫn xét chọn Sinh viên 5 Tốt cấp Trung ương theo quy định của TW Đoàn",
  },
]

export default function CriteriaPage() {
  return (
    <div className="min-h-screen py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Tiêu chí xét chọn</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Thư viện tài liệu hướng dẫn và quy định xét chọn danh hiệu Sinh viên 5 Tốt các cấp
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {criteriaDocs.map((doc) => (
            <Card key={doc.id} className="hover:shadow-lg transition-shadow">
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
              <CardContent>
                <p className="text-muted-foreground text-sm mb-4">
                  {doc.description}
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="gap-1">
                    <Eye className="h-4 w-4" />
                    Xem trước
                  </Button>
                  <Button size="sm" className="gap-1">
                    <Download className="h-4 w-4" />
                    Tải xuống
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