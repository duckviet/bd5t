import type { CriterionType, ReviewLevel } from "@/lib/constants"
import type { UserProfile, EvidenceItem, ProgressItem } from "./types"

export const mockUser: UserProfile = {
  id: "user_1",
  fullName: "Nguyễn Văn A",
  email: "a@example.com",
  studentId: "22040001",
  className: "K56A",
  unit: { id: "unit_1", name: "Khoa Ngôn ngữ & Văn hóa Anh" },
  avatarUrl: null,
}

export const mockEvidences: EvidenceItem[] = [
  { id: "ev_1", title: "Chứng nhận tham gia cuộc thi Olympic Tin học", criterion: "HOC_TAP", reviewLevel: "TRUONG", status: "APPROVED", activityTitle: "Cuộc thi Olympic Tin học cấp Trường", fileUrl: "", createdAt: "2025-09-15", description: "Giấy chứng nhận đạt giải Ba" },
  { id: "ev_2", title: "Giấy chứng nhận NCKH Sinh viên", criterion: "HOC_TAP", reviewLevel: "TRUONG", status: "PENDING", activityTitle: "Hội thảo Nghiên cứu Khoa học", fileUrl: "", createdAt: "2025-10-01", description: "Báo cáo NCKH đạt loại Giỏi" },
  { id: "ev_3", title: "Chứng chỉ thể thao điền kinh", criterion: "THE_LUC", reviewLevel: "TRUONG", status: "REJECTED", activityTitle: "Giải chạy Vì sức khỏe cộng đồng", fileUrl: "", createdAt: "2025-08-20", description: "Chứng nhận tham gia giải chạy" },
  { id: "ev_4", title: "Chứng nhận hoạt động tình nguyện", criterion: "TINH_NGUYEN", reviewLevel: "TRUONG", status: "APPROVED", activityTitle: "Chiến dịch Mùa hè xanh", fileUrl: "", createdAt: "2025-07-10", description: "Tham gia chiến dịch tình nguyện tại Hà Giang" },
  { id: "ev_5", title: "Chứng chỉ hùng biện tiếng Anh", criterion: "HOI_NHAP", reviewLevel: "TRUONG", status: "APPROVED", activityTitle: "Cuộc thi Hùng biện tiếng Anh", fileUrl: "", createdAt: "2025-11-05", description: "Giải Nhì cuộc thi Hùng biện" },
  { id: "ev_6", title: "Giấy khen Đạo đức tốt", criterion: "DAO_DUC", reviewLevel: "TRUONG", status: "APPROVED", activityTitle: "Hoạt động ngoại khóa Đoàn trường", fileUrl: "", createdAt: "2025-06-15", description: "Giấy khen của Đoàn trường" },
  { id: "ev_7", title: "Chứng chỉ tiếng Anh IELTS", criterion: "HOI_NHAP", reviewLevel: "DHQGHN", status: "PENDING", activityTitle: "Kỳ thi đánh giá năng lực ngoại ngữ", fileUrl: "", createdAt: "2025-12-01", description: "IELTS 7.0" },
  { id: "ev_8", title: "Giấy chứng nhận hiến máu", criterion: "TINH_NGUYEN", reviewLevel: "TRUONG", status: "APPROVED", activityTitle: "Ngày hội hiến máu tình nguyện", fileUrl: "", createdAt: "2025-05-20", description: "Hiến máu nhân đạo lần thứ 3" },
  { id: "ev_9", title: "Chứng nhận tham gia giải bóng đá", criterion: "THE_LUC", reviewLevel: "TRUONG", status: "PENDING", activityTitle: "Giải bóng đá sinh viên", fileUrl: "", createdAt: "2025-11-20", description: "Tham gia giải bóng đá cấp Khoa" },
  { id: "ev_10", title: "Giấy khen Đoàn viên xuất sắc", criterion: "DAO_DUC", reviewLevel: "DHQGHN", status: "APPROVED", activityTitle: "Đánh giá Đoàn viên năm học", fileUrl: "", createdAt: "2025-09-30", description: "Đoàn viên xuất sắc năm học 2024-2025" },
  { id: "ev_11", title: "Bài báo khoa học đăng tạp chí", criterion: "HOC_TAP", reviewLevel: "DHQGHN", status: "PENDING", activityTitle: "Nghiên cứu khoa học sinh viên", fileUrl: "", createdAt: "2025-12-15", description: "Bài báo đăng trên Tạp chí Khoa học ĐHQGHN" },
  { id: "ev_12", title: "Giải thưởng Sao Tháng Giêng", criterion: "TINH_NGUYEN", reviewLevel: "DHQGHN", status: "APPROVED", activityTitle: "Giải thưởng tình nguyện", fileUrl: "", createdAt: "2025-10-20", description: "Được trao giải Sao Tháng Giêng cấp ĐHQGHN" },
]

export const mockProgress: ProgressItem[] = [
  { criterion: "DAO_DUC", reviewLevel: "TRUONG", isCompleted: true },
  { criterion: "DAO_DUC", reviewLevel: "DHQGHN", isCompleted: false },
  { criterion: "DAO_DUC", reviewLevel: "THANH_PHO", isCompleted: false },
  { criterion: "DAO_DUC", reviewLevel: "TRUNG_UONG", isCompleted: false },
  { criterion: "HOC_TAP", reviewLevel: "TRUONG", isCompleted: true },
  { criterion: "HOC_TAP", reviewLevel: "DHQGHN", isCompleted: false },
  { criterion: "HOC_TAP", reviewLevel: "THANH_PHO", isCompleted: false },
  { criterion: "HOC_TAP", reviewLevel: "TRUNG_UONG", isCompleted: false },
  { criterion: "THE_LUC", reviewLevel: "TRUONG", isCompleted: false },
  { criterion: "THE_LUC", reviewLevel: "DHQGHN", isCompleted: false },
  { criterion: "THE_LUC", reviewLevel: "THANH_PHO", isCompleted: false },
  { criterion: "THE_LUC", reviewLevel: "TRUNG_UONG", isCompleted: false },
  { criterion: "TINH_NGUYEN", reviewLevel: "TRUONG", isCompleted: false },
  { criterion: "TINH_NGUYEN", reviewLevel: "DHQGHN", isCompleted: false },
  { criterion: "TINH_NGUYEN", reviewLevel: "THANH_PHO", isCompleted: false },
  { criterion: "TINH_NGUYEN", reviewLevel: "TRUNG_UONG", isCompleted: false },
  { criterion: "HOI_NHAP", reviewLevel: "TRUONG", isCompleted: false },
  { criterion: "HOI_NHAP", reviewLevel: "DHQGHN", isCompleted: false },
  { criterion: "HOI_NHAP", reviewLevel: "THANH_PHO", isCompleted: false },
  { criterion: "HOI_NHAP", reviewLevel: "TRUNG_UONG", isCompleted: false },
]
