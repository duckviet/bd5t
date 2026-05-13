# TÀI LIỆU ĐẶC TẢ YÊU CẦU PHẦN MỀM (SRS)

## WEBSITE “BẢN ĐỒ 5 TỐT”

### 1. Giới thiệu

#### 1.1. Mục đích

Tài liệu này mô tả các yêu cầu chức năng và phi chức năng của hệ thống website “Bản đồ 5 Tốt”. Mục tiêu là làm cơ sở thống nhất giữa nhóm phát triển, người thiết kế và bên liên quan trong quá trình phân tích, thiết kế, triển khai và kiểm thử hệ thống.

#### 1.2. Phạm vi hệ thống

“Bản đồ 5 Tốt” là nền tảng web hỗ trợ sinh viên Trường Đại học Ngoại ngữ – ĐHQGHN:

- tra cứu các tiêu chí xét danh hiệu “Sinh viên 5 Tốt”
- tìm kiếm và khám phá các hoạt động phù hợp với từng tiêu chí
- theo dõi tiến độ hoàn thành cá nhân
- lưu trữ và quản lý minh chứng
- nhận thông báo và gợi ý hoạt động phù hợp

Hệ thống không thực hiện:

- tổ chức hoạt động trực tiếp trên nền tảng
- tiếp nhận đăng ký tham gia hoạt động nội bộ ngay trên website
- cấp chứng chỉ hoặc xác nhận thành tích tự động
- xét duyệt danh hiệu Sinh viên 5 Tốt thay cho quy trình chính thức của Nhà trường / Đoàn Hội

#### 1.3. Đối tượng sử dụng

- Sinh viên
- Quản trị viên / cán bộ quản lý hệ thống

#### 1.4. Thuật ngữ và viết tắt

- SV5T: Sinh viên 5 Tốt
- Minh chứng: các tệp tài liệu, chứng chỉ, ảnh, PDF chứng minh việc tham gia hoạt động hoặc đạt thành tích
- Criteria: tiêu chí xét danh hiệu
- Activity: hoạt động
- Leaderboard: bảng xếp hạng

### 2. Mô tả tổng quan hệ thống

#### 2.1. Bối cảnh sử dụng

Hệ thống được xây dựng nhằm số hóa việc theo dõi hành trình đạt danh hiệu “Sinh viên 5 Tốt”, giúp sinh viên chủ động hơn trong việc tích lũy thành tích và chuẩn bị hồ sơ xét chọn.

#### 2.2. Các tác nhân (Actors)

1. Sinh viên

- đăng ký, đăng nhập
- xem tiêu chí
- xem hoạt động
- nộp và quản lý minh chứng
- theo dõi tiến độ
- nhận gợi ý và thông báo

2. Quản trị viên

- quản lý dữ liệu hoạt động
- quản lý tài liệu tiêu chí
- quản lý thông báo
- duyệt hoặc từ chối minh chứng
- xem thống kê hệ thống

### 3. Cấu trúc giao diện chung

#### 3.1. Thanh điều hướng

Bao gồm:

- Logo
- Trang chủ
- Tiêu chí
- Hoạt động
- Thông báo
- Hồ sơ

#### 3.2. Chân trang

Cung cấp thông tin liên hệ:

- Email: sinhvien5tot.ulis@gmail.com
- Fanpage Facebook
- Link nhóm cộng đồng

### 4. Yêu cầu chức năng

#### 4.1. Quản lý tài khoản

FR1. Hệ thống cho phép sinh viên đăng ký tài khoản bằng các thông tin:

- Họ và tên
- Email
- Lớp
- Mã sinh viên
- Mật khẩu
- Xác nhận mật khẩu
- Đơn vị

FR2. Trường “Đơn vị” phải là danh sách chọn gồm các đơn vị thuộc trường.

FR3. Hệ thống không cho phép trùng mã sinh viên hoặc email đã đăng ký.

