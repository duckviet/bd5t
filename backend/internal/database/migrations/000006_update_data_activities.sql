BEGIN;

UPDATE activities SET
    title = 'Cuộc thi Lý tưởng Sinh viên năm 2026',
    thumbnail_url = 'https://pub-0c10569654884b04b7cd1417fb5ffa05.r2.dev/thumbnail/7580b837-471f-4006-b190-d36f3d17b4bd.png',
    organizer = 'Sinh viên 5 tốt - Đại học Kinh tế Quốc dân',
    contact_info = 'Hotline: 0833137563 (Ms. Thu Hương), 0971654082 (Ms. Mai Hoa)',
    short_description = 'Cuộc thi chính thức cho tiêu chí Đạo đức tốt trong Tuần lễ Sinh viên 5 tốt.',
    description = 'Tuổi trẻ không chỉ là những tháng ngày học tập và trải nghiệm, mà còn là hành trình đi tìm cho mình một lý tưởng đủ lớn để theo đuổi. Cuộc thi Lý tưởng Sinh viên 2026 là sân chơi giúp sinh viên định hướng giá trị, nuôi dưỡng bản lĩnh và trách nhiệm với cộng đồng.',
    rules = 'Đăng ký online, tham gia vòng sơ loại.',
    rewards = 'Điểm rèn luyện, giấy chứng nhận tiêu chí Đạo đức tốt, cơ hội vào chung kết Sinh viên 5 tốt.',
    registration_url = 'https://bom.so/DangkyLTSV2026',
    start_date = '2026-04-08',
    end_date = '2026-05-18',
    review_level = 'TRUONG',
    location = 'Hà Nội',
    target_audience = 'Sinh viên các trường Đại học/Học viện/Cao đẳng tại Hà Nội',
    updated_at = NOW()
WHERE id = '30000000-0000-4000-8000-000000000001';

UPDATE activities SET
    title = 'Cuộc thi Tìm hiểu Nghị quyết Đại hội XIV của Đảng',
    thumbnail_url = 'https://pub-0c10569654884b04b7cd1417fb5ffa05.r2.dev/thumbnail/14b7c0c7-55bc-4f10-ad4a-08f2d21d492e.jpeg',
    organizer = 'Đoàn Thanh niên - Hội Sinh viên Trường Đại học Khoa học Tự nhiên, ĐHQGHN',
    contact_info = '',
    short_description = 'Cuộc thi tìm hiểu Nghị quyết Đại hội Đảng XIV.',
    description = 'Hòa chung không khí Chào mừng 96 năm Kỷ niệm Ngày thành lập Đảng Cộng sản Việt Nam (3/2/1930 - 3/2/2026) và chúc mừng Đại hội Đảng toàn quốc lần thứ XIV diễn ra thành công tốt đẹp, Đoàn Thanh niên - Hội Sinh viên nhà trường kết hợp với Liên chi Đoàn - Liên chi Hội khoa Hóa học và Câu lạc bộ Lý luận trẻ phát động cuộc thi "Tìm hiểu Nghị quyết Đại hội XIV của Đảng".',
    rules = 'Thi trực tuyến trên myaloha.vn',
    rewards = 'Giấy chứng nhận, điểm rèn luyện',
    registration_url = 'https://myaloha.vn/ct/Um2fSf',
    start_date = '2026-02-11',
    end_date = '2026-02-25',
    review_level = 'TRUONG',
    location = 'ĐHQGHN',
    target_audience = 'Sinh viên ĐHQGHN',
    updated_at = NOW()
WHERE id = '30000000-0000-4000-8000-000000000002';

UPDATE activities SET
    title = 'Cuộc thi trực tuyến Tìm hiểu về Biển đảo Việt Nam',
    thumbnail_url = 'https://pub-0c10569654884b04b7cd1417fb5ffa05.r2.dev/thumbnail/a0fca896-31c2-4d88-a736-89edd21d4122.jpg',
    organizer = 'Cụm 3 Phường Tân Hưng phối hợp Khoa Quản trị Kinh doanh',
    contact_info = '',
    short_description = 'Nâng cao nhận thức về chủ quyền biển đảo.',
    description = 'Cuộc thi nhằm bồi đắp lòng yêu nước, trách nhiệm của thế hệ trẻ đối với chủ quyền thiêng liêng của Tổ quốc.',
    rules = 'Quét QR hoặc truy cập link để thi trực tuyến.',
    rewards = 'Giấy chứng nhận',
    registration_url = 'https://myaloha.vn/cuoc-thi/cuoc-thi-truc-tuyen-tim-hieu-ve-bien-dao-viet-nam-voi-chu-de-tuoi-tre-cum-thi-dua-so-3-huong-ve-bien-dao-to-quoc-126349',
    start_date = '2026-01-14',
    end_date = '2026-01-16',
    review_level = 'TRUONG',
    location = 'Hà Nội',
    target_audience = 'Đoàn viên, thanh niên',
    updated_at = NOW()
