"use client"

import type { EvidenceItem } from "@/services/generated/api"

interface StudentAvatarProps {
  evidence: EvidenceItem
}

function getInitials(name?: string | null) {
  const value = name?.trim()
  if (!value) return "SV"
  return value
    .split(/\s+/)
    .slice(-2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("")
}

export function StudentAvatar({ evidence }: StudentAvatarProps) {
  if (evidence.userAvatarUrl) {
    return (
      <img
        src={evidence.userAvatarUrl}
        alt={evidence.userFullName || "Sinh viên"}
        className="h-10 w-10 rounded-full object-cover"
      />
    )
  }

  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
      {getInitials(evidence.userFullName)}
    </div>
  )
}
