"use client"

import { ExternalLink, FileText, ImageIcon } from "lucide-react"

interface EvidenceFilePreviewProps {
  fileUrl?: string
}

function getFileKind(fileUrl?: string) {
  const cleanUrl = fileUrl?.split("?")[0].toLowerCase() ?? ""
  if (/\.(png|jpe?g|webp|gif)$/i.test(cleanUrl)) return "image"
  if (/\.pdf$/i.test(cleanUrl)) return "pdf"
  return "other"
}

export function EvidenceFilePreview({ fileUrl }: EvidenceFilePreviewProps) {
  if (!fileUrl) {
    return <div className="text-sm text-muted-foreground">Không có file</div>
  }

  const kind = getFileKind(fileUrl)

  return (
    <div className="space-y-3">
      {kind === "image" && (
        <div className="overflow-hidden rounded-md border bg-muted">
          <img src={fileUrl} alt="Minh chứng" className="max-h-[420px] w-full object-contain" />
        </div>
      )}
      {kind === "pdf" && (
        <iframe
          src={fileUrl}
          title="Preview minh chứng PDF"
          className="h-[420px] w-full rounded-md border bg-white"
        />
      )}
      {kind === "other" && (
        <div className="flex items-center gap-2 rounded-md border bg-muted p-3 text-sm text-muted-foreground">
          <FileText className="h-4 w-4" />
          Không hỗ trợ preview trực tiếp cho định dạng này
        </div>
      )}
      <a
        href={fileUrl}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
      >
        Mở file trong tab mới
        <ExternalLink className="h-3.5 w-3.5" />
      </a>
    </div>
  )
}
