/**
 * MOCK DATA FOR BẢN ĐỒ 5 TỐT
 * Dựa trên RAW_TEXT_DATA.md, DATABASE_SCHEMA.md và API_SPEC.md
 */

import {
  CriterionType,
  ReviewLevel,
  EvidenceStatus,
  UserRole,
} from "@/lib/constants";

export interface Unit {
  id: string;
  name: string;
  code: string;
}

export interface User {
  id: string;
  fullName: string;
  email: string;
  studentId: string;
  className: string;
  role: UserRole;
  unitId: string;
  avatarUrl?: string | null;
}

export interface Activity {
  id: string;
  title: string;
  slug: string;
  thumbnailUrl: string | null;
  criteria: CriterionType[];
  organizer: string;
  contactInfo?: string;
  shortDescription?: string;
  description?: string;
  rules?: string;
  rewards?: string;
  registrationUrl: string;
  startAt: string;
  endAt: string;
  reviewLevel: ReviewLevel;
  location?: string;
  targetAudience?: string;
}

export interface CriterionDocument {
  id: string;
  title: string;
  reviewLevel: ReviewLevel;
  fileUrl: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: "SYSTEM" | "ACTIVITY_NEW" | "DEADLINE" | "SUGGESTION";
  isRead: boolean;
  createdAt: string;
}

export interface Evidence {
  id: string;
  title: string;
  criterion: CriterionType;
  reviewLevel: ReviewLevel;
  status: EvidenceStatus;
  fileUrl: string;
  createdAt: string;
}

// --- DATA ---
export const REVIEW_LEVELS: Record<Activity["reviewLevel"], string> = {
  TRUONG: "Cấp Trường",
  DHQGHN: "Cấp ĐHQGHN",
  THANH_PHO: "Cấp Thành phố",
  TRUNG_UONG: "Cấp Trung ương",
};
export const MOCK_UNITS: Unit[] = [
  { id: "unit_1", name: "Khoa Ngôn ngữ & Văn hóa Anh", code: "ENG" },
  { id: "unit_2", name: "Khoa Ngôn ngữ & Văn hóa Nhật Bản", code: "JPN" },
  { id: "unit_3", name: "Khoa Ngôn ngữ & Văn hóa Hàn Quốc", code: "KOR" },
  { id: "unit_4", name: "Khoa Ngôn ngữ & Văn hóa Trung Quốc", code: "CHI" },
  { id: "unit_5", name: "Khoa Ngôn ngữ & Văn hóa Pháp", code: "FRA" },
  { id: "unit_6", name: "Khoa Ngôn ngữ & Văn hóa Đức", code: "GER" },
  { id: "unit_7", name: "Khoa Ngôn ngữ & Văn hóa Nga", code: "RUS" },
  { id: "unit_8", name: "Khoa Ngôn ngữ & Văn hóa Ả Rập", code: "ARA" },
  {
    id: "unit_9",
    name: "Khoa Ngôn ngữ & Văn hóa Việt Nam - Đông Nam Á",
    code: "SEA",
  },
  { id: "unit_10", name: "Khoa Giáo dục quốc tế", code: "FIE" },
];

export const MOCK_USER: User = {
  id: "user_1",
  fullName: "Nguyễn Văn A",
  email: "a@example.com",
  studentId: "22040001",
  className: "K56A1",
  role: "STUDENT",
  unitId: "unit_1",
  avatarUrl: null,
};

export const CRITERIA: {
  id: CriterionType;
  label: string;
  short: string;
  colorVar: string;
  description: string;
}[] = [
  {
    id: "DAO_DUC",
    label: "Đạo đức tốt",
    short: "Đạo đức",
    colorVar: "var(--criterion-dao-duc)",
    description: "Phẩm chất, lối sống, ý thức công dân và trách nhiệm xã hội.",
  },
  {
    id: "HOC_TAP",
    label: "Học tập tốt",
    short: "Học tập",
    colorVar: "var(--criterion-hoc-tap)",
    description:
      "Kết quả học tập, nghiên cứu khoa học và thành tích chuyên môn.",
  },
  {
    id: "THE_LUC",
    label: "Thể lực tốt",
    short: "Thể lực",
    colorVar: "var(--criterion-the-luc)",
    description: "Rèn luyện thể chất, tham gia thể thao và hoạt động sức khỏe.",
  },
  {
    id: "TINH_NGUYEN",
    label: "Tình nguyện tốt",
    short: "Tình nguyện",
    colorVar: "var(--criterion-tinh-nguyen)",
    description: "Hoạt động tình nguyện, vì cộng đồng và hỗ trợ xã hội.",
  },
  {
    id: "HOI_NHAP",
    label: "Hội nhập tốt",
    short: "Hội nhập",
    colorVar: "var(--criterion-hoi-nhap)",
    description: "Ngoại ngữ, kỹ năng hội nhập quốc tế và trao đổi văn hóa.",
  },
];