FR4. Hệ thống cho phép người dùng đăng nhập bằng email hoặc mã sinh viên và mật khẩu.

FR5. Hệ thống cho phép người dùng đăng xuất.

FR6. Hệ thống cho phép người dùng chỉnh sửa thông tin cá nhân trong trang Hồ sơ.

FR7. Hệ thống cho phép quản trị viên quản lý tài khoản người dùng.

#### 4.2. Trang chủ

FR8. Hệ thống hiển thị phần giới thiệu ngắn về nền tảng.

FR9. Hệ thống hiển thị nút “Đăng ký ngay” điều hướng đến trang đăng ký.

FR10. Hệ thống hiển thị bảng thống kê gồm:

- Tổng số hoạt động
- Số lượng sinh viên tham gia
- Số lượng sinh viên hoàn thành đủ 5 tiêu chí

FR11. Hệ thống hiển thị bảng xếp hạng sinh viên theo số lượng hoạt động đã tham gia.

FR12. Bảng xếp hạng phải hiển thị:

- Thứ hạng
- Họ và tên
- Đơn vị
- Số hoạt động tham gia

#### 4.3. Tiêu chí

FR13. Hệ thống hiển thị thư viện tài liệu PDF hướng dẫn và quy định xét chọn danh hiệu SV5T.

FR14. Tài liệu được phân loại theo các cấp:

- Cấp Trường Đại học Ngoại ngữ
- Cấp ĐHQGHN
- Cấp Thành phố / Trung ương

FR15. Người dùng có thể xem trực tuyến hoặc tải tài liệu PDF.

FR16. Quản trị viên có thể thêm, cập nhật hoặc xóa tài liệu tiêu chí.

#### 4.4. Hoạt động

FR17. Hệ thống hiển thị danh sách hoạt động theo dạng thẻ, gồm ảnh đại diện và tên hoạt động.

FR18. Hệ thống cho phép tìm kiếm hoạt động theo tên.

FR19. Hệ thống cho phép lọc hoạt động theo 5 nhóm tiêu chí:

- Đạo đức tốt
- Học tập tốt
- Thể lực tốt
- Tình nguyện tốt
- Hội nhập tốt

FR20. Mỗi hoạt động phải có trang chi tiết bao gồm:

- Tag phân loại
- Tên hoạt động
- Mô tả
- Thể lệ
- Cơ cấu giải thưởng
- Thời gian
- Link đăng ký
- Đơn vị tổ chức
- Thông tin liên hệ

FR21. Trang chi tiết hoạt động phải có nút “Tham gia ngay”.

FR22. Khi nhấn “Tham gia ngay”, hệ thống chuyển hướng người dùng đến link chính thức của hoạt động.

FR23. Trang chi tiết hoạt động phải có nút “Nộp minh chứng”.

FR24. Quản trị viên có thể thêm, sửa, xóa hoạt động.

#### 4.5. Nộp và quản lý minh chứng

FR25. Hệ thống cho phép sinh viên nộp minh chứng gắn với một hoạt động cụ thể hoặc một tiêu chí cụ thể.

FR26. Minh chứng tải lên có thể là các định dạng:

- PDF
- JPG
- PNG

FR27. Khi nộp minh chứng, sinh viên phải nhập hoặc chọn:

- Tên hoạt động
- Tiêu chí liên quan
- Cấp xét duyệt liên quan nếu có
- Mô tả ngắn
- Tệp minh chứng

FR28. Hệ thống lưu trạng thái minh chứng gồm:

- Chờ duyệt
- Đã duyệt
- Bị từ chối

FR29. Nếu minh chứng bị từ chối, hệ thống phải hiển thị lý do từ chối.

FR30. Sinh viên có thể xem trước, tải xuống hoặc xóa minh chứng của mình khi chưa được duyệt.

FR31. Quản trị viên có thể duyệt hoặc từ chối minh chứng do sinh viên nộp.

