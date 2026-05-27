export interface CriterionDetail {
  required: string;
  optional?: string;
}

export interface CriteriaLevelData {
  id: string;
  slug: string;
  title: string;
  reviewLevel: "TRUONG" | "DHQGHN" | "THANH_PHO" | "TRUNG_UONG";
  description: string;
  generalStandard: string;
  note?: string;
  standards: {
    ethics: CriterionDetail;
    study: CriterionDetail;
    health: CriterionDetail;
    volunteer: CriterionDetail;
    integration: CriterionDetail;
  };
}

export const CRITERIA_LEVELS_DATA: Record<string, CriteriaLevelData> = {
  truong: {
    id: "doc_1",
    slug: "truong",
    title: "Quy định xét chọn cấp Trường",
    reviewLevel: "TRUONG",
    description: "Quy định về tiêu chuẩn và quy trình xét chọn danh hiệu Sinh viên 5 Tốt cấp Trường Đại học Ngoại ngữ",
    generalStandard: "Không vi phạm pháp luật và quy chế, có nhận thức đúng đắn về chủ trương của ĐHQGHN và ĐHNN.",
    standards: {
      ethics: {
        required: "Điểm rèn luyện đạt từ 80 điểm trở lên.",
        optional: "Cần đạt thêm 1 trong các tiêu chí ưu tiên như: là Đảng viên/đoàn viên ưu tú, tham gia thi tìm hiểu Mác - Lênin, hoặc là thanh niên tiêu biểu được khen thưởng."
      },
      study: {
        required: "Điểm trung bình tích lũy học tập đạt từ 3.0/4.0 trở lên, không có môn F.",
        optional: "Cần đạt thêm 1 tiêu chí ưu tiên như: có đề tài NCKH, sinh hoạt CLB học thuật, đạt giải thi học thuật/sáng tạo từ cấp trường, hoặc là thành viên đội tuyển thi các cấp."
      },
      health: {
        required: "Đạt 1 trong các tiêu chí về thể lực.",
        optional: "Đạt 1 trong các tiêu chí như: \"Sinh viên khỏe\" cấp trường, tham gia/đạt giải thể thao cấp trường, là thành viên tích cực hoặc tham gia rèn luyện định kỳ tại CLB thể thao."
      },
      volunteer: {
        required: "Đạt 1 trong các tiêu chí về tình nguyện.",
        optional: "Đạt 1 trong các tiêu chí: Tham gia ít nhất 03 ngày tình nguyện, tham gia tích cực phong trào Đoàn - Hội được xếp loại xuất sắc, hoặc là thành viên tích cực của 1 CLB/nhóm tình nguyện."
      },
      integration: {
        required: "Bắt buộc hoàn thành 01 khóa kỹ năng thực hành xã hội/kỹ năng mềm hoặc tập huấn cán bộ Đoàn - Hội cấp trường, và tham gia tích cực 01 hoạt động hội nhập cấp trường.",
        optional: "Các tiêu chí ưu tiên cộng thêm gồm: Đạt Ngoại ngữ 2 từ B1 trở lên hoặc tham gia 1 hoạt động giao lưu quốc tế."
      }
    }
  },
  dhqghn: {
    id: "doc_2",
    slug: "dhqghn",
    title: "Quy định xét chọn cấp ĐHQGHN",
    reviewLevel: "DHQGHN",
    description: "Hướng dẫn tiêu chuẩn xét chọn Sinh viên 5 Tốt cấp Đại học Quốc gia Hà Nội",
    generalStandard: "Đã đạt danh hiệu “Sinh viên 5 tốt” cấp Trường và được Ban Thư ký Hội Sinh viên/Ban Thường vụ Đoàn Trường đề nghị.",
    standards: {
      ethics: {
        required: "Điểm rèn luyện đạt từ 80 điểm trở lên.",
        optional: "Được chọn thêm từ các tiêu chí: Đạt giải thi Mác - Lênin, thi lịch sử, văn hóa đọc, hoặc là Gương mặt trẻ tiêu biểu cấp ĐHQGHN."
      },
      study: {
        required: "Điểm trung bình tích lũy từ 3.2/4.0 trở lên, không có môn F.",
        optional: "Tiêu chí cộng thêm yêu cầu thành tích cao hơn như: Đề tài NCKH đạt giải cấp khoa trở lên, có bài báo khoa học được công bố, đạt giải ý tưởng sáng tạo cấp trường."
      },
      health: {
        required: "Đạt tiêu chuẩn thể lực theo quy định.",
        optional: "Yêu cầu đạt \"Thanh niên khỏe\" cấp trường, hoặc tham gia và đạt giải thể thao cấp trường, hoặc là thành viên tích cực của CLB thể thao."
      },
      volunteer: {
        required: "Tham gia ít nhất 05 ngày tình nguyện/năm.",
        optional: "Có thể thay thế bằng việc được khen thưởng về hoạt động tình nguyện cấp Trường hoặc tham gia tích cực vào ít nhất 1 CLB tình nguyện."
      },
      integration: {
        required: "Bắt buộc tham gia ít nhất 01 hoạt động giao lưu quốc tế và đạt giải trong cuộc thi kiến thức hội nhập hoặc ngoại ngữ cấp Trường.",
        optional: "Tiêu chí chọn thêm nổi bật: Đạt chứng chỉ Tiếng Anh trình độ B1 trở lên hoặc điểm trung bình các học phần ngoại ngữ tích lũy đạt từ 3.2/4.0 trở lên."
      }
    }
  },
  "thanh-pho": {
    id: "doc_3",
    slug: "thanh-pho",
    title: "Quy định xét chọn cấp Thành phố",
    reviewLevel: "THANH_PHO",
    description: "Tiêu chuẩn và thủ tục xét chọn danh hiệu Sinh viên 5 Tốt cấp Thành phố Hà Nội",
    note: "Giai đoạn 2019 - 2023",
    generalStandard: "Đạt danh hiệu cấp Trường và được đề nghị xét ở cấp Thành phố.",
    standards: {
      ethics: {
        required: "Điểm rèn luyện đạt từ 80 điểm trở lên.",
        optional: "Cần đạt ít nhất 1 tiêu chí phụ: Thành viên đội thi Mác - Lênin cấp trường, tham gia thi tìm hiểu Nghị quyết Đại hội Đảng do Thành đoàn tổ chức, hoặc là thanh niên tiên tiến, người tốt việc tốt được biểu dương cấp trường."
      },
      study: {
        required: "Điểm trung bình tích lũy đối với hệ Đại học từ 3.2/4.0 (hoặc 8.0/10); hệ Cao đẳng từ 3.0/4.0 (hoặc 7.5/10).",
        optional: "Cần đạt ít nhất 1 tiêu chí phụ: Có đề tài NCKH đạt giải cấp khoa trở lên, có tham luận hội thảo khoa học, sở hữu bằng sáng chế, là thành viên đội tuyển thi học thuật cấp khu vực/quốc gia, hoặc đạt giải ý tưởng sáng tạo từ cấp tỉnh trở lên."
      },
      health: {
        required: "Đạt tiêu chuẩn thể lực tốt.",
        optional: "Đạt danh hiệu \"Sinh viên khỏe\" cấp trường, đạt giải tại các giải thể thao phong trào cấp trường/địa phương trở lên, hoặc là thành viên tích cực CLB thể thao."
      },
      volunteer: {
        required: "Bắt buộc tham gia ít nhất 05 ngày tình nguyện/năm (được phép cộng dồn).",
        optional: "Các hoạt động tình nguyện phải được xác nhận bởi Đoàn trường hoặc đơn vị tổ chức có thẩm quyền."
      },
      integration: {
        required: "Bắt buộc hoàn thành 1 khóa kỹ năng mềm, tham gia ít nhất 1 hoạt động hội nhập cấp trường, và đạt chứng chỉ Tiếng Anh trình độ B1 hoặc tổng điểm học phần ngoại ngữ tích lũy từ 3.2/4.0 trở lên.",
        optional: "Tiêu chí cộng thêm có thể là: Tham gia hoạt động giao lưu quốc tế, tham gia thi Tài năng Anh ngữ cấp trường hoặc tham gia Leader Camp."
      }
    }
  },
  "trung-uong": {
    id: "doc_4",
    slug: "trung-uong",
    title: "Quy định xét chọn cấp Trung ương",
    reviewLevel: "TRUNG_UONG",
    description: "Hướng dẫn xét chọn Sinh viên 5 Tốt cấp Trung ương theo quy định của TW Đoàn",
    note: "Cập nhật mới nhất - Áp dụng từ năm học 2025 - 2026",
    generalStandard: "Phải đạt danh hiệu cấp tỉnh/thành phố và được Ban Thư ký Hội Sinh viên/Đoàn Thanh niên cấp tỉnh đề nghị.",
    standards: {
      ethics: {
        required: "Điểm rèn luyện phải đạt mức xuất sắc, từ 95 điểm trở lên.",
        optional: "Cần đạt thêm 1 trong các tiêu chí chọn thêm: Là Đảng viên hoàn thành xuất sắc nhiệm vụ, hoặc được khen thưởng danh hiệu thanh niên tiên tiến làm theo lời Bác/sống đẹp từ cấp tỉnh/thành phố trở lên."
      },
      study: {
        required: "Điểm trung bình học tập đối với hệ Đại học từ 3.4/4.0 (hoặc 8.5/10); hệ Cao đẳng từ 3.2/4.0 (hoặc 8.0/10).",
        optional: "Đạt thêm 1 tiêu chí khắt khe: Đề tài NCKH loại tốt cấp tỉnh (đối với Đại học) hoặc cấp trường (đối với Cao đẳng), là tác giả chính của bài viết khoa học đăng trên tạp chí quốc tế uy tín (WoS/Scopus Q1-Q4), có sản phẩm sáng chế cấp tỉnh, đạt giải Ba trở lên cuộc thi học thuật cấp quốc gia/quốc tế, hoặc đạt giải Ba thi tay nghề cấp tỉnh (chỉ áp dụng hệ Cao đẳng)."
      },
      health: {
        required: "Bắt buộc tham gia và đạt giải thể thao từ cấp trường trở lên (hoặc tham gia hoạt động thể dục thể thao cấp Trung ương).",
        optional: "Cần đạt thêm tiêu chí phụ: Đạt giải Ba trở lên trong các hoạt động thể thao cấp tỉnh trở lên."
      },
      volunteer: {
        required: "Tham gia ít nhất 05 ngày tình nguyện/năm.",
        optional: "Đồng thời phải đáp ứng 1 tiêu chí cộng thêm: Là người sáng lập hoặc đồng sáng lập dự án tình nguyện mang lại kết quả thiết thực cho xã hội, hoặc được khen thưởng từ cấp tỉnh trở lên về thành tích tình nguyện."
      },
      integration: {
        required: "Bắt buộc đạt chứng chỉ Tiếng Anh trình độ B2 trở lên (hoặc tổng điểm các học phần ngoại ngữ tích lũy đạt từ 3.4/4.0 trở lên), và bắt buộc tham gia ít nhất 01 hoạt động giao lưu quốc tế.",
        optional: "Đồng thời đáp ứng ít nhất 1 tiêu chí ưu tiên: Là ban chủ nhiệm CLB ngoại ngữ, đạt giải Ba trở lên các cuộc thi học thuật bằng ngoại ngữ cấp tỉnh, hoặc sở hữu chứng chỉ tương đương B1 đối với ngoại ngữ thứ hai."
      }
    }
  }
};