export const MOCK_ACTIVITIES: Activity[] = [
  {
    id: "1",
    slug: "ly-tuong-sinh-vien-2026",
    title: "Cuộc thi Lý tưởng Sinh viên năm 2026",
    thumbnailUrl: null,
    criteria: ["DAO_DUC"],
    organizer: "Sinh viên 5 tốt - Đại học Kinh tế Quốc dân",
    contactInfo:
      "Hotline: 0833137563 (Ms. Thu Hương), 0971654082 (Ms. Mai Hoa)",
    shortDescription:
      "Cuộc thi chính thức cho tiêu chí Đạo đức tốt trong Tuần lễ Sinh viên 5 tốt.",
    description:
      "Tuổi trẻ không chỉ là những tháng ngày học tập và trải nghiệm, mà còn là hành trình đi tìm cho mình một lý tưởng đủ lớn để theo đuổi. Cuộc thi Lý tưởng Sinh viên 2026 là sân chơi giúp sinh viên định hướng giá trị, nuôi dưỡng bản lĩnh và trách nhiệm với cộng đồng.",
    rules: "Đăng ký online, tham gia vòng sơ loại.",
    rewards:
      "Điểm rèn luyện, giấy chứng nhận tiêu chí Đạo đức tốt, cơ hội vào chung kết Sinh viên 5 tốt.",
    registrationUrl: "https://bom.so/DangkyLTSV2026",
    startAt: "2026-04-08",
    endAt: "2026-05-18",
    reviewLevel: "TRUONG",
    location: "Hà Nội",
    targetAudience: "Sinh viên các trường Đại học/Học viện/Cao đẳng tại Hà Nội",
  },
  {
    id: "2",
    slug: "tim-hieu-nghi-quyet-dai-hoi-xiv",
    title: "Cuộc thi Tìm hiểu Nghị quyết Đại hội XIV của Đảng",
    criteria: ["DAO_DUC"],
    organizer:
      "Đoàn Thanh niên - Hội Sinh viên Trường Đại học Khoa học Tự nhiên, ĐHQGHN",
    contactInfo: "",
    shortDescription: "Cuộc thi tìm hiểu Nghị quyết Đại hội Đảng XIV.",
    description:
      "Hòa chung không khí Chào mừng 96 năm Kỷ niệm Ngày thành lập Đảng Cộng sản Việt Nam (3/2/1930 - 3/2/2026) và chúc mừng Đại hội Đảng toàn quốc lần thứ XIV diễn ra thành công tốt đẹp, Đoàn Thanh niên - Hội Sinh viên nhà trường kết hợp với Liên chi Đoàn - Liên chi Hội khoa Hóa học và Câu lạc bộ Lý luận trẻ phát động cuộc thi “Tìm hiểu Nghị quyết Đại hội XIV của Đảng”.",
    rules: "Thi trực tuyến trên myaloha.vn",
    rewards: "Giấy chứng nhận, điểm rèn luyện",
    registrationUrl: "https://myaloha.vn/ct/Um2fSf",
    startAt: "2026-02-11",
    endAt: "2026-02-25",
    reviewLevel: "TRUONG",
    location: "ĐHQGHN",
    targetAudience: "Sinh viên ĐHQGHN",
    thumbnailUrl:
      "https://scontent.fhan14-5.fna.fbcdn.net/v/t39.30808-6/628723679_1325884749566786_1007610800863971888_n.jpg?stp=dst-jpg_p843x403_tt6&_nc_cat=109&ccb=1-7&_nc_sid=f727a1&_nc_ohc=swJntor2OWMQ7kNvwHalRAC&_nc_oc=AdqzlV9-oFC5Nievbm0DPPzASaeagdsTapKmpSPJvE1iP9qaAp9iHHLDyEWAjMFxkSI&_nc_zt=23&_nc_ht=scontent.fhan14-5.fna&_nc_gid=pJPyRDk7QKACjI0YrjkgtQ&_nc_ss=7b2a8&oh=00_Af6knmXWO3G4rW--GrN8rPiOSsewDaAMr15brjPcow-R0g&oe=6A0A3411",
  },
  {
    id: "3",
    slug: "tim-hieu-bien-dao-viet-nam",
    title: "Cuộc thi trực tuyến Tìm hiểu về Biển đảo Việt Nam",
    thumbnailUrl: null,
    criteria: ["DAO_DUC"],
    organizer: "Cụm 3 Phường Tân Hưng phối hợp Khoa Quản trị Kinh doanh",
    shortDescription: "Nâng cao nhận thức về chủ quyền biển đảo.",
    description:
      "Cuộc thi nhằm bồi đắp lòng yêu nước, trách nhiệm của thế hệ trẻ đối với chủ quyền thiêng liêng của Tổ quốc.",
    rules: "Quét QR hoặc truy cập link để thi trực tuyến.",
    rewards: "Giấy chứng nhận",
    registrationUrl:
      "https://myaloha.vn/cuoc-thi/cuoc-thi-truc-tuyen-tim-hieu-ve-bien-dao-viet-nam-voi-chu-de-tuoi-tre-cum-thi-dua-so-3-huong-ve-bien-dao-to-quoc-126349",
    startAt: "2026-01-14",
    endAt: "2026-01-16",
    reviewLevel: "TRUONG",
    location: "Hà Nội",
    targetAudience: "Đoàn viên, thanh niên",
  },
  {
    id: "4",
    slug: "tuan-le-tri-an-bac-2026",
    title: "Tuần lễ Tri ân Bác 2026",
    thumbnailUrl: null,
    criteria: ["DAO_DUC"],
    organizer:
      "Liên Chi Đoàn - Hội Viện Đào tạo Quốc tế - Trường Đại học Kinh tế - ĐHQGHN",
    shortDescription: "Thi thiết kế poster tri ân Chủ tịch Hồ Chí Minh.",
    description:
      "Hướng tới kỷ niệm 136 năm ngày sinh Chủ tịch Hồ Chí Minh, cuộc thi khuyến khích sinh viên thể hiện lòng biết ơn và học tập theo tấm gương đạo đức Bác.",
    rules:
      "Thiết kế poster/ảnh truyền thông theo các chủ đề về cuộc đời, sự nghiệp và tư tưởng Hồ Chí Minh.",
    rewards: "Giấy chứng nhận tiêu chí Đạo đức tốt, giải thưởng",
    registrationUrl: "https://forms.gle/jW32JxeE5JjzD6n57",
    startAt: "2026-05-06",
    endAt: "2026-05-12",
    reviewLevel: "TRUONG",
    location: "ĐHQGHN",
    targetAudience: "Sinh viên UEB",
  },
  {
    id: "5",
    slug: "olympic-mac-lenin-ho-chi-minh-2026",
    title: "Olympic Các môn Khoa học Mác – Lênin, Tư tưởng Hồ Chí Minh",
    thumbnailUrl: null,
    criteria: ["DAO_DUC"],
    organizer: "Hội Sinh viên Trường Đại học Giao thông Vận tải",
    shortDescription: "Cuộc thi Olympic lý luận chính trị.",
    description:
      "Sự kiện chào mừng Đại hội XIV của Đảng, hỗ trợ sinh viên đạt tiêu chí Sinh viên 5 tốt.",
    rules: "Thi online ngày 08/05/2026",
    rewards: "Giấy chứng nhận tiêu chí Đạo đức tốt",
    registrationUrl: "https://forms.gle/Ze1wSjoShvKSoFTN8",
    startAt: "2026-05-06",
    endAt: "2026-05-08",
    reviewLevel: "TRUONG",
    location: "Đại học Giao thông Vận tải",
    targetAudience: "Sinh viên UTC",
  },
  {
    id: "6",
    slug: "ban-sac-van-hoa-asean-2026",
    title: "Cuộc thi Tìm hiểu Bản sắc Văn hóa ASEAN 2026",
    thumbnailUrl: null,
    criteria: ["HOI_NHAP"],
    organizer: "Hội Sinh viên Trường Đại học Giao thông Vận tải",
    shortDescription: "Cuộc thi hội nhập quốc tế.",
    description: "Giúp sinh viên nâng cao kiến thức về văn hóa các nước ASEAN.",
    rules: "Thi online ngày 09/05/2026",
    rewards: "Giấy chứng nhận tiêu chí Hội nhập tốt",
    registrationUrl: "https://forms.gle/Ze1wSjoShvKSoFTN8",
    startAt: "2026-05-06",
    endAt: "2026-05-09",
    reviewLevel: "TRUONG",
    location: "Đại học Giao thông Vận tải",
    targetAudience: "Sinh viên UTC",
  },
  {
    id: "7",
    slug: "con-duong-anh-sang-ix",
    title: "Con đường ánh sáng lần thứ IX - 2026",
    thumbnailUrl: null,
    criteria: ["DAO_DUC"],
    organizer: "Đoàn Thanh niên - Hội Sinh viên ĐHQGHN",
    shortDescription:
      "Cuộc thi tìm hiểu Chủ nghĩa Mác-Lênin, Tư tưởng Hồ Chí Minh và Lịch sử Đảng.",
    description:
      "Sân chơi học thuật quy mô lớn giúp sinh viên rèn luyện lý tưởng cách mạng.",
    rules: "3 vòng thi",
    rewards: "Giấy chứng nhận, ưu tiên Sinh viên 5 tốt",
    registrationUrl: "",
    startAt: "2026-03-09",
    endAt: "2026-04-23",
    reviewLevel: "DHQGHN",
    location: "ĐHQGHN",
    targetAudience: "Sinh viên ĐHQGHN",
  },
  {
    id: "8",
    slug: "thap-lua-khoi-nghiep-sang-tao-2025",
    title: "Thắp lửa Khởi nghiệp Sáng tạo 2025",
    thumbnailUrl: null,
    criteria: ["HOI_NHAP"],
    organizer: "Bộ phận Đổi mới Sáng tạo - ULIS",
    shortDescription: "Cuộc thi ý tưởng khởi nghiệp.",
    description:
      "Sân chơi dành cho sinh viên có ý tưởng sáng tạo, giải quyết vấn đề xã hội.",
    rules: "Nộp ý tưởng dự án",
    rewards: "Giải thưởng tiền mặt, hỗ trợ ươm tạo",
    registrationUrl: "https://bit.ly/thapluakhoinghiepsangtao2025",
    startAt: "2025-09-25",
    endAt: "2025-12-06",
    reviewLevel: "TRUONG",
    location: "ULIS - ĐHQGHN",
    targetAudience: "Sinh viên ULIS và các trường",
  },
  {
    id: "9",
    slug: "cicsic-2026",
    title: "China International College Students' Innovation Competition 2026",
    thumbnailUrl: null,
    criteria: ["HOI_NHAP"],
    organizer: "Ban Tổ chức CICSIC",
    shortDescription: "Cuộc thi sáng tạo quốc tế.",
    description:
      "Cuộc thi đổi mới sáng tạo dành cho sinh viên quốc tế, có vòng tại Việt Nam và chung kết thế giới.",
    rules: "Nộp kế hoạch kinh doanh tiếng Anh/Trung",
    rewards: "Tiền mặt + cơ hội vào chung kết Malaysia và Trung Quốc",
    registrationUrl: "bit.ly/ciscisvietnam2026",
    startAt: "2026-05-01",
    endAt: "2026-05-30",
    reviewLevel: "TRUNG_UONG",
    location: "Toàn quốc",
    targetAudience: "Sinh viên Việt Nam",
  },
  {
    id: "10",
    slug: "buoc-chan-sinh-vien-thu-do",
    title: "Những bước chân Sinh viên Thủ đô lần thứ I",
    thumbnailUrl: null,
    criteria: ["THE_LUC"],
    organizer: "Hội Sinh viên Việt Nam TP. Hà Nội",
    shortDescription: "Giải chạy trực tuyến rèn luyện thể lực.",
    description:
      "Giải chạy thúc đẩy tinh thần rèn luyện thể chất cho sinh viên Thủ đô, hỗ trợ tiêu chí Thể lực tốt.",
    rules: "Chạy tối thiểu 30km (nữ)/50km (nam) trong 15 ngày qua app UpRace",
    rewards: "Giấy chứng nhận Thể lực tốt cấp thành phố, quà tặng",
    registrationUrl: "Link trên Fanpage Tình nguyện viên Thủ đô",
    startAt: "2026-05-01",
    endAt: "2026-05-15",
    reviewLevel: "THANH_PHO",
    location: "Hà Nội",
    targetAudience: "Sinh viên Hà Nội",
  },
  {
    id: "11",
    slug: "nhung-cuon-sach-trong-toi-mua-9",
    title: "Những cuốn sách trong tôi mùa 9: Khúc Vĩ Thanh",
    thumbnailUrl: null,
    criteria: ["HOC_TAP"],
    organizer: "CLB Tủ sách sống NEU",
    shortDescription: "Cuộc thi review sách và viết lách.",
    description: "Cuộc thi lan tỏa văn hóa đọc với chủ đề Khúc Vĩ Thanh.",
    rules: "3 vòng: Review sách → Trình bày quan điểm → Chung kết",
    rewards: "15 điểm Đoàn, cơ hội tiêu chí Học tập tốt, tiền mặt",
    registrationUrl: "https://bom.so/O6lK0l",
    startAt: "2026-03-23",
    endAt: "2026-05-20",
    reviewLevel: "TRUONG",
    location: "Toàn miền Bắc",
    targetAudience: "Học sinh, sinh viên miền Bắc",
  },
  {
    id: "12",
    slug: "sac-hong-hy-vong-xxvi",
    title: "Sắc Hồng Hy Vọng XXVI - Ngày hội hiến máu",
    thumbnailUrl: null,
    criteria: ["TINH_NGUYEN"],
    organizer: "UET Sắc Hồng Hy Vọng",
    shortDescription: "Ngày hội hiến máu ĐHQGHN.",
    description:
      "Hoạt động hiến máu tình nguyện với thông điệp Thanh niên Việt Nam - Sẵn sàng hiến máu.",
    rules: "Đăng ký và tham gia hiến máu trực tiếp",
    rewards: "Giấy chứng nhận tình nguyện",
    registrationUrl: "https://bom.so/SacHongHyVong-XXVI",
    startAt: "2026-05-11",
    endAt: "2026-05-11",
    reviewLevel: "DHQGHN",
    location: "ĐHQGHN",
    targetAudience: "Toàn ĐHQGHN",
  },
  {
    id: "13",
    slug: "gio-vuot-deo-may",
    title: "Gió vượt đèo mây - Hành trình tình nguyện vùng cao",
    thumbnailUrl: null,
    criteria: ["TINH_NGUYEN"],
    organizer: "Liên chi Hội Sinh viên Khoa Tài chính Ngân hàng - TMU",
    shortDescription: "Chương trình tình nguyện hỗ trợ vùng cao.",
    description:
      "Mang sách vở, đồ dùng học tập và tình yêu thương đến xã Mường Vang, Phú Thọ.",
    rules: "Ủng hộ hiện kim/hiện vật + đăng ký tham gia chuyến đi",
    rewards: "Giấy chứng nhận 1 ngày Tình nguyện tốt",
    registrationUrl: "https://forms.gle/c4PgPETz5p1Qo3zj7",
    startAt: "2026-06-20",
    endAt: "2026-06-21",
    reviewLevel: "TRUONG",
    location: "Phú Thọ",
    targetAudience: "Sinh viên TMU và các trường",
  },
  {
    id: "14",
    slug: "sseayp-2027",
    title:
      "Chương trình Tàu Thanh niên Đông Nam Á - Nhật Bản lần thứ 50 (SSEAYP 2027)",
    thumbnailUrl: null,
    criteria: ["HOI_NHAP"],
    organizer: "Trung ương Đoàn TNCS Hồ Chí Minh",
    shortDescription: "Chương trình giao lưu thanh niên quốc tế.",
    description:
      "Cơ hội lớn để đại diện thanh niên Việt Nam giao lưu với các nước ASEAN và Nhật Bản.",
    rules: "Nộp hồ sơ + phỏng vấn",
    rewards: "Chứng nhận quốc tế, trải nghiệm trên tàu",
    registrationUrl: "https://1.org.vn/cdkNIM",
    startAt: "2026-05-01",
    endAt: "2026-05-15",
    reviewLevel: "TRUNG_UONG",
    location: "ASEAN + Nhật Bản",
    targetAudience: "Thanh niên 18-30 tuổi",
  },
  {
    id: "15",
    slug: "golden-bell-challenge-2026",
    title: "The Golden Bell Challenge 2026 - The Synapse Sphere",
    thumbnailUrl: null,
    criteria: ["HOI_NHAP"],
    organizer: "CLB Tiếng Anh EC ULIS",
    shortDescription: "Cuộc thi hùng biện tiếng Anh.",
    description: "Rung Chuông Vàng phiên bản tiếng Anh với chủ đề Đa vũ trụ.",
    rules: "Vòng mở đơn + Chung kết",
    rewards: "Giấy chứng nhận A3, học bổng, tiền mặt",
    registrationUrl: "https://bit.ly/GBC26_ApplicationForm",
    startAt: "2026-04-06",
    endAt: "2026-05-10",
    reviewLevel: "TRUONG",
    location: "Hà Nội",
    targetAudience: "Sinh viên Hà Nội",
  },
  {
    id: "16",
    slug: "hup-marathon-2026",
    title: "HUP Marathon 2026",
    thumbnailUrl: null,
    criteria: ["THE_LUC"],
    organizer: "Hội Sinh viên Trường Đại học Dược Hà Nội",
    shortDescription: "Giải chạy marathon sinh viên Dược.",
    description: "Hoạt động rèn luyện thể lực và lan tỏa tinh thần thể thao.",
    rules: "Đăng ký trước 29/04/2026.",
    rewards: "Giấy chứng nhận Thể lực tốt.",
    registrationUrl: "https://forms.gle/hEL9RdYEniLmFssh8",
    startAt: "2026-04-15",
    endAt: "2026-04-29",
    reviewLevel: "TRUONG",
    location: "Đại học Dược Hà Nội",
    targetAudience: "Sinh viên, giảng viên ĐH Dược HN",
  },
  {
    id: "17",
    slug: "run-for-youth-95",
    title: "Run For Youth 95 - 95 Năm Tiếp Bước Dưới Cờ Đoàn",
    thumbnailUrl: null,
    criteria: ["THE_LUC"],
    organizer: "Đoàn Thanh niên Mặt trận Tổ quốc",
    shortDescription: "Giải chạy kỷ niệm 95 năm Ngày thành lập Đoàn.",
    description:
      "Hoạt động chạy bộ trực tuyến chào mừng 95 năm Ngày thành lập Đoàn TNCS Hồ Chí Minh.",
    rules: "Chạy/đi bộ tích lũy km qua Strava.",
    rewards: "Chứng nhận hoàn thành, giải cá nhân & tập thể.",
    registrationUrl: "https://eclub.vnptweb.vn",
    startAt: "2026-03-21",
    endAt: "2026-04-11",
    reviewLevel: "TRUNG_UONG",
    location: "Toàn quốc",
    targetAudience: "Thanh niên toàn quốc",
  },
  {
    id: "18",
    slug: "phat-quat-hoa-van",
    title: "Dự án Phất Quạt Họa Văn",
    thumbnailUrl: null,
    criteria: ["TINH_NGUYEN", "HOI_NHAP"],
    organizer: "Sinh viên Học viện Báo chí & Tuyên truyền",
    shortDescription:
      "Dự án bảo tồn văn hóa làng nghề qua triển lãm & workshop.",
    description:
      "Triển lãm và workshop trải nghiệm văn hóa với nghệ nhân làng nghề Chàng Sơn.",
    rules: "Ứng tuyển vị trí Content, Media, Event, External Relations.",
    rewards: "Giấy chứng nhận, trải nghiệm thực tế.",
    registrationUrl: "Comment dưới post tuyển dụng",
    startAt: "2026-04-12",
    endAt: "2026-04-12",
    reviewLevel: "TRUONG",
    location: "Bảo tàng Hà Nội",
    targetAudience: "Sinh viên Hà Nội",
  },
  {
    id: "19",
    slug: "buoc-chan-sinh-vien-vrace",
    title: "Bước chân Sinh viên - Giải chạy vRace",
    thumbnailUrl: null,
    criteria: ["THE_LUC"],
    organizer: "Trung ương Hội Sinh viên Việt Nam",
    contactInfo: "Email: vrace@fpt.com | Hotline: 1900 633 003",
    shortDescription:
      "Giải chạy rèn luyện thể lực nhận Giấy chứng nhận Trung ương.",
    description:
      "Hoạt động chạy bộ trực tuyến giúp sinh viên rèn luyện thể lực, hoàn thành tiêu chí Thể lực tốt. Hoàn thành 30km (nữ) / 50km (nam) sẽ nhận Giấy chứng nhận Thể lực tốt cấp Trung ương.",
    rules: "Tích km qua ứng dụng vRace.",
    rewards:
      "Giấy chứng nhận Thể lực tốt cấp Trung ương, quà tặng từ nhà tài trợ.",
    registrationUrl: "https://www.facebook.com/share/1BojGf54dZ/",
    startAt: "2026-04-01",
    endAt: "2026-05-31",
    reviewLevel: "TRUNG_UONG",
    location: "Toàn quốc",
    targetAudience: "Sinh viên toàn quốc",
  },
  {
    id: "20",
    slug: "thanh-nien-khoe-ulis",
    title: "Giải chạy Thanh niên khỏe - Ngày hội Kết nối 2026",
    thumbnailUrl: null,
    criteria: ["THE_LUC"],
    organizer: "CLB/ULIS",
    shortDescription: "Giải chạy ngắn trong Ngày hội Kết nối ULIS.",
    description:
      "Giải chạy 1km (chạy thành tích hoặc phong trào) giúp sinh viên rèn luyện thể lực và nhận chứng nhận Thanh niên khỏe cấp trường.",
    rules: "Tham gia chạy trong 15 phút tại sự kiện.",
    rewards: "Chứng nhận Thanh niên khỏe cấp Trường.",
    registrationUrl: "",
    startAt: "2026-04-14",
    endAt: "2026-04-14",
    reviewLevel: "TRUONG",
    location: "ULIS - ĐHQGHN",
    targetAudience: "Sinh viên ULIS",
  },
  {
    id: "21",
    slug: "hoi-thao-sinh-vien-khoe-dhqghn",
    title: "Hội thao Sinh viên khỏe ĐHQGHN 2025",
    thumbnailUrl: null,
    criteria: ["THE_LUC"],
    organizer: "ĐHQGHN",
    shortDescription: "Hội thao thể thao sinh viên Đại học Quốc gia Hà Nội.",
    description:
      "Các nội dung thi đấu: Chạy 100m, chạy dài, bật xa, nhảy dây, chống đẩy, gập bụng...",
    rules: "Tham gia tối thiểu 3/5 nội dung thi đấu.",
    rewards: "Xếp loại Đạt - Khá - Giỏi, giấy chứng nhận.",
    registrationUrl: "https://tinyurl.com/hoithaosvk2025",
    startAt: "2025-10-25",
    endAt: "2025-10-25",
    reviewLevel: "DHQGHN",
    location: "Hòa Lạc - ĐHQGHN",
    targetAudience: "Sinh viên ĐHQGHN",
  },
  {
    id: "22",
    slug: "ctv-hsv-ha-noi-gen05",
    title:
      "Tuyển Cộng tác viên Đội CTV Hội Sinh viên Việt Nam TP. Hà Nội Gen 05",
    thumbnailUrl: null,
    criteria: ["TINH_NGUYEN"],
    organizer: "Đội CTV Hội Sinh viên Việt Nam TP. Hà Nội",
    contactInfo: "Email: Doictvhoisinhvienvietnamtphn@gmail.com",
    shortDescription:
      "Tuyển cộng tác viên Gen 05 cho Hội Sinh viên TP. Hà Nội.",
    description:
      "Tuyển 80-100 cộng tác viên làm việc tại 5 ban: Nghiệp vụ, Nhân sự, Đối ngoại, Truyền thông, Khánh tiết.",
    rules: "Điền đơn trước 12h00 ngày 22/04/2026.",
    rewards: "Giấy chứng nhận, Bằng khen, môi trường làm việc chuyên nghiệp.",
    registrationUrl: "https://byvn.net/wr6Y",
    startAt: "2026-04-13",
    endAt: "2026-04-22",
    reviewLevel: "THANH_PHO",
    location: "Hà Nội",
    targetAudience: "Sinh viên năm 1-2 tại Hà Nội",
  },
  {
    id: "23",
    slug: "lop-hoc-cau-vong",
    title: "Lớp Học Cầu Vồng - Tình nguyện viên dạy học vùng cao",
    thumbnailUrl: null,
    criteria: ["TINH_NGUYEN"],
    organizer: "Lớp Học Cầu Vồng",
    contactInfo: "Email: lophoccauvong15@gmail.com | Phone: 0342124325",
    shortDescription: "Tình nguyện dạy học cho trẻ em vùng cao.",
    description:
      "Tìm kiếm tình nguyện viên dạy học (đặc biệt Tiếng Anh) tại vùng cao trong thời gian dài.",
    rules:
      "Nộp CV + trả lời câu hỏi, nộp tiền cam kết 1.000.000 VNĐ (hoàn lại khi hoàn thành).",
    rewards: "Giấy chứng nhận có mộc đỏ sau 4 tháng.",
    registrationUrl: "Gửi email: lophoccauvong15@gmail.com",
    startAt: "2026-01-01",
    endAt: "2026-12-31",
    reviewLevel: "TRUNG_UONG",
    location: "Vùng cao",
    targetAudience: "Sinh viên nhiệt huyết",
  },
  {
    id: "24",
    slug: "tnv-online-congdongtinhnguyen",
    title: "Tình nguyện viên Online - Cộng đồng Tình nguyện Việt Nam",
    thumbnailUrl: null,
    criteria: ["TINH_NGUYEN"],
    organizer: "Cộng đồng Tình nguyện Việt Nam",
    shortDescription: "Tình nguyện trực tuyến không cần ra khỏi nhà.",
    description:
      "Tham gia các hoạt động tình nguyện online, lan tỏa giá trị tích cực qua mạng xã hội và hỗ trợ dự án cộng đồng.",
    rules: "Đăng ký và hoàn thành nhiệm vụ online.",
    rewards: "Giấy chứng nhận online.",
    registrationUrl:
      "https://docs.google.com/.../1FAIpQLScdKME4dFM.../viewform",
    startAt: "2026-01-01",
    endAt: "2026-12-31",
    reviewLevel: "TRUNG_UONG",
    location: "Toàn quốc (Online)",
    targetAudience: "Mọi sinh viên",
  },
  {
    id: "25",
    slug: "su-gia-nhan-ai-pfc",
    title: "Sứ Giả Nhân Ái PFC Mùa thứ 6",
    thumbnailUrl: null,
    criteria: ["TINH_NGUYEN"],
    organizer: "Dự án PFC",
    shortDescription: "Sứ giả lan tỏa nhân ái cho trẻ em khó khăn.",
    description:
      "Trở thành Sứ giả Nhân ái, lan tỏa thông điệp sống đẹp và hỗ trợ trẻ em mồ côi, khuyết tật.",
    rules: "Đăng ký và hoàn thành nhiệm vụ trong mùa.",
    rewards: "Giấy chứng nhận có mộc đỏ, tham gia vinh danh.",
    registrationUrl: "https://forms.gle/7JCm6bLv6oCZtTs2A",
    startAt: "2026-01-01",
    endAt: "2026-12-31",
    reviewLevel: "TRUNG_UONG",
    location: "Toàn quốc",
    targetAudience: "Sinh viên và thanh niên",
  },
  {
    id: "26",
    slug: "light-up-2026",
    title: "LIGHT UP 2026 - The Multiverse",
    thumbnailUrl: null,
    criteria: ["HOI_NHAP"],
    organizer: "CLB Hùng biện PSC - ULIS",
    shortDescription: "Cuộc thi hùng biện tiếng Anh LIGHT UP.",
    description:
      "Cuộc thi hùng biện tiếng Anh thường niên với chủ đề Đa vũ trụ.",
    rules: "Vòng đăng ký → Sơ khảo → Bán kết → Chung kết.",
    rewards: "Giấy chứng nhận, giải thưởng lớn.",
    registrationUrl: "https://forms.gle/RfNruU8a6Xg3PBbw5",
    startAt: "2026-05-02",
    endAt: "2026-06-05",
    reviewLevel: "TRUONG",
    location: "ULIS - ĐHQGHN",
    targetAudience: "Sinh viên ULIS và các trường",
  },
  {
    id: "27",
    slug: "dai-su-van-hoa-doc-2025",
    title: "Cuộc thi Đại sứ Văn hóa Đọc 2025",
    thumbnailUrl: null,
    criteria: ["HOC_TAP", "TINH_NGUYEN"],
    organizer: "ULIS",
    shortDescription: "Cuộc thi lan tỏa văn hóa đọc.",
    description:
      "Tham gia với 2 đề bài: Review sách + Sáng kiến thúc đẩy văn hóa đọc hoặc sáng tác truyện ngắn.",
    rules: "Nộp bài trước 12h00 ngày 15/05/2025.",
    rewards: "Giấy chứng nhận, giải thưởng.",
    registrationUrl: "Link nộp bài trên fanpage ULIS",
    startAt: "2025-04-28",
    endAt: "2025-05-30",
    reviewLevel: "TRUONG",
    location: "ULIS",
    targetAudience: "Sinh viên ULIS",
  },
  // Có thể tiếp tục thêm nhiều hoạt động khác (HUP Marathon, Run For Youth 95, Đại sứ Văn hóa Đọc, Light Up, v.v.)
];