#### 4.6. Thông báo

FR32. Hệ thống hiển thị thông báo khi có hoạt động mới được thêm vào nền tảng.

FR33. Hệ thống hiển thị thông báo đếm ngược đến hạn đăng ký hoạt động hoặc hạn nộp hồ sơ xét danh hiệu.

FR34. Hệ thống gửi hoặc hiển thị thông báo gợi ý hoạt động phù hợp dựa trên các tiêu chí mà sinh viên còn thiếu.

FR35. Quản trị viên có thể tạo hoặc cập nhật các thông báo chung.

#### 4.7. Hồ sơ cá nhân

FR36. Trang Hồ sơ hiển thị:

- Ảnh đại diện
- Họ và tên
- Mã sinh viên
- Lớp
- Khoa / Đơn vị

FR37. Trang Hồ sơ cho phép người dùng chỉnh sửa thông tin cá nhân.

FR38. Trang Hồ sơ hiển thị lịch sử hoạt động mà sinh viên đã tham gia hoặc đã nộp minh chứng.

FR39. Trang Hồ sơ hiển thị bảng tiến độ hoàn thành dưới dạng ma trận:

- Trục dọc: 5 tiêu chí
- Trục ngang: Cấp Trường, Cấp ĐHQGHN, Cấp Thành phố, Cấp Trung ương

FR40. Hệ thống sử dụng dấu tick hoặc trạng thái tương đương để đánh dấu các mục đã hoàn thành.

FR41. Trang Hồ sơ phải có khu vực “Kho lưu trữ minh chứng”.

FR42. Người dùng có thể:

- tải lên minh chứng
- xem trước minh chứng
- tải xuống minh chứng
- xóa minh chứng theo quyền cho phép

#### 4.8. Theo dõi tiến độ và gợi ý

FR43. Hệ thống phải tính toán tiến độ hoàn thành dựa trên minh chứng đã được duyệt hoặc dữ liệu đã xác nhận.

FR44. Hệ thống phải xác định tiêu chí nào sinh viên đã hoàn thành, đang thiếu hoặc chưa bắt đầu.

FR45. Hệ thống phải ưu tiên gợi ý hoạt động thuộc các tiêu chí còn thiếu minh chứng hoặc chưa hoàn thành.

FR46. Hệ thống có thể hiển thị tỷ lệ hoàn thành tổng quát hoặc mức độ hoàn thiện theo từng tiêu chí.

### 5. Quy tắc nghiệp vụ

BR1. Mỗi mã sinh viên chỉ được gắn với một tài khoản duy nhất.

BR2. Một hoạt động phải thuộc ít nhất một trong năm nhóm tiêu chí.

BR3. Một minh chứng chỉ được tính hợp lệ cho tiến độ khi đã được duyệt.

BR4. Một minh chứng bị từ chối không được tính vào tiến độ hoàn thành.

BR5. Nút “Tham gia ngay” chỉ điều hướng sang nền tảng hoặc đường link chính thức của đơn vị tổ chức.

BR6. Dữ liệu leaderboard được tính dựa trên số lượng hoạt động đã được xác nhận hoặc minh chứng hợp lệ.

BR7. Gợi ý hoạt động ưu tiên theo các tiêu chí còn thiếu trước, sau đó ưu tiên theo thời gian gần nhất hoặc hạn đăng ký sớm nhất.

### 6. Yêu cầu phi chức năng

#### 6.1. Khả năng sử dụng

NFR1. Giao diện hệ thống phải thân thiện, trực quan và phù hợp với đối tượng sinh viên.

NFR2. Hệ thống phải hỗ trợ responsive trên điện thoại, máy tính bảng và máy tính để bàn.

NFR3. Ngôn ngữ hiển thị chính là tiếng Việt.

#### 6.2. Hiệu năng

NFR4. Các trang chính phải tải trong thời gian chấp nhận được, mục tiêu dưới 3 giây trong điều kiện mạng bình thường.

