export const CRITERIA = {
  DAO_DUC: "Đạo đức tốt",
  HOC_TAP: "Học tập tốt",
  THE_LUC: "Thể lực tốt",
  TINH_NGUYEN: "Tình nguyện tốt",
  HOI_NHAP: "Hội nhập tốt",
} as const

export type CriterionType = keyof typeof CRITERIA

export const CRITERIA_LABELS: Record<CriterionType, string> = CRITERIA

export const REVIEW_LEVELS = {
  TRUONG: "Cấp Trường",
  DHQGHN: "Cấp ĐHQGHN",
  THANH_PHO: "Cấp Thành phố",
  TRUNG_UONG: "Cấp Trung ương",
} as const;

export type ReviewLevel = keyof typeof REVIEW_LEVELS

export const EVIDENCE_STATUS = {
  PENDING: "Chờ duyệt",
  APPROVED: "Đã duyệt",
  REJECTED: "Bị từ chối",
} as const

export type EvidenceStatus = keyof typeof EVIDENCE_STATUS

export const USER_ROLES = {
  STUDENT: "Sinh viên",
  ADMIN: "Quản trị viên",
} as const

export type UserRole = keyof typeof USER_ROLES

export const UNITS = [
  { id: "unit_1", name: "Khoa Ngôn ngữ & Văn hóa Anh", code: "ENG" },
  { id: "unit_2", name: "Khoa Ngôn ngữ & Văn hóa Nhật Bản", code: "JPN" },
  { id: "unit_3", name: "Khoa Ngôn ngữ & Văn hóa Hàn Quốc", code: "KOR" },
  { id: "unit_4", name: "Khoa Ngôn ngữ & Văn hóa Trung Quốc", code: "CHN" },
  { id: "unit_5", name: "Khoa Ngôn ngữ & Văn hóa Pháp", code: "FRA" },
  { id: "unit_6", name: "Khoa Ngôn ngữ & Văn hóa Đức", code: "GER" },
  { id: "unit_7", name: "Khoa Ngôn ngữ & Văn hóa Nga", code: "RUS" },
  { id: "unit_8", name: "Khoa Ngôn ngữ & Văn hóa Ả Rập", code: "ARA" },
  { id: "unit_9", name: "Khoa Việt Nam - Đông Nam Á", code: "VSA" },
  { id: "unit_10", name: "Khoa Giáo dục Quốc tế", code: "IED" },
] as const

export type UnitId = (typeof UNITS)[number]["id"]

export const QUERY_KEYS = {
  auth: {
    me: ["auth", "me"] as const,
  },
  activities: {
    list: (params?: Record<string, unknown>) => ["activities", params] as const,
    detail: (slug: string) => ["activity", slug] as const,
  },
  criteriaDocs: {
    list: ["criteria-docs"] as const,
  },
  notifications: {
    list: ["notifications"] as const,
  },
  profile: {
    me: ["profile"] as const,
  },
  evidences: {
    list: ["evidences"] as const,
  },
  progress: {
    me: ["progress"] as const,
  },
  leaderboard: {
    list: ["leaderboard"] as const,
  },
  admin: {
    activities: (params?: Record<string, unknown>) => ["admin", "activities", params] as const,
    evidences: (params?: Record<string, unknown>) => ["admin", "evidences", params] as const,
    notifications: (params?: Record<string, unknown>) => ["admin", "notifications", params] as const,
    criteriaDocs: (params?: Record<string, unknown>) => ["admin", "criteria-docs", params] as const,
    users: (params?: Record<string, unknown>) => ["admin", "users", params] as const,
  },
} as const