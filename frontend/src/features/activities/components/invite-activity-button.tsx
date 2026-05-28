"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query"
import { Check, Loader2, Search, UserPlus, X } from "lucide-react"
import { toast } from "react-toastify"

import { Badge } from "@/components/ui/badge"
import { Button, type ButtonProps } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import {
  getListNotificationsQueryKey,
  searchStudents,
  useInviteActivity,
  type StudentSearchItem,
} from "@/services/generated/api"

const SEARCH_PAGE_SIZE = 20

interface InviteActivityButtonProps {
  slug?: string | null
  activityTitle?: string | null
  variant?: ButtonProps["variant"]
  size?: ButtonProps["size"]
  className?: string
}

function getErrorMessage(error: unknown, fallback: string) {
  if (typeof error === "object" && error !== null) {
    const apiError = error as {
      response?: { data?: { error?: { message?: string } } }
      message?: string
    }
    return apiError.response?.data?.error?.message || apiError.message || fallback
  }

  return fallback
}

function getStudentLabel(student: StudentSearchItem) {
  return student.displayName || student.fullName || student.studentId
}

function getStudentMeta(student: StudentSearchItem) {
  return [student.studentId, student.className, student.unitName].filter(Boolean).join(" · ")
}

export function InviteActivityButton({
  slug,
  activityTitle,
  variant = "outline",
  size = "sm",
  className,
}: InviteActivityButtonProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button
        type="button"
        variant={variant}
        size={size}
        className={className}
        onClick={() => setOpen(true)}
        disabled={!slug}
      >
        <UserPlus className="h-4 w-4" />
        Mời
      </Button>
      {slug && (
        <InviteFriendsDialog
          open={open}
          onOpenChange={setOpen}
          slug={slug}
          activityTitle={activityTitle}
        />
      )}
    </>
  )
}

interface InviteFriendsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  slug: string
  activityTitle?: string | null
}

