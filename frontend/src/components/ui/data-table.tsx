"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface ColumnDef<TData> {
  id: string
  header: React.ReactNode | (() => React.ReactNode)
  cell: (info: { row: TData; index: number }) => React.ReactNode
  className?: string
  headerClassName?: string
}

interface DataTableProps<TData> {
  data: TData[]
  columns: ColumnDef<TData>[]
  onRowClick?: (row: TData) => void
  rowClassName?: string | ((row: TData) => string)
  emptyMessage?: string
}

export function DataTable<TData>({
  data,
  columns,
  onRowClick,
  rowClassName,
  emptyMessage = "Không có dữ liệu phù hợp",
}: DataTableProps<TData>) {
  return (
    <div className="overflow-x-auto rounded-md border bg-white">
      <table className="min-w-full divide-y divide-border text-sm">
        <thead className="bg-muted/55">
          <tr>
            {columns.map((col) => {
              const headerContent = typeof col.header === "function" ? col.header() : col.header
              return (
                <th
                  key={col.id}
                  className={cn(
                    "px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider",
                    col.headerClassName,
                  )}
                >
                  {headerContent}
                </th>
              )
            })}
          </tr>
        </thead>
        <tbody className="divide-y divide-border/50 bg-white">
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-8 text-center text-sm text-muted-foreground">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, index) => {
              const customRowClass =
                typeof rowClassName === "function" ? rowClassName(row) : rowClassName
              return (
                <tr
                  key={index}
                  onClick={() => onRowClick?.(row)}
                  className={cn(
                    "transition-all duration-200",
                    onRowClick && "cursor-pointer select-none hover:bg-slate-50/60",
                    customRowClass,
                  )}
                >
                  {columns.map((col) => (
                    <td
                      key={col.id}
                      className={cn("px-4 py-2.5 align-middle text-slate-700", col.className)}
                    >
                      {col.cell({ row, index })}
                    </td>
                  ))}
                </tr>
              )
            })
          )}
        </tbody>
      </table>
    </div>
  )
}