WHERE id = '30000000-0000-4000-8000-000000000003';

UPDATE activities SET
    title = 'Tuần lễ Tri ân Bác 2026',
    thumbnail_url = 'https://pub-0c10569654884b04b7cd1417fb5ffa05.r2.dev/thumbnail/03854680-aeae-48aa-8f67-3db7357b4637.jpg',
    organizer = 'Liên Chi Đoàn - Hội Viện Đào tạo Quốc tế - Trường Đại học Kinh tế - ĐHQGHN',
    contact_info = '',
    short_description = 'Thi thiết kế poster tri ân Chủ tịch Hồ Chí Minh.',
    description = 'Hướng tới kỷ niệm 136 năm ngày sinh Chủ tịch Hồ Chí Minh, cuộc thi khuyến khích sinh viên thể hiện lòng biết ơn và học tập theo tấm gương đạo đức Bác.',
    rules = 'Thiết kế poster/ảnh truyền thông theo các chủ đề về cuộc đời, sự nghiệp và tư tưởng Hồ Chí Minh.',
    rewards = 'Giấy chứng nhận tiêu chí Đạo đức tốt, giải thưởng',
    registration_url = 'https://forms.gle/jW32JxeE5JjzD6n57',
    start_date = '2026-05-06',
    end_date = '2026-05-12',
    review_level = 'TRUONG',
    location = 'ĐHQGHN',
    target_audience = 'Sinh viên UEB',
    updated_at = NOW()
WHERE id = '30000000-0000-4000-8000-000000000004';

UPDATE activities SET
    title = 'Olympic Các môn Khoa học Mác – Lênin, Tư tưởng Hồ Chí Minh',
    thumbnail_url = 'https://pub-0c10569654884b04b7cd1417fb5ffa05.r2.dev/thumbnail/271dd800-9e97-466f-aa63-8f03984386ce.jpg',
    organizer = 'Hội Sinh viên Trường Đại học Giao thông Vận tải',
    contact_info = '',
    short_description = 'Cuộc thi Olympic lý luận chính trị.',
    description = 'Sự kiện chào mừng Đại hội XIV của Đảng, hỗ trợ sinh viên đạt tiêu chí Sinh viên 5 tốt.',
    rules = 'Thi online ngày 08/05/2026',
    rewards = 'Giấy chứng nhận tiêu chí Đạo đức tốt',
    registration_url = 'https://forms.gle/Ze1wSjoShvKSoFTN8',
    start_date = '2026-05-06',
    end_date = '2026-05-08',
    review_level = 'TRUONG',
    location = 'Đại học Giao thông Vận tải',
    target_audience = 'Sinh viên UTC',
    updated_at = NOW()
WHERE id = '30000000-0000-4000-8000-000000000005';

UPDATE activities SET
    title = 'Cuộc thi Tìm hiểu Bản sắc Văn hóa ASEAN 2026',
    thumbnail_url = 'https://pub-0c10569654884b04b7cd1417fb5ffa05.r2.dev/thumbnail/56c1eb31-95cf-4d2b-9ec3-fe7f94183a0c.jpg',
    organizer = 'Hội Sinh viên Trường Đại học Giao thông Vận tải',
    contact_info = '',
    short_description = 'Cuộc thi hội nhập quốc tế.',
    description = 'Giúp sinh viên nâng cao kiến thức về văn hóa các nước ASEAN.',
    rules = 'Thi online ngày 09/05/2026',
    rewards = 'Giấy chứng nhận tiêu chí Hội nhập tốt',
    registration_url = 'https://forms.gle/Ze1wSjoShvKSoFTN8',
    start_date = '2026-05-06',
    end_date = '2026-05-09',
    review_level = 'TRUONG',
    location = 'Đại học Giao thông Vận tải',
    target_audience = 'Sinh viên UTC',
    updated_at = NOW()
WHERE id = '30000000-0000-4000-8000-000000000006';

UPDATE activities SET
    title = 'Con đường ánh sáng lần thứ IX - 2026',
    thumbnail_url = 'https://pub-0c10569654884b04b7cd1417fb5ffa05.r2.dev/thumbnail/255cef6f-5bfa-42f8-b0e3-4d774dc11fd4.jpg',
    organizer = 'Đoàn Thanh niên - Hội Sinh viên ĐHQGHN',
    contact_info = '',
    short_description = 'Cuộc thi tìm hiểu Chủ nghĩa Mác-Lênin, Tư tưởng Hồ Chí Minh và Lịch sử Đảng.',
    description = 'Sân chơi học thuật quy mô lớn giúp sinh viên rèn luyện lý tưởng cách mạng.',
    rules = '3 vòng thi',
    rewards = 'Giấy chứng nhận, ưu tiên Sinh viên 5 tốt',
    registration_url = '',
    start_date = '2026-03-09',
    end_date = '2026-04-23',
    review_level = 'DHQGHN',
    location = 'ĐHQGHN',
    target_audience = 'Sinh viên ĐHQGHN',
    updated_at = NOW()
