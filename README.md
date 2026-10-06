# Check Key - The World of Grammar and Vocabulary (BẢN REBUILD)

## ⚠️ ĐỌC TRƯỚC KHI DEPLOY

### 1. Cấu trúc file — ẢNH ĐẶT PHẲNG (flat), KHÔNG dùng thư mục `images/`
```
public/
├── config.js            <- NGUỒN DUY NHẤT: Supabase + LEVELS + SYLLABUS_CONFIG + getLevelItemList()
├── anti-copy.js          <- chống chuột phải / bôi đen / F12 (không đổi)
├── index.html            <- trang học viên (nạp config.js + anti-copy.js)
├── admin.html             <- trang quản trị (nạp config.js) - chú ý CHỮ THƯỜNG
├── logo-mm.png
├── logo-mm-stacked.png
└── cover-twgv.png

supabase/
└── functions/
    └── admin-reset-password/   <- Edge Function đổi mật khẩu học viên (xem mục 4 bên dưới)
        ├── index.ts
        └── README.md
```

**⚠️ Quan trọng — nguyên nhân vỡ ảnh logo trên Vercel trước đây:** code cũ gọi
`src="images/logo-mm.png"` (giả định có thư mục con `images/`), nhưng repo GitHub thật của bạn
để ảnh **ngay tại gốc**, không có thư mục `images/`. Bản này đã **chuyển toàn bộ ảnh ra gốc**
và sửa mọi `<img src="...">` / `<link rel="icon" href="...">` / `cover` trong `config.js` thành
đường dẫn phẳng, viết thường 100%, không có dấu `/` ở đầu — đúng với cấu trúc repo bạn đang có.

**Chỉ còn 2 file JS** (`config.js`, `anti-copy.js`). **Không còn** `app.js` / `admin.js` riêng -
toàn bộ logic giao diện đã nhúng thẳng vào `index.html` / `admin.html`, chỉ có dữ liệu dùng
chung (Supabase, danh sách Level, khung chương trình) mới tách ra `config.js` để **chỉ sửa 1
chỗ duy nhất**, không bao giờ bị lệch dữ liệu giữa 2 trang nữa.

### 2. Xóa các file cũ trên GitHub trước khi đẩy bản mới lên
Hãy **xóa hẳn** các file sau khỏi repo (đừng chỉ ghi đè) trước khi upload bộ file mới:
- `Admin.html` (chữ A hoa) → thay bằng `admin.html` (chữ thường). Vercel chạy trên Linux,
  phân biệt hoa/thường — nếu còn tồn tại cả 2 file, dễ gây nhầm lẫn không rõ bản nào đang chạy.
- `app.js`, `admin.js` (file rời cũ) — không còn được dùng, giữ lại chỉ gây rối thêm.
- `config.js` cũ — ghi đè bằng bản mới đính kèm.

### 3. Vì sao phải XÓA VÀ TẠO LẠI bảng `module_content`
Cấu trúc cũ giới hạn `module_number` là số nguyên 1-10, không chứa nổi các mã bài như
`"rev_1_5"`, `"exam_1"`, hay Unit tới 28. Bảng mới dùng `item_id` (text) + `item_order` (số
thứ tự thực tế, tự tính từ `config.js`). Bạn đã xác nhận dữ liệu hiện tại chỉ là dữ liệu test
nên file `sql/schema.sql` sẽ **xóa sạch bảng `module_content` cũ** và tạo lại — các bảng khác
(`keys`, `user_unlocked_levels`, tài khoản học viên...) **không bị ảnh hưởng**, chỉ nội dung
đáp án/link đã nhập trước đó sẽ mất, cần nhập lại qua trang Admin.

## CÁC BƯỚC TRIỂN KHAI

### Bước 1 - Chạy lại schema.sql
Vào Supabase Dashboard → SQL Editor → dán toàn bộ `sql/schema.sql` → Run.

File này cũng đã tạo sẵn hàm `check_is_admin()` với whitelist 2 email admin
(`ngannguyen@inbook.vn`, `nguyenchaukieungan10032006@gmail.com`). Muốn thêm/bớt admin, sửa
danh sách email trong hàm này rồi chạy lại riêng đoạn đó.

### Bước 2 - config.js đã điền sẵn SUPABASE_URL/KEY của bạn
Không cần sửa gì thêm trừ khi bạn đổi sang project Supabase khác.

### Bước 3 - Nhập lại nội dung đáp án
Vào `admin.html` → tab "Nội dung Module" → chọn Level → dropdung Module/Unit/Revision/Exam
**tự động hiện đúng danh sách** của Level đó → nhập nội dung/link → Lưu.

