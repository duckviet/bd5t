"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { User, Mail, GraduationCap, Building2, Edit3 } from "lucide-react"
import type { UserProfile } from "../types"

interface ProfileCardProps {
  user: UserProfile
  onEdit: () => void
}

export function ProfileCard({ user, onEdit }: ProfileCardProps) {
  return (
    <Card>
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center">
          <User className="h-12 w-12 text-primary" />
        </div>
        <CardTitle>{user.fullName}</CardTitle>
        <Badge variant="secondary">Sinh viên</Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3 text-sm">
          <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
          <span>{user.email}</span>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <GraduationCap className="h-4 w-4 text-muted-foreground shrink-0" />
          <span>MSV: {user.studentId}</span>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
          <span>{user.className}</span>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
          <span>{user.unit.name}</span>
        </div>

        <Button
          variant="outline"
          className="w-full mt-4 gap-2"
          onClick={onEdit}
        >
          <Edit3 className="h-4 w-4" />
          Chỉnh sửa thông tin
        </Button>
      </CardContent>
    </Card>
  )
}
