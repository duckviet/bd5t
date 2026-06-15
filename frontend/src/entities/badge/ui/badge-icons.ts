import {
  Award,
  BookOpen,
  Compass,
  Crown,
  Dumbbell,
  Flame,
  Globe2,
  HeartHandshake,
  ShieldCheck,
  Sprout,
  Star,
  Trophy,
  Users,
  type LucideIcon,
} from "lucide-react"
import type { BadgeIconKey } from "@/entities/badge"

export const badgeIcons: Record<BadgeIconKey, LucideIcon> = {
  award: Award,
  "book-open": BookOpen,
  compass: Compass,
  crown: Crown,
  dumbbell: Dumbbell,
  flame: Flame,
  globe: Globe2,
  "heart-handshake": HeartHandshake,
  "shield-check": ShieldCheck,
  sprout: Sprout,
  star: Star,
  trophy: Trophy,
  users: Users,
}
