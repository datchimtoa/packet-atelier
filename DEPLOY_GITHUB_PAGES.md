# Xuất bản Packet Atelier bằng GitHub Pages

Website này là ứng dụng React tĩnh. Toàn bộ chuyển đổi JSON/curl chạy trong trình duyệt, không cần server, cơ sở dữ liệu hoặc biến môi trường khi triển khai lên GitHub Pages.

## Quy trình đã được tự động hóa

Workflow `.github/workflows/deploy-pages.yml` sẽ chạy sau mỗi lần đẩy thay đổi vào nhánh `main`. Workflow cài đúng phiên bản phụ thuộc theo `pnpm-lock.yaml`, tạo thư mục `dist/public`, rồi gửi thư mục đó tới GitHub Pages.

## Cách bật xuất bản cho kho lưu trữ

Sau khi mã nguồn được đẩy lên GitHub, mở **Settings → Pages** của kho lưu trữ, chọn **Source: GitHub Actions**. Lần chạy workflow đầu tiên sẽ triển khai website. Liên kết công khai thường có dạng `https://<tài-khoản>.github.io/<tên-kho>/`.

> GitHub Pages công khai toàn bộ website đã triển khai. Không đưa file có cookie, session token, dữ liệu gốc hoặc dữ liệu xuất từ người dùng vào Git. Website hiện không lưu các dữ liệu này trong source và chỉ xử lý chúng trong bộ nhớ của trình duyệt.

## Kiểm tra cục bộ

Chạy `pnpm build:static` để tạo bản build tĩnh tương đương với GitHub Pages. Có thể mở `dist/public/index.html` bằng một static web server bất kỳ để xem bản build.