WHERE id = '30000000-0000-4000-8000-000000000007';

UPDATE activities SET
    title = 'Thắp lửa Khởi nghiệp Sáng tạo 2025',
    thumbnail_url = 'https://pub-0c10569654884b04b7cd1417fb5ffa05.r2.dev/thumbnail/bf646133-43b9-4d8b-b5c3-106bd92c9bca.jpg',
    organizer = 'Bộ phận Đổi mới Sáng tạo - ULIS',
    contact_info = '',
    short_description = 'Cuộc thi ý tưởng khởi nghiệp.',
    description = 'Sân chơi dành cho sinh viên có ý tưởng sáng tạo, giải quyết vấn đề xã hội.',
    rules = 'Nộp ý tưởng dự án',
    rewards = 'Giải thưởng tiền mặt, hỗ trợ ươm tạo',
    registration_url = 'https://bit.ly/thapluakhoinghiepsangtao2025',
    start_date = '2025-09-25',
    end_date = '2025-12-06',
    review_level = 'TRUONG',
    location = 'ULIS - ĐHQGHN',
    target_audience = 'Sinh viên ULIS và các trường',
    updated_at = NOW()
WHERE id = '30000000-0000-4000-8000-000000000008';

UPDATE activities SET
    title = 'China International College Students'' Innovation Competition 2026',
    thumbnail_url = 'https://pub-0c10569654884b04b7cd1417fb5ffa05.r2.dev/thumbnail/04463c4e-7b8c-410b-b3ac-b5d324eb0a7c.png',
    organizer = 'Ban Tổ chức CICSIC',
    contact_info = '',
    short_description = 'Cuộc thi sáng tạo quốc tế.',
    description = 'Cuộc thi đổi mới sáng tạo dành cho sinh viên quốc tế, có vòng tại Việt Nam và chung kết thế giới.',
    rules = 'Nộp kế hoạch kinh doanh tiếng Anh/Trung',
    rewards = 'Tiền mặt + cơ hội vào chung kết Malaysia và Trung Quốc',
    registration_url = 'bit.ly/ciscisvietnam2026',
    start_date = '2026-05-01',
    end_date = '2026-05-30',
    review_level = 'TRUNG_UONG',
    location = 'Toàn quốc',
    target_audience = 'Sinh viên Việt Nam',
    updated_at = NOW()
WHERE id = '30000000-0000-4000-8000-000000000009';

UPDATE activities SET
    title = 'Những bước chân Sinh viên Thủ đô lần thứ I',
    thumbnail_url = 'https://pub-0c10569654884b04b7cd1417fb5ffa05.r2.dev/thumbnail/1ca51f8f-f6d2-4bc0-9678-0e318b166d24.jpg',
    organizer = 'Hội Sinh viên Việt Nam TP. Hà Nội',
    contact_info = '',
    short_description = 'Giải chạy trực tuyến rèn luyện thể lực.',
    description = 'Giải chạy thúc đẩy tinh thần rèn luyện thể chất cho sinh viên Thủ đô, hỗ trợ tiêu chí Thể lực tốt.',
    rules = 'Chạy tối thiểu 30km (nữ)/50km (nam) trong 15 ngày qua app UpRace',
    rewards = 'Giấy chứng nhận Thể lực tốt cấp thành phố, quà tặng',
    registration_url = 'Link trên Fanpage Tình nguyện viên Thủ đô',
    start_date = '2026-05-01',
    end_date = '2026-05-15',
    review_level = 'THANH_PHO',
    location = 'Hà Nội',
    target_audience = 'Sinh viên Hà Nội',
    updated_at = NOW()
WHERE id = '30000000-0000-4000-8000-00000000000a';

UPDATE activities SET
    title = 'Những cuốn sách trong tôi mùa 9: Khúc Vĩ Thanh',
    thumbnail_url = 'https://pub-0c10569654884b04b7cd1417fb5ffa05.r2.dev/thumbnail/51a5ce9b-bc58-47e2-9625-0e2199c5a6bd.jpg',
    organizer = 'CLB Tủ sách sống NEU',
    contact_info = '',
    short_description = 'Cuộc thi review sách và viết lách.',
    description = 'Cuộc thi lan tỏa văn hóa đọc với chủ đề Khúc Vĩ Thanh.',
    rules = '3 vòng: Review sách → Trình bày quan điểm → Chung kết',
    rewards = '15 điểm Đoàn, cơ hội tiêu chí Học tập tốt, tiền mặt',
    registration_url = 'https://bom.so/O6lK0l',
    start_date = '2026-03-23',
    end_date = '2026-05-20',
    review_level = 'TRUONG',
    location = 'Toàn miền Bắc',
    target_audience = 'Học sinh, sinh viên miền Bắc',
    updated_at = NOW()
