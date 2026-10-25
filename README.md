# 🔥 STREAK UNIVERSE - HABIT & WORLD TRACKER

> Ứng dụng theo dõi thói quen, chuỗi Streak và xây dựng các Thế Giới Gamification (Vườn Cây, Thảo Cầm Viên, Thủy Cung, Vũ Trụ, Hiệp Sĩ RPG, Cyberpunk, Kẹo Ngọt) độc lập cho từng mục tiêu.

---

## 🌟 TÍNH NĂNG NỔI BẬT

1. **Quản Lý Đa Mục Tiêu & Thói Quen (Multi-Goal)**:
   - Tự do nhập Tên mục tiêu, Nội dung cần duy trì & Động lực, Danh mục (Học tập, Sức khỏe, Công việc, Tinh thần...).
   - Định lượng thói quen mỗi ngày (ví dụ: `30 phút`, `10 trang sách`, `5km`).
   - Chu kỳ Streak (1 ngày / hàng ngày, ngày trong tuần, tự do).
   - Đặt Deadline hoàn thành và Mục tiêu chuỗi (7, 21, 30, 60, 100, 365 ngày).
   - Cài đặt giờ nhắc nhở mỗi ngày.

2. **Mỗi Mục Tiêu Sở Hữu Một Thế Giới Gamification Riêng Biệt (7+ Themes)**:
   - 🌿 **Khu Vườn Kỳ Diệu (Magic Garden)**: Mầm non 🌱 ➔ Cây đại thụ 🌳 (5d) ➔ Hoa nở 🌸 (10d) ➔ Quả ngọt 🍑 (15d) ➔ Trái tim tình yêu 💖 (100d).
   - 🦁 **Thảo Cầm Viên Safari (Safari Zoo)**: Thú sơ sinh 🐣 ➔ Thỏ & Cáo 🦊 (5d) ➔ Nai & Ngựa 🦌 (10d) ➔ Sư tử & Hổ 🦁 (15d) ➔ Rồng & Kỳ lân thần bí 🦄 (100d).
   - 🐬 **Thủy Cung Đại Dương (Ocean World)**: Tép biển 🦐 ➔ Cá nhiệt đới 🐠 (5d) ➔ Rùa biển & Bạch tuộc 🐢 (10d) ➔ Cá heo & Cá mập 🐬 (15d) ➔ Cá voi xanh 🐋 (100d).
   - 🌌 **Vũ Trụ Thiên Hà (Cosmic Galaxy)**: Bụi sao ☄️ ➔ Vệ tinh & Tàu thám hiểm 🛰️ (5d) ➔ Địa cầu 🌍 (10d) ➔ Sao Thổ & Mặt trời 🪐 (15d) ➔ Dải ngân hà 🌌 (100d).
   - ⚔️ **Đấu Trường Hiệp Sĩ (Fantasy RPG)**: Dao găm gỗ 🗡️ ➔ Khiên & Giáp sắt 🛡️ (5d) ➔ Cầu phép & Thú cưỡi 🔮 (10d) ➔ Song kiếm thánh ⚔️ (15d) ➔ Vương miện hoàng gia 👑 (100d).
   - 🤖 **Thành Phố Cyberpunk (Neon Cyber City)**: Vi mạch 🔌 ➔ Ổ đĩa & Pin hạt nhân 💾 (5d) ➔ Cyborg 🤖 (10d) ➔ Tòa chọc trời neon 🏙️ (15d) ➔ Trí tuệ nhân tạo AGI ⚡ (100d).
   - 🍭 **Vương Quốc Kẹo Ngọt (Candy Land)**: Kẹo mút 🍭 ➔ Socola 🍫 (5d) ➔ Donut & Bánh 🍩 (10d) ➔ Bánh kem sinh nhật 🎂 (15d) ➔ Lâu đài bánh kẹo 🏰 (100d).
   - ⭐ **Tùy Chọn Cá Nhân**: Tự gõ bất kỳ Emoji yêu thích nào để làm biểu tượng đại diện.

3. **Thuật Toán Streak Chuẩn Xác 100% (Core Engine)**:
   - **Tính Bất Biến Trong Ngày (Idempotency)**: Check-in nhiều lần trong ngày chỉ tính 1 ngày streak.
   - **Cơ Chế Tha Thứ 1 Ngày (1-Day Grace Period)**: Bỏ lỡ 1 ngày do bận việc đột xuất vẫn được bảo toàn và nối tiếp chuỗi!
   - **Tự Phục Hồi Streak (Self-Healing Engine)**: Tự động quét mảng audit log `streak_dates` để tính lại chuỗi chuẩn xác nếu có sai lệch.
   - **Kiểm Tra Hết Hạn Thụ Động (Passive Expiration)**: Tự động phát hiện khi bỏ lỡ quá 2 ngày để cập nhật hiển thị về 0.