function InviteFriendsDialog({
  open,
  onOpenChange,
  slug,
  activityTitle,
}: InviteFriendsDialogProps) {
  const queryClient = useQueryClient()
  const [searchTerm, setSearchTerm] = useState("")
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("")
  const [selectedStudents, setSelectedStudents] = useState<StudentSearchItem[]>([])
  const sentinelRef = useRef<HTMLDivElement | null>(null)
  const canSearch = open && debouncedSearchTerm.trim().length >= 2

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearchTerm(searchTerm.trim())
    }, 300)

    return () => window.clearTimeout(timer)
  }, [searchTerm])

  const studentsQuery = useInfiniteQuery({
    queryKey: ["students-search", debouncedSearchTerm],
    queryFn: ({ pageParam, signal }) =>
      searchStudents(
        {
          q: debouncedSearchTerm,
          page: Number(pageParam),
          pageSize: SEARCH_PAGE_SIZE,
        },
        undefined,
        signal,
      ),
    initialPageParam: 1,
    enabled: canSearch,
    getNextPageParam: (lastPage) => {
      const page = lastPage.meta?.page ?? 1
      const totalPages = lastPage.meta?.totalPages ?? 1
      return page < totalPages ? page + 1 : undefined
    },
  })

  const students = useMemo(
    () => studentsQuery.data?.pages.flatMap((page) => page.data ?? []) ?? [],
    [studentsQuery.data],
  )
  const selectedIds = useMemo(
    () => new Set(selectedStudents.map((student) => student.id)),
    [selectedStudents],
  )

  useEffect(() => {
    if (!open || !studentsQuery.hasNextPage || studentsQuery.isFetchingNextPage) {
      return
    }

    const node = sentinelRef.current
    if (!node) return

    const observer = new IntersectionObserver((entries) => {
      if (entries[0]?.isIntersecting) {
        studentsQuery.fetchNextPage()
      }
    })
    observer.observe(node)

    return () => observer.disconnect()
  }, [open, students.length, studentsQuery])

  const inviteMutation = useInviteActivity({
    mutation: {
      onSuccess: (response) => {
        const result = response.data
        toast.success(`Đã gửi ${result?.created ?? 0} lời mời`)
        if (result?.skipped) {
          toast.info(`Bỏ qua ${result.skipped} lời mời trùng`)
        }
        queryClient.invalidateQueries({ queryKey: getListNotificationsQueryKey() })
        setSelectedStudents([])
        setSearchTerm("")
        setDebouncedSearchTerm("")
        onOpenChange(false)
      },
      onError: (error) => {
        toast.error(getErrorMessage(error, "Không thể gửi lời mời"))
      },
    },
  })

  const toggleStudent = (student: StudentSearchItem) => {
    setSelectedStudents((current) => {
      if (current.some((item) => item.id === student.id)) {
        return current.filter((item) => item.id !== student.id)
      }
      return [...current, student]
    })
  }

  const removeStudent = (studentId: string) => {
    setSelectedStudents((current) => current.filter((student) => student.id !== studentId))
  }

  const submitInvites = () => {
    if (selectedStudents.length === 0 || inviteMutation.isPending) return

    inviteMutation.mutate({
      slug,
      data: { userIds: selectedStudents.map((student) => student.id) },
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-hidden p-0">
        <DialogHeader className="border-b px-5 py-4">
          <DialogTitle>Mời bạn bè</DialogTitle>
          <DialogDescription>{activityTitle || "Hoạt động đã chọn"}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 overflow-y-auto px-5 py-4">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Nhập MSSV hoặc tên"
              className="pl-9"
            />
          </div>

          {selectedStudents.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {selectedStudents.map((student) => (
                <Badge key={student.id} variant="secondary" className="gap-1 pr-1">
                  {getStudentLabel(student)}
                  <button
                    type="button"
                    onClick={() => removeStudent(student.id)}
                    className="rounded-full p-0.5 hover:bg-background/60"
                    aria-label={`Bỏ chọn ${getStudentLabel(student)}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}

          <div className="min-h-64 rounded-lg border">
            {!canSearch && (
              <div className="flex h-64 items-center justify-center px-4 text-center text-sm text-muted-foreground">
                Nhập ít nhất 2 ký tự để tìm sinh viên
              </div>
            )}

            {canSearch && studentsQuery.isLoading && (
              <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            )}

            {canSearch && studentsQuery.isError && (
              <div className="flex h-64 items-center justify-center px-4 text-center text-sm text-destructive">
                Không thể tìm sinh viên
              </div>
            )}

            {canSearch && !studentsQuery.isLoading && !studentsQuery.isError && students.length === 0 && (
              <div className="flex h-64 items-center justify-center px-4 text-center text-sm text-muted-foreground">
                Không tìm thấy sinh viên phù hợp
              </div>
            )}

            {students.length > 0 && (
              <div className="max-h-80 divide-y overflow-y-auto">
                {students.map((student) => {
                  const selected = selectedIds.has(student.id)

                  return (
                    <button
                      key={student.id}
                      type="button"
                      onClick={() => toggleStudent(student)}
                      className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/50"
                    >
                      <div className="min-w-0">
                        <div className="truncate text-sm font-medium">{getStudentLabel(student)}</div>
                        <div className="mt-0.5 truncate text-xs text-muted-foreground">
                          {getStudentMeta(student)}
                        </div>
                      </div>
                      <span
                        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${
                          selected ? "border-primary bg-primary text-primary-foreground" : "border-border"
                        }`}
                      >
                        {selected && <Check className="h-3.5 w-3.5" />}
                      </span>
                    </button>
                  )
                })}
                <div ref={sentinelRef} className="h-10">
                  {studentsQuery.isFetchingNextPage && (
                    <div className="flex h-full items-center justify-center">
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="border-t px-5 py-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={inviteMutation.isPending}>
            Hủy
          </Button>
          <Button onClick={submitInvites} disabled={selectedStudents.length === 0 || inviteMutation.isPending}>
            {inviteMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <UserPlus className="h-4 w-4" />
            )}
            Mời
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
