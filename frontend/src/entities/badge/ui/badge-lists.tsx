import type { BadgeDefinition } from "@/entities/badge"
import { BadgeCard } from "./badge-card"

export function GeneralBadgeList({
  badges,
}: {
  readonly badges: readonly BadgeDefinition[]
}) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {badges.map((badge) => (
        <BadgeCard key={badge.id} badge={badge} isGeneral={true} />
      ))}
    </div>
  )
}

export function SpecificBadgeGrid({
  badges,
}: {
  readonly badges: readonly BadgeDefinition[]
}) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {badges.map((badge) => (
        <BadgeCard key={badge.id} badge={badge} />
      ))}
    </div>
  )
}
