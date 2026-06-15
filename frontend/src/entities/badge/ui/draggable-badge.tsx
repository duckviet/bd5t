import { Trophy } from "lucide-react"
import { cn } from "@/lib/utils"
import type { BadgeDefinition } from "@/entities/badge"

interface DraggableBadgeProps {
  readonly badge: BadgeDefinition
  readonly imgUrl: string | undefined
  readonly pos: { readonly x: number; readonly y: number }
  readonly isDragging: boolean
  readonly onPointerDown: (
    e: React.PointerEvent<HTMLDivElement>,
    id: string,
  ) => void
  readonly onPointerMove: (e: React.PointerEvent<HTMLDivElement>) => void
  readonly onPointerUp: (e: React.PointerEvent<HTMLDivElement>) => void
}

export function DraggableBadge({
  badge,
  imgUrl,
  pos,
  isDragging,
  onPointerDown,
  onPointerMove,
  onPointerUp,
}: DraggableBadgeProps) {
  return (
    <div
      style={{
        left: `${pos.x}%`,
        top: `${pos.y}%`,
      }}
      className={cn(
        "absolute select-none cursor-grab flex flex-col items-center group touch-none active:cursor-grabbing",
        isDragging
          ? "z-50 scale-110 drop-shadow-2xl cursor-grabbing"
          : "z-10 hover:z-20 hover:scale-105 transition-all duration-200",
      )}
      onPointerDown={(e) => onPointerDown(e, badge.id)}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
    >
      <div className="relative p-1">
        {/* Badge Image */}
        {imgUrl ? (
          <img
            src={imgUrl}
            alt={badge.name}
            className={cn(
              "w-20 h-20 object-contain filter drop-shadow-md select-none pointer-events-none transition-all duration-300 badge-outline",
              isDragging
                ? "brightness-110 drop-shadow-lg"
                : "group-hover:brightness-105",
            )}
          />
        ) : (
          <div className="w-16 h-16 flex items-center justify-center bg-slate-200 rounded-full">
            <Trophy className="w-8 h-8 text-slate-400" />
          </div>
        )}

        {/* Glowing effect under active badges */}
        {/* {badge.isActive && (
          <div className="absolute inset-0 -z-10 bg-amber-400/20 blur-lg rounded-full animate-pulse" />
        )} */}
      </div>

      {/* Tooltip / Label */}
      <div
        className={cn(
          "absolute top-full mt-1.5 flex flex-col items-center bg-white rounded-lg px-2.5 py-1.5 text-center shadow-lg pointer-events-none transition-all duration-200 z-50 min-w-[140px] max-w-[180px]",
          isDragging
            ? "hidden"
            : "opacity-0 scale-95 translate-y-1 group-hover:opacity-100 group-hover:scale-100 group-hover:translate-y-0",
        )}
      >
        <span className="text-[10px] font-bold text-primary tracking-wide">
          {badge.name}
        </span>
        <span className="text-[9px] text-slate-400 leading-normal mt-0.5">
          {badge.description}
        </span>
      </div>
    </div>
  )
}
