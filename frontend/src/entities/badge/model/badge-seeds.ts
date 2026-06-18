import type { CriterionType } from "@/lib/constants"
import { profileCriteriaKeys } from "./profile-criteria"
import type {
  BadgeIconKey,
  GeneralBadgeSeed,
  ScoreSummary,
  SpecificBadgeSeed,
} from "./types"

export const generalBadgeSeeds: readonly GeneralBadgeSeed[] = [
  {
    id: "gen_c",
    name: "Tân binh 5 Tốt",
    description: "Bắt đầu hành trình chinh phục danh hiệu Sinh viên 5 Tốt.",
    requirement: "Tổng điểm từ 0đ trở lên (Ranking C)",
    iconKey: "sprout",
    gradientClass: "from-emerald-400 to-teal-500",
    borderClass: "border-teal-200 shadow-teal-100/30",
    textColor: "text-teal-700",
    threshold: 0,
  },
  {
    id: "gen_b",
    name: "Người chinh phục 5 Tốt",
    description: "Bước đầu gặt hái thành quả với số điểm tích lũy khá.",
    requirement: "Tổng điểm từ 650đ trở lên (Ranking B)",
    iconKey: "compass",
    gradientClass: "from-sky-400 to-blue-500",
    borderClass: "border-blue-200 shadow-blue-100/30",
    textColor: "text-blue-700",
    threshold: 650,
  },
  {
    id: "gen_a",
    name: "Chiến binh 5 Tốt",
    description: "Khẳng định sự bản lĩnh qua nhiều hoạt động tích cực.",
    requirement: "Tổng điểm từ 750đ trở lên (Ranking A)",
    iconKey: "flame",
    gradientClass: "from-orange-400 to-red-500",
    borderClass: "border-red-200 shadow-red-100/30",
    textColor: "text-red-700",
    threshold: 750,
  },
  {
    id: "gen_a_plus",
    name: "Ngôi sao 5 Tốt",
    description: "Tỏa sáng rực rỡ với thành tích học tập và hoạt động xuất sắc.",
    requirement: "Tổng điểm từ 800đ trở lên (Ranking A+)",
    iconKey: "star",
    gradientClass: "from-amber-400 to-yellow-500",
    borderClass: "border-yellow-200 shadow-yellow-100/30",
    textColor: "text-amber-700",
    threshold: 800,
  },
  {
    id: "gen_s",
    name: "Huyền thoại 5 Tốt",
    description: "Đạt tới đỉnh cao xuất sắc của danh hiệu Sinh viên 5 Tốt.",
    requirement: "Tổng điểm từ 850đ trở lên (Ranking S)",
    iconKey: "trophy",
    gradientClass: "from-purple-500 via-fuchsia-500 to-pink-500 animate-pulse",
    borderClass: "border-fuchsia-200 shadow-fuchsia-100/30",
    textColor: "text-purple-700",
    threshold: 850,
  },
] as const