4. **Đồng Bộ Firebase Realtime Database (Offline-First & Union Merge)**:
   - Đã cấu hình sẵn với dự án Firebase của bạn: `streakapp-6eab3`.
   - Lưu trữ dữ liệu ưu tiên trên máy (LocalStorage), hoạt động hoàn hảo ngay cả khi **mất mạng hoặc ở chế độ máy bay**.
   - Khi có mạng: Tự động đồng bộ bằng thuật toán **Union Merge** (lấy hợp tất cả các ngày đã học giữa điện thoại và máy tính, không bao giờ bị ghi đè mất ngày cũ).

5. **Tương Thích Mobile / PWA (Progressive Web App)**:
   - Giao diện chuẩn app di động (iOS / Android).
   - Hỗ trợ **"Thêm vào Màn hình chính" (Add to Home Screen)** để mở như app native.
   - Âm thanh chúc mừng được tổng hợp bằng Web Audio API (không cần tải file mp3, nghe được khi offline).
   - Hiệu ứng pháo hoa rực rỡ (Confetti) khi hoàn thành mục tiêu.

---

## 📱 HƯỚNG DẪN CÀI ĐẶT TRÊN ĐIỆN THOẠI (DÙNG QUA GITHUB PAGES)

### Bước 1: Tạo Repository trên GitHub và Đẩy Mã Nguồn Lên
1. Đăng nhập vào GitHub: `https://github.com/new`
2. Tạo Repository mới đặt tên là: `streak-universe` (hoặc `streakapp`). Chọn chế độ **Public**.
3. Chạy các lệnh Git sau trên máy tính của bạn:
   ```bash
   git init
   git add .
   git commit -m "feat: complete Streak Universe application with multi-theme garden gamification and Firebase sync"
   git branch -M main
   git remote add origin https://github.com/phuongthuy1622004-star/streak-universe.git
   git push -u origin main
   ```

### Bước 2: Kích Hoạt GitHub Pages để có Link Chạy Trực Tiếp
1. Vào repository vừa tạo trên GitHub: `https://github.com/phuongthuy1622004-star/streak-universe`
2. Nhấn vào tab **Settings** ➔ chọn mục **Pages** ở thanh menu bên trái.
3. Ở mục **Build and deployment** ➔ **Source**: Chọn `Deploy from a branch`.
4. Ở mục **Branch**: Chọn nhánh `main` và thư mục `/ (root)` ➔ Nhấn **Save**.
5. Đợi 1 phút, GitHub sẽ cung cấp link trang web của bạn:
   `https://phuongthuy1622004-star.github.io/streak-universe/`

### Bước 3: Mở trên Điện Thoại & Cài Đặt ra Màn Hình Chính
- **Trên iPhone (Safari)**:
  1. Mở link GitHub Pages trên bằng trình duyệt Safari.
  2. Bấm vào nút **Chia sẻ (Share)** (biểu tượng hình vuông có mũi tên hướng lên).
  3. Cuộn xuống và chọn **"Thêm vào Màn hình chính" (Add to Home Screen)**.
- **Trên Android (Chrome)**:
  1. Mở link trên bằng Chrome.
  2. Nhấn vào nút menu 3 chấm ở góc trên bên phải.
  3. Chọn **"Cài đặt ứng dụng"** hoặc **"Thêm vào màn hình chính" (Install app / Add to Home screen)**.

---

## ☁️ CẤU HÌNH FIREBASE REALTIME DATABASE (`streakapp-6eab3`)

Để dữ liệu có thể đọc/ghi từ điện thoại lên Firebase:
1. Truy cập vào Firebase Console của bạn:
   [https://console.firebase.google.com/u/0/project/streakapp-6eab3/database](https://console.firebase.google.com/u/0/project/streakapp-6eab3/database)
2. Nếu chưa tạo Realtime Database: Nhấn **"Create Database"** (Chọn khu vực Singapore / `asia-southeast1` hoặc United States).
3. Vào tab **Rules (Quy tắc)** và chỉnh sửa thành quyền đọc/ghi cho người dùng:
   ```json
   {
     "rules": {
       ".read": true,
       ".write": true
     }
   }
   ```
4. Nhấn **Publish**. Giờ đây mọi dữ liệu học của bạn trên điện thoại và máy tính sẽ được tự động đồng bộ tức thì!