WHERE id = '30000000-0000-4000-8000-00000000000b';

UPDATE activities SET
    title = 'Sắc Hồng Hy Vọng XXVI - Ngày hội hiến máu',
    thumbnail_url = 'https://pub-0c10569654884b04b7cd1417fb5ffa05.r2.dev/thumbnail/209b4675-1eb1-4ef3-9267-1ff8feeb3ae3.jpg',
    organizer = 'UET Sắc Hồng Hy Vọng',
    contact_info = '',
    short_description = 'Ngày hội hiến máu ĐHQGHN.',
    description = 'Hoạt động hiến máu tình nguyện với thông điệp Thanh niên Việt Nam - Sẵn sàng hiến máu.',
    rules = 'Đăng ký và tham gia hiến máu trực tiếp',
    rewards = 'Giấy chứng nhận tình nguyện',
    registration_url = 'https://bom.so/SacHongHyVong-XXVI',
    start_date = '2026-05-11',
    end_date = '2026-05-11',
    review_level = 'DHQGHN',
    location = 'ĐHQGHN',
    target_audience = 'Toàn ĐHQGHN',
    updated_at = NOW()
WHERE id = '30000000-0000-4000-8000-00000000000c';

UPDATE activities SET
    title = 'Gió vượt đèo mây - Hành trình tình nguyện vùng cao',
    thumbnail_url = 'https://pub-0c10569654884b04b7cd1417fb5ffa05.r2.dev/thumbnail/8477e9a9-242e-4e19-8248-3037ca473574.jpg',
    organizer = 'Liên chi Hội Sinh viên Khoa Tài chính Ngân hàng - TMU',
    contact_info = '',
    short_description = 'Chương trình tình nguyện hỗ trợ vùng cao.',
    description = 'Mang sách vở, đồ dùng học tập và tình yêu thương đến xã Mường Vang, Phú Thọ.',
    rules = 'Ủng hộ hiện kim/hiện vật + đăng ký tham gia chuyến đi',
    rewards = 'Giấy chứng nhận 1 ngày Tình nguyện tốt',
    registration_url = 'https://forms.gle/c4PgPETz5p1Qo3zj7',
    start_date = '2026-06-20',
    end_date = '2026-06-21',
    review_level = 'TRUONG',
    location = 'Phú Thọ',
    target_audience = 'Sinh viên TMU và các trường',
    updated_at = NOW()
WHERE id = '30000000-0000-4000-8000-00000000000d';

UPDATE activities SET
    title = 'Chương trình Tàu Thanh niên Đông Nam Á - Nhật Bản lần thứ 50 (SSEAYP 2027)',
    thumbnail_url = 'https://pub-0c10569654884b04b7cd1417fb5ffa05.r2.dev/thumbnail/4bb2a157-d9cd-4c28-9802-40bbe6e4d85c.jpg',
    organizer = 'Trung ương Đoàn TNCS Hồ Chí Minh',
    contact_info = '',
    short_description = 'Chương trình giao lưu thanh niên quốc tế.',
    description = 'Cơ hội lớn để đại diện thanh niên Việt Nam giao lưu với các nước ASEAN và Nhật Bản.',
    rules = 'Nộp hồ sơ + phỏng vấn',
    rewards = 'Chứng nhận quốc tế, trải nghiệm trên tàu',
    registration_url = 'https://1.org.vn/cdkNIM',
    start_date = '2026-05-01',
    end_date = '2026-05-15',
    review_level = 'TRUNG_UONG',
    location = 'ASEAN + Nhật Bản',
    target_audience = 'Thanh niên 18-30 tuổi',
    updated_at = NOW()
WHERE id = '30000000-0000-4000-8000-00000000000e';

UPDATE activities SET
    title = 'The Golden Bell Challenge 2026 - The Synapse Sphere',
    thumbnail_url = 'https://pub-0c10569654884b04b7cd1417fb5ffa05.r2.dev/thumbnail/82c96bea-f983-42ec-afd9-718811c5354a.jpg',
    organizer = 'CLB Tiếng Anh EC ULIS',
    contact_info = '',
    short_description = 'Cuộc thi hùng biện tiếng Anh.',
    description = 'Rung Chuông Vàng phiên bản tiếng Anh với chủ đề Đa vũ trụ.',
    rules = 'Vòng mở đơn + Chung kết',
    rewards = 'Giấy chứng nhận A3, học bổng, tiền mặt',
    registration_url = 'https://bit.ly/GBC26_ApplicationForm',
    start_date = '2026-04-06',
    end_date = '2026-05-10',
    review_level = 'TRUONG',
    location = 'Hà Nội',
    target_audience = 'Sinh viên Hà Nội',
    updated_at = NOW()
