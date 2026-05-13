"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { 
  Plus, 
  Search, 
  Pencil, 
  Trash2,
  Calendar,
  Eye
} from "lucide-react"
import { CRITERIA, type CriterionType } from "@/lib/constants"

const mockActivities = [
  {
    id: "act_1",
    title: "Cuộc thi Lý tưởng Sinh viên 2026",
    slug: "cuoc-thi-ly-tuong-sinh-vien-2026",
    criteria: ["DAO_DUC"] as CriterionType[],
    organizer: "Đoàn Thanh niên",
    startAt: "2026-06-01",
    endAt: "2026-06-20",
    isPublished: true,
  },
  {
    id: "act_2",
    title: "Cuộc thi Thắp lửa Khởi nghiệp Sáng tạo",
    slug: "cuoc-thi-thap-lua-khoi-nghiep",
    criteria: ["HOC_TAP"] as CriterionType[],
    organizer: "Trung tâm Hỗ trợ SV",
    startAt: "2026-05-15",
    endAt: "2026-06-30",
    isPublished: true,
  },
  {
    id: "act_3",
    title: "Giải chạy Bước chân Sinh viên",
    slug: "giai-chay-buoc-chan-sinh-vien",
    criteria: ["THE_LUC"] as CriterionType[],
    organizer: "Phòng Công tác SV",
    startAt: "2026-04-20",
    endAt: "2026-04-25",
    isPublished: false,
  },
]

export default function AdminActivitiesPage() {
  const [activities, setActivities] = useState(mockActivities)
  const [searchQuery, setSearchQuery] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingActivity, setEditingActivity] = useState<typeof mockActivities[0] | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    criteria: [] as CriterionType[],
    organizer: "",
    startAt: "",
    endAt: "",
    registrationUrl: "",
    description: "",
  })

  const filteredActivities = activities.filter(
    (a) => a.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleOpenCreate = () => {
    setEditingActivity(null)
    setFormData({
      title: "",
      criteria: [],
      organizer: "",
      startAt: "",
      endAt: "",
      registrationUrl: "",
      description: "",
    })
    setIsDialogOpen(true)
  }

  const handleOpenEdit = (activity: typeof mockActivities[0]) => {
    setEditingActivity(activity)
    setFormData({
      title: activity.title,
      criteria: activity.criteria,
      organizer: activity.organizer,
      startAt: activity.startAt,
      endAt: activity.endAt,
      registrationUrl: "",
      description: "",
    })
    setIsDialogOpen(true)
  }

  const handleSave = () => {
    if (editingActivity) {
      setActivities((prev) =>
        prev.map((a) =>
          a.id === editingActivity.id
            ? { ...a, ...formData }
            : a
        )
      )
    } else {
      const newActivity = {
        id: `act_${Date.now()}`,
        slug: formData.title.toLowerCase().replace(/\s+/g, "-"),
        isPublished: true,
        ...formData,
      }
      setActivities((prev) => [...prev, newActivity])
    }
    setIsDialogOpen(false)
  }

  const handleDelete = (id: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa hoạt động này?")) {
      setActivities((prev) => prev.filter((a) => a.id !== id))
    }
  }

  return (
    <div className="min-h-screen py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Quản lý hoạt động</h1>
            <p className="text-muted-foreground">
              Thêm, sửa, xóa hoạt động
            </p>
          </div>
          <Button onClick={handleOpenCreate} className="gap-2">
            <Plus className="h-4 w-4" />
            Thêm hoạt động
          </Button>
        </div>

        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm hoạt động..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-4">
          {filteredActivities.map((activity) => (
            <Card key={activity.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold">{activity.title}</h3>
                      <Badge variant={activity.isPublished ? "success" : "secondary"}>
                        {activity.isPublished ? "Đã đăng" : "Nháp"}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(activity.startAt).toLocaleDateString("vi-VN")} - {new Date(activity.endAt).toLocaleDateString("vi-VN")}
                      </div>
                      <div>• {activity.organizer}</div>
                      <div className="flex gap-1">
                        {activity.criteria.map((c) => (
                          <Badge key={c} variant="outline" className="text-xs">
                            {CRITERIA[c]}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="gap-1">
                      <Eye className="h-4 w-4" />
                      Xem
                    </Button>
                    <Button variant="outline" size="sm" className="gap-1" onClick={() => handleOpenEdit(activity)}>
                      <Pencil className="h-4 w-4" />
                      Sửa
                    </Button>
                    <Button variant="destructive" size="sm" className="gap-1" onClick={() => handleDelete(activity.id)}>
                      <Trash2 className="h-4 w-4" />
                      Xóa
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Create/Edit Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {editingActivity ? "Sửa hoạt động" : "Thêm hoạt động mới"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Tên hoạt động</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Nhập tên hoạt động"
                />
              </div>
              <div className="space-y-2">
                <Label>Tiêu chí</Label>
                <Select
                  value={formData.criteria[0] || ""}
                  onValueChange={(value) => setFormData({ ...formData, criteria: [value as CriterionType] })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn tiêu chí" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(CRITERIA).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="organizer">Đơn vị tổ chức</Label>
                <Input
                  id="organizer"
                  value={formData.organizer}
                  onChange={(e) => setFormData({ ...formData, organizer: e.target.value })}
                  placeholder="Nhập đơn vị tổ chức"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startAt">Ngày bắt đầu</Label>
                  <Input
                    id="startAt"
                    type="date"
                    value={formData.startAt}
                    onChange={(e) => setFormData({ ...formData, startAt: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endAt">Ngày kết thúc</Label>
                  <Input
                    id="endAt"
                    type="date"
                    value={formData.endAt}
                    onChange={(e) => setFormData({ ...formData, endAt: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="registrationUrl">Link đăng ký</Label>
                <Input
                  id="registrationUrl"
                  value={formData.registrationUrl}
                  onChange={(e) => setFormData({ ...formData, registrationUrl: e.target.value })}
                  placeholder="https://..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Hủy
              </Button>
              <Button onClick={handleSave}>
                {editingActivity ? "Lưu" : "Thêm"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}