export const MOCK_CRITERIA_DOCS: CriterionDocument[] = [
  {
    id: "doc_1",
    title: "Quy định xét chọn cấp Trường ĐH Ngoại ngữ",
    reviewLevel: "TRUONG",
    fileUrl: "/docs/tieu-chi-cap-truong.pdf",
  },
  {
    id: "doc_2",
    title: "Quy định xét chọn cấp ĐHQGHN",
    reviewLevel: "DHQGHN",
    fileUrl: "/docs/tieu-chi-cap-dhqg.pdf",
  },
];

export const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: "noti_1",
    title: "Hoạt động mới",
    message:
      'Có hoạt động "Giải chạy Bước chân Sinh viên" thuộc tiêu chí Thể lực tốt vừa được đăng tải.',
    type: "ACTIVITY_NEW",
    isRead: false,
    createdAt: "2026-05-11T10:00:00Z",
  },
  {
    id: "noti_2",
    title: "Gợi ý hoạt động",
    message:
      'Bạn còn thiếu tiêu chí "Hội nhập tốt". Hãy tham gia "The Golden Bell Challenge" để hoàn thành nhé!',
    type: "SUGGESTION",
    isRead: true,
    createdAt: "2026-05-10T14:00:00Z",
  },
];

export const MOCK_EVIDENCES: Evidence[] = [
  {
    id: "ev_1",
    title: "Chứng nhận tham gia Tiếp sức mùa thi",
    criterion: "TINH_NGUYEN",
    reviewLevel: "TRUONG",
    status: "APPROVED",
    fileUrl: "/storage/evidences/ev1.jpg",
    createdAt: "2026-04-15T09:00:00Z",
  },
  {
    id: "ev_2",
    title: "Chứng chỉ IELTS 7.5",
    criterion: "HOI_NHAP",
    reviewLevel: "TRUONG",
    status: "PENDING",
    fileUrl: "/storage/evidences/ev2.pdf",
    createdAt: "2026-05-01T11:00:00Z",
  },
];