WHERE id = '30000000-0000-4000-8000-00000000000f';

UPDATE activities SET
    title = 'HUP Marathon 2026',
    thumbnail_url = 'https://pub-0c10569654884b04b7cd1417fb5ffa05.r2.dev/thumbnail/2dba37f0-fe2e-4887-9219-14d9de73d7f2.jpg',
    organizer = 'Hội Sinh viên Trường Đại học Dược Hà Nội',
    contact_info = '',
    short_description = 'Giải chạy marathon sinh viên Dược.',
    description = 'Hoạt động rèn luyện thể lực và lan tỏa tinh thần thể thao.',
    rules = 'Đăng ký trước 29/04/2026.',
    rewards = 'Giấy chứng nhận Thể lực tốt.',
    registration_url = 'https://forms.gle/hEL9RdYEniLmFssh8',
    start_date = '2026-04-15',
    end_date = '2026-04-29',
    review_level = 'TRUONG',
    location = 'Đại học Dược Hà Nội',
    target_audience = 'Sinh viên, giảng viên ĐH Dược HN',
    updated_at = NOW()
WHERE id = '30000000-0000-4000-8000-000000000010';

UPDATE activities SET
    title = 'Run For Youth 95 - 95 Năm Tiếp Bước Dưới Cờ Đoàn',
    thumbnail_url = 'https://pub-0c10569654884b04b7cd1417fb5ffa05.r2.dev/thumbnail/79b9a090-34e6-4ef5-a9d3-cc5fb026ce4a.jpg',
    organizer = 'Đoàn Thanh niên Mặt trận Tổ quốc',
    contact_info = '',
    short_description = 'Giải chạy kỷ niệm 95 năm Ngày thành lập Đoàn.',
    description = 'Hoạt động chạy bộ trực tuyến chào mừng 95 năm Ngày thành lập Đoàn TNCS Hồ Chí Minh.',
    rules = 'Chạy/đi bộ tích lũy km qua Strava.',
    rewards = 'Chứng nhận hoàn thành, giải cá nhân & tập thể.',
    registration_url = 'https://eclub.vnptweb.vn',
    start_date = '2026-03-21',
    end_date = '2026-04-11',
    review_level = 'TRUNG_UONG',
    location = 'Toàn quốc',
    target_audience = 'Thanh niên toàn quốc',
    updated_at = NOW()
WHERE id = '30000000-0000-4000-8000-000000000011';

UPDATE activities SET
    title = 'Dự án Phất Quạt Họa Văn',
    thumbnail_url = 'https://pub-0c10569654884b04b7cd1417fb5ffa05.r2.dev/thumbnail/ba349e7f-e924-406c-b46f-836b9975d45e.jpg',
    organizer = 'Sinh viên Học viện Báo chí & Tuyên truyền',
    contact_info = '',
    short_description = 'Dự án bảo tồn văn hóa làng nghề qua triển lãm & workshop.',
    description = 'Triển lãm và workshop trải nghiệm văn hóa với nghệ nhân làng nghề Chàng Sơn.',
    rules = 'Ứng tuyển vị trí Content, Media, Event, External Relations.',
    rewards = 'Giấy chứng nhận, trải nghiệm thực tế.',
    registration_url = 'Comment dưới post tuyển dụng',
    start_date = '2026-04-12',
    end_date = '2026-04-12',
    review_level = 'TRUONG',
    location = 'Bảo tàng Hà Nội',
    target_audience = 'Sinh viên Hà Nội',
    updated_at = NOW()
WHERE id = '30000000-0000-4000-8000-000000000012';

UPDATE activities SET
    title = 'Bước chân Sinh viên - Giải chạy vRace',
    thumbnail_url = 'https://pub-0c10569654884b04b7cd1417fb5ffa05.r2.dev/thumbnail/6aeaebee-37fe-4dd6-b460-b1a99a4da1aa.jpg',
    organizer = 'Trung ương Hội Sinh viên Việt Nam',
    contact_info = 'Email: vrace@fpt.com | Hotline: 1900 633 003',
    short_description = 'Giải chạy rèn luyện thể lực nhận Giấy chứng nhận Trung ương.',
    description = 'Hoạt động chạy bộ trực tuyến giúp sinh viên rèn luyện thể lực, hoàn thành tiêu chí Thể lực tốt. Hoàn thành 30km (nữ) / 50km (nam) sẽ nhận Giấy chứng nhận Thể lực tốt cấp Trung ương.',
    rules = 'Tích km qua ứng dụng vRace.',
    rewards = 'Giấy chứng nhận Thể lực tốt cấp Trung ương, quà tặng từ nhà tài trợ.',
    registration_url = 'https://www.facebook.com/share/1BojGf54dZ/',
    start_date = '2026-04-01',
    end_date = '2026-05-31',
    review_level = 'TRUNG_UONG',
    location = 'Toàn quốc',
    target_audience = 'Sinh viên toàn quốc',
    updated_at = NOW()