export const specificBadgeSeeds: readonly SpecificBadgeSeed[] = [
  criterionBadge("spec_dd_low", "Trái tim bản lĩnh", "Có tiêu chí Đạo đức tốt đạt điểm cao nhất.", "Đạo đức tốt đạt điểm cao nhất độc nhất (dưới 100đ)", "heart-handshake", "from-emerald-400 to-emerald-500", "border-emerald-200 shadow-emerald-100/20", "text-emerald-700", "DAO_DUC", "low"),
  criterionBadge("spec_dd_high", "Công dân gương mẫu", "Đạo đức tốt xuất sắc, là tấm gương sáng cho mọi người.", "Đạo đức tốt đạt điểm cao nhất độc nhất (từ 100đ trở lên)", "shield-check", "from-teal-500 to-emerald-600", "border-teal-200 shadow-teal-100/20", "text-teal-700", "DAO_DUC", "high"),
  criterionBadge("spec_ht_low", "Người chinh phục tri thức", "Học tập tốt, tích cực trong nghiên cứu và học tập.", "Học tập tốt đạt điểm cao nhất độc nhất (dưới 100đ)", "book-open", "from-sky-400 to-blue-500", "border-blue-200 shadow-blue-100/20", "text-blue-700", "HOC_TAP", "low"),
  criterionBadge("spec_ht_high", "Nhà bác học", "Thành tích học tập đỉnh cao, am hiểu sâu rộng tri thức.", "Học tập tốt đạt điểm cao nhất độc nhất (từ 100đ trở lên)", "trophy", "from-blue-500 to-indigo-600", "border-indigo-200 shadow-indigo-100/20", "text-indigo-700", "HOC_TAP", "high"),
  criterionBadge("spec_tl_low", "Chiến binh bền bỉ", "Có sức khỏe dẻo dai và tinh thần thể thao tích cực.", "Thể lực tốt đạt điểm cao nhất độc nhất (dưới 100đ)", "dumbbell", "from-orange-400 to-amber-500", "border-orange-200 shadow-orange-100/20", "text-orange-700", "THE_LUC", "low"),
  criterionBadge("spec_tl_high", "Ngọn lửa thể thao", "Sức mạnh thể chất vượt trội, lan tỏa ngọn lửa rèn luyện thể thao.", "Thể lực tốt đạt điểm cao nhất độc nhất (từ 100đ trở lên)", "flame", "from-rose-400 to-red-500", "border-rose-200 shadow-rose-100/20", "text-rose-700", "THE_LUC", "high"),
  criterionBadge("spec_tn_low", "Người lan tỏa yêu thương", "Nhiệt tình cống hiến vì cộng đồng, lan tỏa hơi ấm yêu thương.", "Tình nguyện tốt đạt điểm cao nhất độc nhất (dưới 100đ)", "heart-handshake", "from-pink-400 to-rose-500", "border-pink-200 shadow-pink-100/20", "text-pink-700", "TINH_NGUYEN", "low"),
  criterionBadge("spec_tn_high", "Thủ lĩnh tình nguyện", "Dẫn dắt các chiến dịch tình nguyện quy mô lớn, cống hiến xuất sắc.", "Tình nguyện tốt đạt điểm cao nhất độc nhất (từ 100đ trở lên)", "award", "from-pink-500 to-purple-600", "border-purple-200 shadow-purple-100/20", "text-purple-700", "TINH_NGUYEN", "high"),
  criterionBadge("spec_hn_low", "Đại sứ hội nhập", "Tích cực giao lưu văn hóa và nâng cao năng lực ngoại ngữ.", "Hội nhập tốt đạt điểm cao nhất độc nhất (dưới 100đ)", "globe", "from-violet-400 to-indigo-500", "border-violet-200 shadow-violet-100/20", "text-violet-700", "HOI_NHAP", "low"),
  criterionBadge("spec_hn_high", "Công dân toàn cầu", "Bản lĩnh hội nhập quốc tế rộng mở, am hiểu đa văn hóa.", "Hội nhập tốt đạt điểm cao nhất độc nhất (từ 100đ trở lên)", "globe", "from-indigo-500 to-violet-600 animate-pulse", "border-indigo-200 shadow-indigo-100/20", "text-indigo-700", "HOI_NHAP", "high"),
  // groupBadge("spec_multi_low", "Đại sứ 5 Tốt", "Có từ 2 đến 4 tiêu chí đạt điểm cao bằng nhau.", "Có 2-4 tiêu chí bằng điểm cao nhất (dưới 100đ)", "users", "from-purple-400 to-indigo-500", "border-purple-200 shadow-purple-100/20", "text-purple-700", "multi", "low"),
  groupBadge("spec_multi_high", "Nhà chinh phục 5 Tốt", "Có từ 2 đến 4 tiêu chí xuất sắc đạt điểm cao bằng nhau.", "Có 2-4 tiêu chí bằng điểm cao nhất (từ 100đ trở lên)", "trophy", "from-yellow-400 via-amber-500 to-orange-500", "border-amber-200 shadow-amber-100/20", "text-amber-700", "multi", "high"),
  groupBadge("spec_all_low", "Người dẫn lối 5 Tốt", "Cả 5 tiêu chí đạt điểm bằng nhau hoàn hảo.", "Cả 5 tiêu chí bằng điểm cao nhất (dưới 100đ)", "crown", "from-amber-400 to-yellow-500", "border-yellow-200 shadow-yellow-100/20", "text-yellow-700", "all", "low"),
  groupBadge("spec_all_high", "Thủ lĩnh 5 Tốt", "Đạt điểm số hoặc bằng nhau ở cả 5 tiêu chí xuất sắc.", "Cả 5 tiêu chí bằng điểm cao nhất (từ 100đ trở lên)", "crown", "from-yellow-500 via-amber-500 to-red-500 animate-bounce", "border-amber-300 shadow-red-100/30", "text-red-700", "all", "high"),
] as const

function criterionBadge(
  id: string,
  name: string,
  description: string,
  requirement: string,
  iconKey: BadgeIconKey,
  gradientClass: string,
  borderClass: string,
  textColor: string,
  criteria: CriterionType,
  scoreBand: "low" | "high",
): SpecificBadgeSeed {
  return {
    id,
    name,
    description,
    requirement,
    iconKey,
    gradientClass,
    borderClass,
    textColor,
    isUnlocked: (summary: ScoreSummary) => {
      const score = summary.scores.get(criteria) ?? 0

      return scoreBand === "low" ? score > 0 : score >= 100
    },
    isActive: (summary: ScoreSummary) =>
      summary.maxScore > 0 &&
      summary.matchingKeys.length === 1 &&
      summary.matchingKeys.includes(criteria) &&
      isInScoreBand(summary.maxScore, scoreBand),
  }
}

function groupBadge(
  id: string,
  name: string,
  description: string,
  requirement: string,
  iconKey: BadgeIconKey,
  gradientClass: string,
  borderClass: string,
  textColor: string,
  group: "multi" | "all",
  scoreBand: "low" | "high",
): SpecificBadgeSeed {
  return {
    id,
    name,
    description,
    requirement,
    iconKey,
    gradientClass,
    borderClass,
    textColor,
    isUnlocked: (summary: ScoreSummary) => {
      const satisfiesScore = id === "spec_multi_low"
        ? summary.maxScore > 0 && summary.maxScore < 100
        : (scoreBand === "low" ? summary.maxScore > 0 : summary.maxScore >= 100)
      const satisfiesGroup = group === "all"
        ? summary.matchingKeys.length === profileCriteriaKeys.length
        : summary.matchingKeys.length >= 2
      return satisfiesScore && satisfiesGroup
    },
    isActive: (summary: ScoreSummary) =>
      summary.maxScore > 0 &&
      isInScoreBand(summary.maxScore, scoreBand) &&
      (group === "all"
        ? summary.matchingKeys.length === profileCriteriaKeys.length
        : summary.matchingKeys.length >= 2 &&
        summary.matchingKeys.length < profileCriteriaKeys.length),
  }
}

function isInScoreBand(score: number, scoreBand: "low" | "high"): boolean {
  return scoreBand === "low" ? score < 100 : score >= 100
}