export const MOCK_STATS = {
  totalActivities: 134,
  totalStudents: 1839,
  completedStudents: 629,
};

export const MOCK_LEADERBOARD = [
  {
    rank: 1,
    fullName: "Nguyễn Văn A",
    unitName: "Khoa Ngôn ngữ & Văn hóa Anh",
    activityCount: 15,
  },
  {
    rank: 2,
    fullName: "Trần Thị B",
    unitName: "Khoa Ngôn ngữ & Văn hóa Nhật Bản",
    activityCount: 12,
  },
  {
    rank: 3,
    fullName: "Lê Văn C",
    unitName: "Khoa Ngôn ngữ & Văn hóa Hàn Quốc",
    activityCount: 10,
  },
];

export const CRITERIA_DOCS = [
  {
    level: "Cấp Trường ĐHNN",
    docs: [
      {
        title: "Quy chế xét chọn Sinh viên 5 Tốt cấp Trường 2025-2026",
        year: 2026,
      },
      { title: "Hướng dẫn chấm điểm rèn luyện ULIS", year: 2025 },
      { title: "Mẫu hồ sơ đăng ký SV5T cấp Trường", year: 2025 },
    ],
  },
  {
    level: "Cấp ĐHQGHN",
    docs: [
      { title: "Quy chế Sinh viên 5 Tốt cấp ĐHQGHN", year: 2025 },
      { title: "Tiêu chuẩn xét chọn cấp ĐHQGHN 2026", year: 2026 },
    ],
  },
  {
    level: "Cấp Thành phố / Trung ương",
    docs: [
      { title: "Quy chế SV5T cấp TP Hà Nội", year: 2025 },
      {
        title: "Tiêu chuẩn SV5T cấp Trung ương – TW Hội Sinh viên VN",
        year: 2025,
      },
      { title: "Hướng dẫn nộp hồ sơ cấp TW", year: 2025 },
    ],
  },
];