WHERE id = '30000000-0000-4000-8000-000000000013';

UPDATE activities SET
    title = 'Giải chạy Thanh niên khỏe - Ngày hội Kết nối 2026',
    thumbnail_url = 'https://pub-0c10569654884b04b7cd1417fb5ffa05.r2.dev/thumbnail/85b1f501-9954-4b74-8cfb-fca83ba73b0e.jpg',
    organizer = 'CLB/ULIS',
    contact_info = '',
    short_description = 'Giải chạy ngắn trong Ngày hội Kết nối ULIS.',
    description = 'Giải chạy 1km (chạy thành tích hoặc phong trào) giúp sinh viên rèn luyện thể lực và nhận chứng nhận Thanh niên khỏe cấp trường.',
    rules = 'Tham gia chạy trong 15 phút tại sự kiện.',
    rewards = 'Chứng nhận Thanh niên khỏe cấp Trường.',
    registration_url = '',
    start_date = '2026-04-14',
    end_date = '2026-04-14',
    review_level = 'TRUONG',
    location = 'ULIS - ĐHQGHN',
    target_audience = 'Sinh viên ULIS',
    updated_at = NOW()
WHERE id = '30000000-0000-4000-8000-000000000014';

UPDATE activities SET
    title = 'Hội thao Sinh viên khỏe ĐHQGHN 2025',
    thumbnail_url = 'https://pub-0c10569654884b04b7cd1417fb5ffa05.r2.dev/thumbnail/b8864d51-8ae8-4dc7-be3c-98b157c00d2a.png',
    organizer = 'ĐHQGHN',
    contact_info = '',
    short_description = 'Hội thao thể thao sinh viên Đại học Quốc gia Hà Nội.',
    description = 'Các nội dung thi đấu: Chạy 100m, chạy dài, bật xa, nhảy dây, chống đẩy, gập bụng...',
    rules = 'Tham gia tối thiểu 3/5 nội dung thi đấu.',
    rewards = 'Xếp loại Đạt - Khá - Giỏi, giấy chứng nhận.',
    registration_url = 'https://tinyurl.com/hoithaosvk2025',
    start_date = '2025-10-25',
    end_date = '2025-10-25',
    review_level = 'DHQGHN',
    location = 'Hòa Lạc - ĐHQGHN',
    target_audience = 'Sinh viên ĐHQGHN',
    updated_at = NOW()
WHERE id = '30000000-0000-4000-8000-000000000015';

UPDATE activities SET
    title = 'Tuyển Cộng tác viên Đội CTV Hội Sinh viên Việt Nam TP. Hà Nội Gen 05',
    thumbnail_url = 'https://pub-0c10569654884b04b7cd1417fb5ffa05.r2.dev/thumbnail/abb8a058-c8ac-444f-8a13-9f3a5635b960.jpg',
    organizer = 'Đội CTV Hội Sinh viên Việt Nam TP. Hà Nội',
    contact_info = 'Email: Doictvhoisinhvienvietnamtphn@gmail.com',
    short_description = 'Tuyển cộng tác viên Gen 05 cho Hội Sinh viên TP. Hà Nội.',
    description = 'Tuyển 80-100 cộng tác viên làm việc tại 5 ban: Nghiệp vụ, Nhân sự, Đối ngoại, Truyền thông, Khánh tiết.',
    rules = 'Điền đơn trước 12h00 ngày 22/04/2026.',
    rewards = 'Giấy chứng nhận, Bằng khen, môi trường làm việc chuyên nghiệp.',
    registration_url = 'https://byvn.net/wr6Y',
    start_date = '2026-04-13',
    end_date = '2026-04-22',
    review_level = 'THANH_PHO',
    location = 'Hà Nội',
    target_audience = 'Sinh viên năm 1-2 tại Hà Nội',
    updated_at = NOW()
WHERE id = '30000000-0000-4000-8000-000000000016';

