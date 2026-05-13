"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { UNITS } from "@/lib/constants"
import { Camera } from "lucide-react"
import type { UserProfile } from "../types"

interface EditProfileDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: UserProfile
  onSave: (data: UserProfile) => void
}

type FormData = {
  fullName: string
  email: string
  studentId: string
  className: string
  unitId: string
}

const initialForm = (user: UserProfile): FormData => ({
  fullName: user.fullName,
  email: user.email,
  studentId: user.studentId,
  className: user.className,
  unitId: user.unit.id,
})

export function EditProfileDialog({ open, onOpenChange, user, onSave }: EditProfileDialogProps) {
  const [form, setForm] = useState<FormData>(initialForm(user))
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const set = (field: keyof FormData) => (value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }))

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (ev) => setAvatarPreview(ev.target?.result as string)
      reader.readAsDataURL(file)
    }
  }

  const handleSave = () => {
    onSave({
      ...user,
      fullName: form.fullName,
      email: form.email,
      studentId: form.studentId,
      className: form.className,
      unit: { id: form.unitId, name: UNITS.find((u) => u.id === form.unitId)?.name ?? "" },
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Chỉnh sửa thông tin cá nhân</DialogTitle>
        </DialogHeader>

        <div className="flex justify-center mb-4">
          <div className="relative">
            <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
              {avatarPreview ? (
                <img src={avatarPreview} alt="Avatar" className="h-full w-full object-cover" />
              ) : (
                <Camera className="h-8 w-8 text-primary" />
              )}
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-md hover:bg-primary/90 transition-colors"
            >
              <Camera className="h-4 w-4" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-fullName">Họ và tên</Label>
            <Input id="edit-fullName" value={form.fullName} onChange={(e) => set("fullName")(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-email">Email</Label>
            <Input id="edit-email" type="email" value={form.email} onChange={(e) => set("email")(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-studentId">Mã số sinh viên</Label>
              <Input id="edit-studentId" value={form.studentId} onChange={(e) => set("studentId")(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-className">Lớp</Label>
              <Input id="edit-className" value={form.className} onChange={(e) => set("className")(e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-unit">Đơn vị</Label>
            <Select value={form.unitId} onValueChange={set("unitId")}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {UNITS.map((unit) => (
                  <SelectItem key={unit.id} value={unit.id}>{unit.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Hủy</Button>
          <Button onClick={handleSave}>Lưu thay đổi</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
