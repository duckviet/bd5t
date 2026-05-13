"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  User, 
  Mail, 
  GraduationCap, 
  Building2, 
  Edit3, 
  Upload,
  FileText,
  CheckCircle2,
  Circle
} from "lucide-react"
import { CRITERIA, REVIEW_LEVELS, type CriterionType, type ReviewLevel } from "@/lib/constants"

const mockUser = {
  id: "user_1",
  fullName: "Nguyễn Văn A",
  email: "a@example.com",
  studentId: "22040001",
  className: "K56A",
  unit: { id: "unit_1", name: "Khoa Ngôn ngữ & Văn hóa Anh" },
  avatarUrl: null,
}

const mockProgress = [
  { criterion: "DAO_DUC" as CriterionType, reviewLevel: "TRUONG" as ReviewLevel, isCompleted: true },
  { criterion: "DAO_DUC" as CriterionType, reviewLevel: "DHQGHN" as ReviewLevel, isCompleted: false },
  { criterion: "DAO_DUC" as CriterionType, reviewLevel: "THANH_PHO" as ReviewLevel, isCompleted: false },
  { criterion: "DAO_DUC" as CriterionType, reviewLevel: "TRUNG_UONG" as ReviewLevel, isCompleted: false },
  { criterion: "HOC_TAP" as CriterionType, reviewLevel: "TRUONG" as ReviewLevel, isCompleted: true },
  { criterion: "HOC_TAP" as CriterionType, reviewLevel: "DHQGHN" as ReviewLevel, isCompleted: false },
  { criterion: "HOC_TAP" as CriterionType, reviewLevel: "THANH_PHO" as ReviewLevel, isCompleted: false },
  { criterion: "HOC_TAP" as CriterionType, reviewLevel: "TRUNG_UONG" as ReviewLevel, isCompleted: false },
  { criterion: "THE_LUC" as CriterionType, reviewLevel: "TRUONG" as ReviewLevel, isCompleted: false },
  { criterion: "THE_LUC" as CriterionType, reviewLevel: "DHQGHN" as ReviewLevel, isCompleted: false },
  { criterion: "THE_LUC" as CriterionType, reviewLevel: "THANH_PHO" as ReviewLevel, isCompleted: false },
  { criterion: "THE_LUC" as CriterionType, reviewLevel: "TRUNG_UONG" as ReviewLevel, isCompleted: false },
  { criterion: "TINH_NGUYEN" as CriterionType, reviewLevel: "TRUONG" as ReviewLevel, isCompleted: false },
  { criterion: "TINH_NGUYEN" as CriterionType, reviewLevel: "DHQGHN" as ReviewLevel, isCompleted: false },
  { criterion: "TINH_NGUYEN" as CriterionType, reviewLevel: "THANH_PHO" as ReviewLevel, isCompleted: false },
  { criterion: "TINH_NGUYEN" as CriterionType, reviewLevel: "TRUNG_UONG" as ReviewLevel, isCompleted: false },
  { criterion: "HOI_NHAP" as CriterionType, reviewLevel: "TRUONG" as ReviewLevel, isCompleted: false },
  { criterion: "HOI_NHAP" as CriterionType, reviewLevel: "DHQGHN" as ReviewLevel, isCompleted: false },
  { criterion: "HOI_NHAP" as CriterionType, reviewLevel: "THANH_PHO" as ReviewLevel, isCompleted: false },
  { criterion: "HOI_NHAP" as CriterionType, reviewLevel: "TRUNG_UONG" as ReviewLevel, isCompleted: false },
]

const criteriaKeys = Object.keys(CRITERIA) as CriterionType[]
const reviewLevelKeys = Object.keys(REVIEW_LEVELS) as ReviewLevel[]

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false)
  const [editedUser, setEditedUser] = useState(mockUser)

  const completedCount = mockProgress.filter(p => p.isCompleted).length
  const totalCount = mockProgress.length
  const progressPercent = Math.round((completedCount / totalCount) * 100)

  return (
    <div className="min-h-screen py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Profile Info */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-12 w-12 text-primary" />
                </div>
                <CardTitle>{mockUser.fullName}</CardTitle>
                <Badge variant="secondary">Sinh viên</Badge>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{mockUser.email}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <GraduationCap className="h-4 w-4 text-muted-foreground" />
                  <span>MSV: {mockUser.studentId}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <span>{mockUser.className}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <span>{mockUser.unit.name}</span>
                </div>
                
                <Button 
                  variant="outline" 
                  className="w-full mt-4 gap-2"
                  onClick={() => setIsEditing(!isEditing)}
                >
                  <Edit3 className="h-4 w-4" />
                  Chỉnh sửa thông tin
                </Button>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-lg">Tiến độ tổng quan</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-4">
                  <div className="text-4xl font-bold text-primary">{progressPercent}%</div>
                  <div className="text-sm text-muted-foreground">
                    {completedCount} / {totalCount} tiêu chí
                  </div>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Progress Matrix & Evidence */}
          <div className="lg:col-span-2 space-y-6">
            {/* Progress Matrix */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Ma trận tiến độ</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr>
                        <th className="text-left p-2 min-w-[100px]"></th>
                        {reviewLevelKeys.map((level) => (
                          <th key={level} className="text-center p-2 text-sm font-medium text-muted-foreground">
                            {REVIEW_LEVELS[level]}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {criteriaKeys.map((criterion) => (
                        <tr key={criterion}>
                          <td className="p-2 font-medium text-sm">
                            {CRITERIA[criterion]}
                          </td>
                          {reviewLevelKeys.map((level) => {
                            const isCompleted = mockProgress.find(
                              p => p.criterion === criterion && p.reviewLevel === level
                            )?.isCompleted
                            return (
                              <td key={level} className="text-center p-2">
                                {isCompleted ? (
                                  <CheckCircle2 className="h-5 w-5 text-success mx-auto" />
                                ) : (
                                  <Circle className="h-5 w-5 text-muted-foreground/30 mx-auto" />
                                )}
                              </td>
                            )
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Evidence Vault */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Kho lưu trữ minh chứng</CardTitle>
                <Button size="sm" className="gap-1">
                  <Upload className="h-4 w-4" />
                  Tải lên
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-4 p-4 rounded-xl border border-border hover:bg-muted/50 transition-colors">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-sm">Chứng nhận tham gia cuộc thi</div>
                      <div className="text-xs text-muted-foreground">Đạo đức tốt • Cấp Trường</div>
                    </div>
                    <Badge variant="success">Đã duyệt</Badge>
                  </div>
                  
                  <div className="flex items-center gap-4 p-4 rounded-xl border border-border hover:bg-muted/50 transition-colors">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-sm">Giấy chứng nhận NCKH</div>
                      <div className="text-xs text-muted-foreground">Học tập tốt • Cấp Trường</div>
                    </div>
                    <Badge variant="secondary">Chờ duyệt</Badge>
                  </div>

                  <div className="flex items-center gap-4 p-4 rounded-xl border border-border hover:bg-muted/50 transition-colors">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-sm">Chứng chỉ thể thao</div>
                      <div className="text-xs text-muted-foreground">Thể lực tốt • Cấp Trường</div>
                    </div>
                    <Badge variant="destructive">Bị từ chối</Badge>
                  </div>
                </div>

                <Button variant="ghost" className="w-full mt-4">
                  Xem tất cả minh chứng
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}