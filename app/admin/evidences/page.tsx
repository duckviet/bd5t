"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  FileText, 
  Search, 
  CheckCircle2, 
  XCircle,
  Eye,
  User,
  Calendar
} from "lucide-react"
import { CRITERIA, EVIDENCE_STATUS, type CriterionType, type EvidenceStatus } from "@/lib/constants"

const mockEvidences = [
  {
    id: "ev_1",
    title: "Chứng nhận tham gia cuộc thi Lý tưởng Sinh viên",
    user: { fullName: "Nguyễn Văn A", studentId: "22040001" },
    criterion: "DAO_DUC" as CriterionType,
    reviewLevel: "TRUONG",
    fileUrl: "#",
    fileName: "chung_nhan.pdf",
    status: "PENDING" as EvidenceStatus,
    createdAt: "2026-05-10",
  },
  {
    id: "ev_2",
    title: "Giấy chứng nhận đề tài NCKH đạt giải",
    user: { fullName: "Trần Thị B", studentId: "22040002" },
    criterion: "HOC_TAP" as CriterionType,
    reviewLevel: "TRUONG",
    fileUrl: "#",
    fileName: "nckh.pdf",
    status: "PENDING" as EvidenceStatus,
    createdAt: "2026-05-11",
  },
  {
    id: "ev_3",
    title: "Chứng chỉ thể thao",
    user: { fullName: "Lê Văn C", studentId: "22040003" },
    criterion: "THE_LUC" as CriterionType,
    reviewLevel: "TRUONG",
    fileUrl: "#",
    fileName: "the_luc.pdf",
    status: "APPROVED" as EvidenceStatus,
    reviewedAt: "2026-05-09",
    createdAt: "2026-05-08",
  },
  {
    id: "ev_4",
    title: "Giấy chứng nhận tình nguyện",
    user: { fullName: "Phạm Thị D", studentId: "22040004" },
    criterion: "TINH_NGUYEN" as CriterionType,
    reviewLevel: "TRUONG",
    fileUrl: "#",
    fileName: "tinh_nguyen.pdf",
    status: "REJECTED" as EvidenceStatus,
    rejectionReason: "File mờ, không đọc được nội dung",
    reviewedAt: "2026-05-07",
    createdAt: "2026-05-05",
  },
]

export default function AdminEvidencesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedEvidence, setSelectedEvidence] = useState<typeof mockEvidences[0] | null>(null)

  const filteredEvidences = mockEvidences.filter(
    (ev) => ev.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ev.user.fullName.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Duyệt minh chứng</h1>
          <p className="text-muted-foreground">
            Quản lý và duyệt minh chứng do sinh viên nộp
          </p>
        </div>

        <div className="flex gap-6">
          {/* Evidence List */}
          <div className="flex-1">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm minh chứng..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="space-y-3">
              {filteredEvidences.map((ev) => (
                <Card 
                  key={ev.id} 
                  className={`cursor-pointer transition-all ${
                    selectedEvidence?.id === ev.id ? "ring-2 ring-primary" : ""
                  }`}
                  onClick={() => setSelectedEvidence(ev)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">{ev.title}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {ev.user.fullName} - {ev.user.studentId}
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline" className="text-xs">
                            {CRITERIA[ev.criterion]}
                          </Badge>
                          <Badge 
                            variant={
                              ev.status === "PENDING" ? "secondary" :
                              ev.status === "APPROVED" ? "success" : "destructive"
                            }
                            className="text-xs"
                          >
                            {EVIDENCE_STATUS[ev.status]}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Review Panel */}
          <div className="w-[400px] flex-shrink-0">
            {selectedEvidence ? (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Chi tiết minh chứng</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="text-sm font-medium mb-1">Tiêu đề</div>
                    <div className="text-sm text-muted-foreground">{selectedEvidence.title}</div>
                  </div>
                  
                  <div>
                    <div className="text-sm font-medium mb-1">Sinh viên</div>
                    <div className="flex items-center gap-2 text-sm">
                      <User className="h-4 w-4 text-muted-foreground" />
                      {selectedEvidence.user.fullName}
                    </div>
                    <div className="text-xs text-muted-foreground ml-6">
                      {selectedEvidence.user.studentId}
                    </div>
                  </div>

                  <div>
                    <div className="text-sm font-medium mb-1">Tiêu chí</div>
                    <Badge variant="outline">
                      {CRITERIA[selectedEvidence.criterion]}
                    </Badge>
                  </div>

                  <div>
                    <div className="text-sm font-medium mb-1">File</div>
                    <div className="text-sm text-muted-foreground">{selectedEvidence.fileName}</div>
                  </div>

                  <div>
                    <div className="text-sm font-medium mb-1">Ngày nộp</div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      {new Date(selectedEvidence.createdAt).toLocaleDateString("vi-VN")}
                    </div>
                  </div>

                  {selectedEvidence.status === "PENDING" && (
                    <div className="flex gap-2 pt-4">
                      <Button className="flex-1 gap-1" variant="success">
                        <CheckCircle2 className="h-4 w-4" />
                        Duyệt
                      </Button>
                      <Button className="flex-1 gap-1" variant="destructive">
                        <XCircle className="h-4 w-4" />
                        Từ chối
                      </Button>
                    </div>
                  )}

                  {selectedEvidence.status === "REJECTED" && selectedEvidence.rejectionReason && (
                    <div className="p-3 rounded-lg bg-destructive/10">
                      <div className="text-sm font-medium text-destructive">Lý do từ chối</div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {selectedEvidence.rejectionReason}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-8 text-center text-muted-foreground">
                  Chọn một minh chứng để xem chi tiết
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}