UPDATE activities SET
    title = 'Lớp Học Cầu Vồng - Tình nguyện viên dạy học vùng cao',
    thumbnail_url = 'https://pub-0c10569654884b04b7cd1417fb5ffa05.r2.dev/thumbnail/d2d80887-a991-4e41-92bf-35f06417ce3e.jpg',
    organizer = 'Lớp Học Cầu Vồng',
    contact_info = 'Email: lophoccauvong15@gmail.com | Phone: 0342124325',
    short_description = 'Tình nguyện dạy học cho trẻ em vùng cao.',
    description = 'Tìm kiếm tình nguyện viên dạy học (đặc biệt Tiếng Anh) tại vùng cao trong thời gian dài.',
    rules = 'Nộp CV + trả lời câu hỏi, nộp tiền cam kết 1.000.000 VNĐ (hoàn lại khi hoàn thành).',
    rewards = 'Giấy chứng nhận có mộc đỏ sau 4 tháng.',
    registration_url = 'Gửi email: lophoccauvong15@gmail.com',
    start_date = '2026-01-01',
    end_date = '2026-12-31',
    review_level = 'TRUNG_UONG',
    location = 'Vùng cao',
    target_audience = 'Sinh viên nhiệt huyết',
    updated_at = NOW()
WHERE id = '30000000-0000-4000-8000-000000000017';

UPDATE activities SET
    title = 'Tình nguyện viên Online - Cộng đồng Tình nguyện Việt Nam',
    thumbnail_url = 'https://pub-0c10569654884b04b7cd1417fb5ffa05.r2.dev/thumbnail/2bd88573-9408-48ab-a2b0-63ed1d3bdc51.jpg',
    organizer = 'Cộng đồng Tình nguyện Việt Nam',
    contact_info = '',
    short_description = 'Tình nguyện trực tuyến không cần ra khỏi nhà.',
    description = 'Tham gia các hoạt động tình nguyện online, lan tỏa giá trị tích cực qua mạng xã hội và hỗ trợ dự án cộng đồng.',
    rules = 'Đăng ký và hoàn thành nhiệm vụ online.',
    rewards = 'Giấy chứng nhận online.',
    registration_url = 'https://docs.google.com/.../1FAIpQLScdKME4dFM.../viewform',
    start_date = '2026-01-01',
    end_date = '2026-12-31',
    review_level = 'TRUNG_UONG',
    location = 'Toàn quốc (Online)',
    target_audience = 'Mọi sinh viên',
    updated_at = NOW()
WHERE id = '30000000-0000-4000-8000-000000000018';

UPDATE activities SET
    title = 'Sứ Giả Nhân Ái PFC Mùa thứ 6',
    thumbnail_url = 'https://pub-0c10569654884b04b7cd1417fb5ffa05.r2.dev/thumbnail/d5859072-036e-40df-83c5-8b946469afc7.jpg',
    organizer = 'Dự án PFC',
    contact_info = '',
    short_description = 'Sứ giả lan tỏa nhân ái cho trẻ em khó khăn.',
    description = 'Trở thành Sứ giả Nhân ái, lan tỏa thông điệp sống đẹp và hỗ trợ trẻ em mồ côi, khuyết tật.',
    rules = 'Đăng ký và hoàn thành nhiệm vụ trong mùa.',
    rewards = 'Giấy chứng nhận có mộc đỏ, tham gia vinh danh.',
    registration_url = 'https://forms.gle/7JCm6bLv6oCZtTs2A',
    start_date = '2026-01-01',
    end_date = '2026-12-31',
    review_level = 'TRUNG_UONG',
    location = 'Toàn quốc',
    target_audience = 'Sinh viên và thanh niên',
    updated_at = NOW()
WHERE id = '30000000-0000-4000-8000-000000000019';

UPDATE activities SET
    title = 'LIGHT UP 2026 - The Multiverse',
    thumbnail_url = 'https://pub-0c10569654884b04b7cd1417fb5ffa05.r2.dev/thumbnail/bf4cd75e-0191-4e68-a3e4-fa2bc97f03b1.jpg',
    organizer = 'CLB Hùng biện PSC - ULIS',
    contact_info = '',
    short_description = 'Cuộc thi hùng biện tiếng Anh LIGHT UP.',
    description = 'Cuộc thi hùng biện tiếng Anh thường niên với chủ đề Đa vũ trụ.',
    rules = 'Vòng đăng ký → Sơ khảo → Bán kết → Chung kết.',
    rewards = 'Giấy chứng nhận, giải thưởng lớn.',
    registration_url = 'https://forms.gle/RfNruU8a6Xg3PBbw5',
    start_date = '2026-05-02',
    end_date = '2026-06-05',
    review_level = 'TRUONG',
    location = 'ULIS - ĐHQGHN',
    target_audience = 'Sinh viên ULIS và các trường',
    updated_at = NOW()
WHERE id = '30000000-0000-4000-8000-00000000001a';

