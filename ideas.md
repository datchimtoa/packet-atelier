# Định hướng thiết kế — Packet Atelier

## Ba hướng thẩm mỹ

| Theme Name | Very Brief Intro | Probability |
|---|---|---:|
| Bàn điều phối Signal | Giao diện điều phối lấy cảm hứng từ màn hình vận hành, với nhịp dữ liệu nhanh và sắc nét. Cảm giác chủ động, rõ trạng thái và giàu năng lượng. | 0.07 |
| Thư viện bản ghi | Một không gian như sổ lưu trữ kỹ thuật: giấy ngà, mực xanh đen và các ký hiệu hiệu chỉnh thủ công. Mục tiêu là biến thao tác chuyển đổi thành một quá trình dễ kiểm chứng. | 0.03 |
| Xưởng dữ liệu | Một công cụ có chất liệu của phiếu kiểm nghiệm hiện đại, kết hợp tính kỷ luật của Swiss Style với những ghi chú trực quan mềm mại. Giao diện bình tĩnh, đáng tin và không tạo cảm giác khô cứng. | 0.09 |

## Hướng đã chọn — Xưởng dữ liệu

### Design Movement

Hướng thiết kế là **Swiss Style đương đại pha ngôn ngữ phiếu kiểm nghiệm**. Các vùng thao tác tuân thủ một hệ trục nghiêm ngặt, nhưng bề mặt có những dấu hiệu của xưởng làm việc thực tế như thước đo, nhãn phiên bản và con dấu xác minh cục bộ.

### Core Principles

Giao diện ưu tiên bốn nguyên tắc: đọc nhanh theo luồng trái-sang-phải; trạng thái được thể hiện bằng cấu trúc, không chỉ bằng màu; dữ liệu nhạy cảm luôn có lớp che hiển thị; và mỗi thao tác phải để lại phản hồi tức thì, có thể đảo ngược hoặc làm lại. Cổng vào dữ liệu là vùng chính, đầu ra là khu vực được “đóng dấu” sau khi kiểm tra, còn các trợ giúp ở dạng ghi chú sát ngữ cảnh.

### Color Philosophy

Nền giấy ngà ấm làm dịu mật độ ký tự và giúp một phiên làm việc dài ít chói mắt hơn. Mực xanh-than là màu của tính chính xác và độ tin cậy; đỏ son được dành riêng cho các điểm quyết định, cảnh báo và dấu hoàn tất để luôn có trọng lượng thị giác. Vàng khoáng nhạt chỉ dùng cho dữ liệu mẫu và trạng thái đang chú ý, không dùng làm nền trang trí.

### Layout Paradigm

Trang được tổ chức như một **bàn kiểm định ngang**, thay vì một biểu mẫu căn giữa. Một ray dọc hẹp ở trái giữ wordmark, trạng thái “xử lý cục bộ” và các điều khiển ngữ cảnh. Phần làm việc chính tách thành cột nguồn có thể mở rộng và cột bản ghi chuẩn hóa; ở màn hình nhỏ, hai cột xếp theo đúng thứ tự thao tác và ray dọc biến thành thanh tóm tắt.

### Signature Elements

Ba dấu hiệu xuất hiện xuyên suốt là: **con dấu LOCAL / BROWSER ONLY** hình vuông xoay nhẹ; **thước gạch dữ liệu** ở mép các vùng văn bản; và **mấu khuyết đỏ son** tại góc các vùng có hành động chính. Các họa tiết dot-grid rất nhẹ tạo cảm giác bề mặt kỹ thuật mà không cạnh tranh với nội dung.

### Interaction Philosophy

Tương tác phải giống thao tác trên bàn kiểm định: rõ điểm chạm, có xác nhận và không làm người dùng chờ đợi vô cớ. Khi chọn dạng đầu vào, chip tương ứng trở thành nhãn dán đang hoạt động. Khi chuyển đổi thành công, phần đầu ra bật nhịp ngắn và chỉ báo kiểm tra chuyển từ viền sang khối màu; dữ liệu chỉ được sao chép hoặc tải xuống theo hành động có chủ đích.

### Animation

Chuyển động dùng transform và opacity, với nhịp vào 180–240ms theo `cubic-bezier(0.23, 1, 0.32, 1)`. Các panel xuất hiện lệch nhau 50ms; kết quả thành công dùng dịch chuyển dọc 6px và không dùng hiệu ứng phát sáng. Trạng thái khi nhấn có tỉ lệ `0.97`; mọi chuyển động trang trí bị tắt khi người dùng bật giảm chuyển động.

### Typography System

**Archivo** là sans-serif giao diện, dùng cho nhãn điều khiển và tiêu đề có cấu trúc. **IBM Plex Mono** là mặt chữ dữ liệu và code, giúp phân biệt dữ liệu với hướng dẫn. Tiêu đề cấp một dùng Archivo SemiBold 32–44px, nhãn in hoa dùng IBM Plex Mono 11–12px có tracking rộng, và nội dung hướng dẫn dùng Archivo 14–16px với line-height thoáng.

### Brand Essence

**Packet Atelier là bàn kiểm định JSON/curl trong trình duyệt dành cho người cần chuyển đổi dữ liệu nhanh, nhìn thấy rõ cấu trúc và không phải gửi nội dung ra máy chủ.** Tính cách thương hiệu: điềm tĩnh, chính xác, minh bạch.

### Brand Voice

Giọng điệu ngắn, trực tiếp, có tính kỹ thuật nhưng không phô trương. Tiêu đề mô tả trạng thái hoặc lợi ích cụ thể; CTA là một động từ thao tác rõ ràng. Ví dụ: “Dán gói dữ liệu, xem cấu trúc ngay.” và “Chuẩn hóa bản ghi trong phiên duyệt này.” Các câu chung chung như “Chào mừng bạn” hoặc “Bắt đầu ngay hôm nay” không được dùng.

### Wordmark & Logo

Wordmark **Packet Atelier** có chữ “A” được rút thành một mấu khuyết như dấu ngoặc JSON. Biểu tượng là một khung vuông mở cạnh phải, bao quanh hai dấu ngoặc nhọn đối xứng — gợi ý gói dữ liệu đang được kiểm định. Dùng biểu tượng độc lập trong ray điều hướng và favicon, wordmark chỉ dùng ở tiêu đề ứng dụng.

### Signature Brand Color

**Signal Vermilion — #E5482D** là màu riêng của Packet Atelier. Nó chỉ đánh dấu hành động chính, xác nhận chuyển đổi và các điểm cần chú ý, để duy trì ý nghĩa mỗi khi xuất hiện.

## Style Decisions

Toàn bộ xử lý diễn ra phía trình duyệt; giao diện phải biểu thị điều này rõ ràng ở trạng thái đầu trang và phần hướng dẫn. Không hiển thị hoặc tạo dữ liệu xác thực thật; dữ liệu demo dùng chuỗi mô phỏng và mọi khu vực có thể che giá trị dài bằng điều khiển hiển thị/ẩn.

Wordmark trong ray trái dùng cặp ngoặc JSON đỏ son bao quanh chữ A có mấu khuyết, để biểu tượng và chữ thương hiệu cùng chia sẻ một đặc điểm nhận diện. Luồng dữ liệu được phân vai rõ ràng qua nhãn **RAW CAPTURE** ở nguồn và **STRUCTURE CHECK / CHK** ở đầu ra; phần nguồn giữ chất liệu ghi chép, còn phần kết quả có biên độ kiểm định và dấu xác nhận rõ hơn.