NFR5. Hệ thống phải hỗ trợ số lượng người dùng đồng thời phù hợp với quy mô triển khai trong nhà trường.

#### 6.3. Bảo mật

NFR6. Chỉ người dùng đã xác thực mới được truy cập trang hồ sơ cá nhân và dữ liệu minh chứng của họ.

NFR7. Hệ thống phải phân quyền rõ giữa sinh viên và quản trị viên.

NFR8. Mật khẩu phải được lưu trữ dưới dạng băm an toàn, không lưu ở dạng văn bản thuần.

NFR9. Hệ thống phải kiểm tra định dạng và dung lượng tệp tải lên để tránh tệp không hợp lệ hoặc độc hại.

#### 6.4. Tính ổn định và dữ liệu

NFR10. Hệ thống phải lưu trữ dữ liệu ổn định, hạn chế mất mát dữ liệu khi có lỗi.

NFR11. Hệ thống nên có cơ chế sao lưu dữ liệu định kỳ.

NFR12. Dữ liệu minh chứng và hồ sơ người dùng phải được lưu trữ an toàn.

#### 6.5. Tương thích

NFR13. Hệ thống phải hoạt động ổn định trên các trình duyệt phổ biến như Chrome, Edge, Firefox, Safari.

### 7. Giả định và phụ thuộc

A1. Dữ liệu hoạt động ban đầu sẽ do quản trị viên nhập lên hệ thống.

A2. Link đăng ký hoạt động và nội dung chi tiết hoạt động được lấy từ nguồn chính thức của đơn vị tổ chức.

A3. Tài liệu tiêu chí PDF do nhà trường hoặc Đoàn – Hội cung cấp.

A4. Việc xét duyệt minh chứng phụ thuộc vào cán bộ quản lý hoặc quản trị viên.

### 8. Tiêu chí nghiệm thu cơ bản

AC1. Sinh viên có thể đăng ký và đăng nhập thành công với thông tin hợp lệ.

AC2. Người dùng có thể tìm kiếm và lọc hoạt động theo tiêu chí.

AC3. Người dùng có thể mở trang chi tiết hoạt động và được chuyển hướng đúng khi nhấn “Tham gia ngay”.

AC4. Người dùng có thể tải lên minh chứng ở định dạng cho phép.

AC5. Quản trị viên có thể duyệt hoặc từ chối minh chứng.

AC6. Hệ thống cập nhật đúng trạng thái tiến độ sau khi minh chứng được duyệt.

AC7. Trang Hồ sơ hiển thị đúng lịch sử hoạt động, ma trận tiến độ và kho minh chứng.

III. Một số đề xuất bổ sung rất nên thêm

1. Bổ sung module Admin
   Hiện tài liệu của bạn thiên về phía người dùng. Nếu dev thật thì nên mô tả luôn admin có gì:

- quản lý hoạt động
- quản lý tài liệu PDF
- quản lý leaderboard
- duyệt minh chứng
- quản lý thông báo
- quản lý user

2. Làm rõ nút “Nộp minh chứng”
   Nên nói rõ:

- upload trực tiếp trên web
- chỉ sinh viên đã đăng nhập mới được nộp
- có trạng thái duyệt
- có feedback từ admin

3. Làm rõ leaderboard
   Nên chốt một kiểu tính:

- tính theo số hoạt động có minh chứng hợp lệ
  hoặc
- tính theo tổng số hoạt động người dùng khai báo

Mình khuyên chọn:

- “số hoạt động có minh chứng đã duyệt”
  => công bằng hơn

4. Làm rõ “bảng tiến độ”
   Hiện “tick” là ý hay, nhưng nên ghi:

- tick chỉ xuất hiện khi đủ điều kiện ở cấp tương ứng
- điều kiện do admin/cấu hình quy định
- có thể hiển thị cả trạng thái “đang hoàn thành” ngoài tick