### Bước 4 - Deploy lên Vercel
Kéo thả toàn bộ thư mục `public/` (đổi tên thành thư mục gốc khi deploy, hoặc trỏ Vercel vào
thư mục này). Không cần build step gì vì đây là HTML/JS thuần. Thư mục `supabase/` (Edge
Function) **không** deploy qua Vercel — nó deploy riêng qua Supabase CLI, xem Bước 5.

### Bước 5 - Triển khai tính năng "Đặt lại mật khẩu" cho học viên (Edge Function)
Tính năng này **cần làm thêm một bước triển khai riêng** vì lý do bảo mật — xem giải thích đầy
đủ và các lệnh cần chạy trong `supabase/functions/admin-reset-password/README.md`. Tóm tắt:
Supabase Admin API để đổi mật khẩu người khác đòi hỏi `service_role key` — một key có toàn
quyền, **tuyệt đối không được đặt trong `admin.html`/bất kỳ file JS nào chạy trên trình duyệt**
(ai mở View Source cũng lấy được, bỏ qua mọi RLS). Vì vậy key này chỉ được lưu làm *secret*
trên một Supabase Edge Function riêng, chạy trên server. `admin.html` chỉ gửi JWT đăng nhập
hiện tại của Admin lên, Edge Function tự xác minh quyền admin trước khi đổi mật khẩu.

Cho tới khi bạn deploy Edge Function này, nút "Đặt lại mật khẩu mới" trong `admin.html` sẽ báo
rõ "Chưa triển khai Edge Function..." — không bị lỗi ngầm khó hiểu.

## TÍNH NĂNG MỚI TRONG BẢN NÀY
- **Dropdown Module ở Admin tự động đồng bộ theo Level** — chọn Level nào, danh sách bài học
  (Hello/Unit/Revision/Exam Practice) của đúng Level đó hiện ra ngay, lấy từ `config.js`.
- Khung chương trình đúng theo mục lục sách gốc cho cả 7 Level (số Unit thật, vị trí
  Revision/Exam thật - không còn là 10 Module cố định như bản demo đầu tiên).
- Màn hình danh sách bài học (trang học viên) tô màu nhẹ phân biệt Unit thường / Revision /
  Exam Practice để dễ nhìn.
- Modal xem đáp án: nếu Admin có nhập Link tài liệu, hiện thêm nút "Mở tài liệu / link bài học".
- **Ảnh (logo, favicon, ảnh bìa) đặt phẳng tại gốc**, không còn thư mục `images/` — khớp đúng
  cấu trúc repo GitHub thật của bạn, hết lỗi vỡ ảnh khi deploy Vercel.
- **Đăng ký không còn thông báo "kiểm tra email xác nhận"** — chỉ hiện "Đăng ký thành công!
  Vui lòng chuyển sang tab Đăng nhập để tiếp tục." rồi tự động chuyển sang tab Đăng nhập.
- **Modal xem đáp án hiển thị rõ ràng hơn**: giữ đúng xuống dòng, tự in đậm các tiêu đề quen
  thuộc (Grammar Practice, Revision, Exam Practice...) và các mục A./B./C./D./1./2., chữ to hơn
  (16-18px), giãn dòng 1.6, cách đoạn 12px. Admin vẫn có thể tự chèn thẻ HTML (`<b>`, `<ul>`,
  `<li>`...) trong nội dung nếu muốn, hệ thống sẽ giữ nguyên.
- **Admin có thể đặt lại mật khẩu cho học viên quên mật khẩu** qua tab "Đặt lại mật khẩu" mới
  trong `admin.html`, triển khai an toàn qua Edge Function (xem Bước 5).

## NHỮNG GÌ GIỮ NGUYÊN 100%
- Toàn bộ luồng Supabase Auth (đăng ký/đăng nhập/đăng xuất), RPC `register_device`,
  `redeem_key`, `admin_generate_keys`.
- Giới hạn 2 thiết bị / tài khoản.
- Giao diện 3 tầng (bong bóng đầu sách → danh sách Level → danh sách bài học).
- Hệ màu thương hiệu MM Publications, typography, hiệu ứng SEE MORE.
- `anti-copy.js` chống chuột phải / bôi đen / F12 / watermark động.
- Tab Admin: Tạo Key hàng loạt + xuất CSV, Danh sách Key (lọc, thu hồi, xóa), Nội dung Module
  (thêm/sửa/xóa).