UPDATE activities SET
    title = 'Cuộc thi Đại sứ Văn hóa Đọc 2025',
    thumbnail_url = 'https://pub-0c10569654884b04b7cd1417fb5ffa05.r2.dev/thumbnail/e7e3d587-5c4d-4bf5-a146-8e605e1bd65f.jpg',
    organizer = 'ULIS',
    contact_info = '',
    short_description = 'Cuộc thi lan tỏa văn hóa đọc.',
    description = 'Tham gia với 2 đề bài: Review sách + Sáng kiến thúc đẩy văn hóa đọc hoặc sáng tác truyện ngắn.',
    rules = 'Nộp bài trước 12h00 ngày 15/05/2025.',
    rewards = 'Giấy chứng nhận, giải thưởng.',
    registration_url = 'Link nộp bài trên fanpage ULIS',
    start_date = '2025-04-28',
    end_date = '2025-05-30',
    review_level = 'TRUONG',
    location = 'ULIS',
    target_audience = 'Sinh viên ULIS',
    updated_at = NOW()
WHERE id = '30000000-0000-4000-8000-00000000001b';

INSERT INTO activity_criteria (id, activity_id, criteria_id, score, created_at, updated_at)
SELECT
    gen_random_uuid(),
    m.activity_id,
    c.id,
    100,
    NOW(),
    NOW()
FROM (VALUES
    ('30000000-0000-4000-8000-000000000001'::uuid, 'DAO_DUC'::varchar),
    ('30000000-0000-4000-8000-000000000002'::uuid, 'DAO_DUC'::varchar),
    ('30000000-0000-4000-8000-000000000003'::uuid, 'DAO_DUC'::varchar),
    ('30000000-0000-4000-8000-000000000004'::uuid, 'DAO_DUC'::varchar),
    ('30000000-0000-4000-8000-000000000005'::uuid, 'DAO_DUC'::varchar),
    ('30000000-0000-4000-8000-000000000006'::uuid, 'HOI_NHAP'::varchar),
    ('30000000-0000-4000-8000-000000000007'::uuid, 'DAO_DUC'::varchar),
    ('30000000-0000-4000-8000-000000000008'::uuid, 'HOI_NHAP'::varchar),
    ('30000000-0000-4000-8000-000000000009'::uuid, 'HOI_NHAP'::varchar),
    ('30000000-0000-4000-8000-00000000000a'::uuid, 'THE_LUC'::varchar),
    ('30000000-0000-4000-8000-00000000000b'::uuid, 'HOC_TAP'::varchar),
    ('30000000-0000-4000-8000-00000000000c'::uuid, 'TINH_NGUYEN'::varchar),
    ('30000000-0000-4000-8000-00000000000d'::uuid, 'TINH_NGUYEN'::varchar),
    ('30000000-0000-4000-8000-00000000000e'::uuid, 'HOI_NHAP'::varchar),
    ('30000000-0000-4000-8000-00000000000f'::uuid, 'HOI_NHAP'::varchar),
    ('30000000-0000-4000-8000-000000000010'::uuid, 'THE_LUC'::varchar),
    ('30000000-0000-4000-8000-000000000011'::uuid, 'THE_LUC'::varchar),
    ('30000000-0000-4000-8000-000000000012'::uuid, 'TINH_NGUYEN'::varchar),
    ('30000000-0000-4000-8000-000000000012'::uuid, 'HOI_NHAP'::varchar),
    ('30000000-0000-4000-8000-000000000013'::uuid, 'THE_LUC'::varchar),
    ('30000000-0000-4000-8000-000000000014'::uuid, 'THE_LUC'::varchar),
    ('30000000-0000-4000-8000-000000000015'::uuid, 'THE_LUC'::varchar),
    ('30000000-0000-4000-8000-000000000016'::uuid, 'TINH_NGUYEN'::varchar),
    ('30000000-0000-4000-8000-000000000017'::uuid, 'TINH_NGUYEN'::varchar),
    ('30000000-0000-4000-8000-000000000018'::uuid, 'TINH_NGUYEN'::varchar),
    ('30000000-0000-4000-8000-000000000019'::uuid, 'TINH_NGUYEN'::varchar),
    ('30000000-0000-4000-8000-00000000001a'::uuid, 'HOI_NHAP'::varchar),
    ('30000000-0000-4000-8000-00000000001b'::uuid, 'HOC_TAP'::varchar),
    ('30000000-0000-4000-8000-00000000001b'::uuid, 'TINH_NGUYEN'::varchar)
) AS m(activity_id, criteria_code)
JOIN criteria c ON c.code = m.criteria_code
ON CONFLICT (activity_id, criteria_id) DO UPDATE
SET score = EXCLUDED.score,
    updated_at = NOW();

COMMIT;
