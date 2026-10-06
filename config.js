// =====================================================================
// config.js - FILE DÙNG CHUNG DUY NHẤT CHO CẢ index.html VÀ admin.html
// =====================================================================
// QUAN TRỌNG: đây là NGUỒN DỮ LIỆU DUY NHẤT (single source of truth) cho:
//   - Thông tin kết nối Supabase
//   - Danh sách 7 Level
//   - Khung chương trình chi tiết từng Level (SYLLABUS_CONFIG)
//   - Hàm sinh danh sách bài học getLevelItemList()
// Cả index.html và admin.html đều nạp (<script src="config.js">) CHÍNH
// FILE NÀY, không có bản sao nào khác. Tuyệt đối không copy/paste
// SYLLABUS_CONFIG sang file khác - mọi chỉnh sửa khung chương trình chỉ
// sửa duy nhất ở đây, để tránh lặp lại sự cố "3 bản dữ liệu khác nhau"
// đã từng xảy ra trước đây.
// =====================================================================

/* ==================================================================
   BƯỚC DUY NHẤT BẠN CẦN SỬA: dán 2 giá trị dưới đây.
   Lấy tại: Supabase Dashboard > Project Settings > API
     - Project URL      -> SUPABASE_URL
     - anon public key  -> SUPABASE_ANON_KEY
   (anon key là key công khai, an toàn để đặt trong file JS;
    bảo mật thật nằm ở RLS Policy đã cấu hình trong schema.sql)
   ================================================================== */
const SUPABASE_URL = "https://fjznnrzbhymzdhrfinbz.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZqem5ucnpiaHltemRocmZpbmJ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg1MTIxMDAsImV4cCI6MjEwNDA4ODEwMH0.R_PPSk3sCQ4lteW6CugKxU0GdqwDRPjfyRMfFCJFVrM";

/* ================== KHÔNG CẦN SỬA TỪ ĐÂY TRỞ XUỐNG ================== */

// Danh sách 7 Level cố định theo bộ giáo trình.
const LEVELS = [
  { code: "A1_1", label: "A1.1", subtitle: "Beginners" },
  { code: "A1_2", label: "A1.2", subtitle: "Elementary" },
  { code: "A2", label: "A2", subtitle: "Pre-Intermediate" },
  { code: "B1", label: "B1", subtitle: "Intermediate" },
  { code: "B1_PLUS", label: "B1+", subtitle: "Upper Intermediate" },
  { code: "B2", label: "B2", subtitle: "Upper-Intermediate+" },
  { code: "C1C2", label: "C1/C2", subtitle: "Advanced" },
];

// Danh sách bong bóng đầu sách (Tầng 1). Thêm bộ sách mới: thêm Level vào
// LEVELS + SYLLABUS_CONFIG ở trên, rồi thêm 1 object vào mảng này.
const SERIES = [
  {
    id: "twgv",
    title: "The World of Grammar & Vocabulary",
    edition: "British Edition",
    desc: "The World of Grammar & Vocabulary is a carefully graded grammar series.",
    cover: "cover-twgv.png",
    levelCodes: ["A1_1", "A1_2", "A2", "B1", "B1_PLUS", "B2", "C1C2"],
  },
];

// =====================================================================
// SYLLABUS_CONFIG - KHUNG CHƯƠNG TRÌNH CHI TIẾT, LẤY TỪ MỤC LỤC SÁCH GỐC
// (đây là bản dữ liệu Admin đã xác nhận là chuẩn xác nhất, thay thế mọi
// bản dữ liệu khác từng tồn tại rải rác ở các file cũ).
// =====================================================================
const SYLLABUS_CONFIG = {
  A1_1: {
    hasHello: true,
    totalUnits: 24,
    revisions: [
      { afterUnit: 5, id: "rev_1_5", title: "Revision: Units 1-5" },
      { afterUnit: 9, id: "rev_6_9", title: "Revision: Units 6-9" },
      { afterUnit: 12, id: "rev_10_12", title: "Revision: Units 10-12" },
      { afterUnit: 14, id: "rev_13_14", title: "Revision: Units 13-14" },
      { afterUnit: 18, id: "rev_15_18", title: "Revision: Units 15-18" },
      { afterUnit: 21, id: "rev_19_21", title: "Revision: Units 19-21" },
      { afterUnit: 24, id: "rev_22_24", title: "Revision: Units 22-24" },
      { afterUnit: 24, id: "rev_1_24", title: "Revision: Units 1-24" },
    ],
    exams: [],
  },
  A1_2: {
    hasHello: true,
    totalUnits: 28,
    revisions: [
      { afterUnit: 4, id: "rev_1_4", title: "Revision: Units 1-4" },
      { afterUnit: 8, id: "rev_5_8", title: "Revision: Units 5-8" },
      { afterUnit: 12, id: "rev_9_12", title: "Revision: Units 9-12" },
      { afterUnit: 16, id: "rev_13_16", title: "Revision: Units 13-16" },
      { afterUnit: 20, id: "rev_17_20", title: "Revision: Units 17-20" },
      { afterUnit: 24, id: "rev_21_24", title: "Revision: Units 21-24" },
      { afterUnit: 26, id: "rev_25_26", title: "Revision: Units 25-26" },
      { afterUnit: 28, id: "rev_27_28", title: "Revision: Units 27-28" },
      { afterUnit: 28, id: "rev_1_28", title: "Revision: Units 1-28" },
    ],
    exams: [],
  },
  A2: {
    hasHello: true,
    totalUnits: 28,
    revisions: [
      { afterUnit: 6, id: "rev_1_6", title: "Revision: Units 1-6" },
      { afterUnit: 10, id: "rev_7_10", title: "Revision: Units 7-10" },
      { afterUnit: 14, id: "rev_11_14", title: "Revision: Units 11-14" },
      { afterUnit: 17, id: "rev_15_17", title: "Revision: Units 15-17" },
      { afterUnit: 21, id: "rev_18_21", title: "Revision: Units 18-21" },
      { afterUnit: 25, id: "rev_22_25", title: "Revision: Units 22-25" },
      { afterUnit: 28, id: "rev_26_28", title: "Revision: Units 26-28" },
      { afterUnit: 28, id: "rev_1_28", title: "Revision: Units 1-28" },
    ],
    exams: [],
  },
  B1: {
    hasHello: false,
    totalUnits: 26,
    revisions: [
      { afterUnit: 3, id: "rev_1_3", title: "Revision: Units 1-3" },
      { afterUnit: 5, id: "rev_4_5", title: "Revision: Units 4-5" },
      { afterUnit: 7, id: "rev_6_7", title: "Revision: Units 6-7" },
      { afterUnit: 9, id: "rev_8_9", title: "Revision: Units 8-9" },
      { afterUnit: 11, id: "rev_10_11", title: "Revision: Units 10-11" },
      { afterUnit: 13, id: "rev_12_13", title: "Revision: Units 12-13" },
      { afterUnit: 15, id: "rev_14_15", title: "Revision: Units 14-15" },
      { afterUnit: 17, id: "rev_16_17", title: "Revision: Units 16-17" },
      { afterUnit: 19, id: "rev_18_19", title: "Revision: Units 18-19" },
      { afterUnit: 21, id: "rev_20_21", title: "Revision: Units 20-21" },
      { afterUnit: 23, id: "rev_22_23", title: "Revision: Units 22-23" },
      { afterUnit: 26, id: "rev_24_26", title: "Revision: Units 24-26" },
      { afterUnit: 26, id: "rev_1_26", title: "Revision: Units 1-26" },
    ],
    exams: [
      { afterUnit: 7, id: "exam_1", title: "Exam Practice 1: Units 1-7" },
      { afterUnit: 13, id: "exam_2", title: "Exam Practice 2: Units 8-13" },
      { afterUnit: 19, id: "exam_3", title: "Exam Practice 3: Units 14-19" },
      { afterUnit: 26, id: "exam_4", title: "Exam Practice 4: Units 20-26" },
    ],
  },
  B1_PLUS: {
    hasHello: false,
    totalUnits: 22,
    revisions: [
      { afterUnit: 2, id: "rev_1_2", title: "Revision: Units 1-2" },
      { afterUnit: 4, id: "rev_3_4", title: "Revision: Units 3-4" },
      { afterUnit: 7, id: "rev_5_7", title: "Revision: Units 5-7" },
      { afterUnit: 9, id: "rev_8_9", title: "Revision: Units 8-9" },
      { afterUnit: 11, id: "rev_10_11", title: "Revision: Units 10-11" },
      { afterUnit: 14, id: "rev_12_14", title: "Revision: Units 12-14" },
      { afterUnit: 16, id: "rev_15_16", title: "Revision: Units 15-16" },
      { afterUnit: 18, id: "rev_17_18", title: "Revision: Units 17-18" },
      { afterUnit: 20, id: "rev_19_20", title: "Revision: Units 19-20" },
      { afterUnit: 22, id: "rev_21_22", title: "Revision: Units 21-22" },
      { afterUnit: 22, id: "rev_1_22", title: "Revision: Units 1-22" },
    ],
    exams: [
      { afterUnit: 4, id: "exam_1", title: "Exam Practice 1: Units 1-4" },
      { afterUnit: 9, id: "exam_2", title: "Exam Practice 2: Units 5-9" },
      { afterUnit: 14, id: "exam_3", title: "Exam Practice 3: Units 10-14" },
      { afterUnit: 18, id: "exam_4", title: "Exam Practice 4: Units 15-18" },
      { afterUnit: 22, id: "exam_5", title: "Exam Practice 5: Units 19-22" },
    ],
  },
  B2: {
    hasHello: false,
    totalUnits: 21,
    revisions: [
      { afterUnit: 2, id: "rev_1_2", title: "Revision: Units 1-2" },
      { afterUnit: 4, id: "rev_3_4", title: "Revision: Units 3-4" },
      { afterUnit: 6, id: "rev_5_6", title: "Revision: Units 5-6" },
      { afterUnit: 8, id: "rev_7_8", title: "Revision: Units 7-8" },
      { afterUnit: 10, id: "rev_9_10", title: "Revision: Units 9-10" },
      { afterUnit: 12, id: "rev_11_12", title: "Revision: Units 11-12" },
      { afterUnit: 15, id: "rev_13_15", title: "Revision: Units 13-15" },
      { afterUnit: 17, id: "rev_16_17", title: "Revision: Units 16-17" },
      { afterUnit: 19, id: "rev_18_19", title: "Revision: Units 18-19" },
      { afterUnit: 21, id: "rev_20_21", title: "Revision: Units 20-21" },
      { afterUnit: 21, id: "rev_1_21", title: "Revision: Units 1-21" },
    ],
    exams: [
      { afterUnit: 4, id: "exam_1", title: "Exam Practice 1: Units 1-4" },
      { afterUnit: 8, id: "exam_2", title: "Exam Practice 2: Units 5-8" },
      { afterUnit: 12, id: "exam_3", title: "Exam Practice 3: Units 9-12" },
      { afterUnit: 17, id: "exam_4", title: "Exam Practice 4: Units 13-17" },
      { afterUnit: 21, id: "exam_5", title: "Exam Practice 5: Units 18-21" },
    ],
  },
  C1C2: {
    hasHello: false,
    totalUnits: 21,
    revisions: [
      { afterUnit: 1, id: "rev_1", title: "Revision: Unit 1 Grammar" },
      { afterUnit: 2, id: "rev_2", title: "Revision: Unit 2 Grammar" },
      { afterUnit: 3, id: "rev_3", title: "Revision: Unit 3 Vocabulary" },
      { afterUnit: 4, id: "rev_4", title: "Revision: Unit 4 Grammar" },
      { afterUnit: 5, id: "rev_5", title: "Revision: Unit 5 Grammar" },
      { afterUnit: 6, id: "rev_6", title: "Revision: Unit 6 Vocabulary" },
      { afterUnit: 7, id: "rev_7", title: "Revision: Unit 7 Grammar" },
      { afterUnit: 8, id: "rev_8", title: "Revision: Unit 8 Grammar" },
      { afterUnit: 9, id: "rev_9", title: "Revision: Unit 9 Vocabulary" },
      { afterUnit: 10, id: "rev_10", title: "Revision: Unit 10 Grammar" },
      { afterUnit: 11, id: "rev_11", title: "Revision: Unit 11 Grammar" },
      { afterUnit: 12, id: "rev_12", title: "Revision: Unit 12 Vocabulary" },
      { afterUnit: 13, id: "rev_13", title: "Revision: Unit 13 Grammar" },
      { afterUnit: 14, id: "rev_14", title: "Revision: Unit 14 Grammar" },
      { afterUnit: 15, id: "rev_15", title: "Revision: Unit 15 Vocabulary" },
      { afterUnit: 16, id: "rev_16", title: "Revision: Unit 16 Grammar" },
      { afterUnit: 17, id: "rev_17", title: "Revision: Unit 17 Grammar" },
      { afterUnit: 18, id: "rev_18", title: "Revision: Unit 18 Vocabulary" },
      { afterUnit: 19, id: "rev_19", title: "Revision: Unit 19 Grammar" },
      { afterUnit: 20, id: "rev_20", title: "Revision: Unit 20 Grammar" },
      { afterUnit: 21, id: "rev_21", title: "Revision: Unit 21 Vocabulary" },
    ],
    exams: [
      { afterUnit: 3, id: "exam_1", title: "Exam Practice 1: Units 1-3" },
      { afterUnit: 6, id: "exam_2", title: "Exam Practice 2: Units 4-6" },
      { afterUnit: 9, id: "exam_3", title: "Exam Practice 3: Units 7-9" },
      { afterUnit: 12, id: "exam_4", title: "Exam Practice 4: Units 10-12" },
      { afterUnit: 15, id: "exam_5", title: "Exam Practice 5: Units 13-15" },
      { afterUnit: 18, id: "exam_6", title: "Exam Practice 6: Units 16-18" },
      { afterUnit: 21, id: "exam_7", title: "Exam Practice 7: Units 19-21" },
    ],
  },
};

/**
 * Sinh danh sách đầy đủ, ĐÚNG THỨ TỰ hiển thị các bài học của 1 Level:
 * [Module Hello?] -> Unit 1 -> (Revision/Exam nếu có ngay sau Unit 1) -> Unit 2 -> ...
 * Đây là HÀM DUY NHẤT tính thứ tự bài học - cả trang học viên (để hiển thị
 * và tính ngày mở khóa) lẫn trang Admin (để đồng bộ dropdown Module và tính
 * vị trí item_order khi lưu nội dung) đều gọi chung hàm này, đảm bảo
 * KHÔNG BAO GIỜ lệch nhau giữa 2 trang.
 *
 * Mỗi phần tử trả về: { id, title, type, order } trong đó "order" là vị trí
 * 1-based trong danh sách - dùng làm "item_order" khi lưu vào module_content
 * và làm mốc so sánh để tính Module nào đã mở khóa.
 */
function getLevelItemList(levelCode) {
  const config = SYLLABUS_CONFIG[levelCode];
  if (!config) return [];
  const items = [];

  if (config.hasHello) {
    items.push({ id: "0", title: "Module Hello", type: "hello" });
  }

  for (let u = 1; u <= config.totalUnits; u++) {
    items.push({ id: String(u), title: `Unit ${u}`, type: "unit" });
    (config.revisions || [])
      .filter((r) => r.afterUnit === u)
      .forEach((r) => items.push({ id: r.id, title: r.title, type: "revision" }));
    (config.exams || [])
      .filter((e) => e.afterUnit === u)
      .forEach((e) => items.push({ id: e.id, title: e.title, type: "exam" }));
  }

  // Gán "order" = vị trí 1-based sau khi đã xếp đúng thứ tự ở trên
  return items.map((item, idx) => ({ ...item, order: idx + 1 }));
}

/** Tìm 1 item cụ thể (theo id) trong danh sách bài học của 1 Level. Trả về null nếu không có. */
function findLevelItem(levelCode, itemId) {
  const items = getLevelItemList(levelCode);
  return items.find((it) => String(it.id) === String(itemId)) || null;
}

// =====================================================================
// KẾT NỐI SUPABASE (dùng chung, an toàn - báo lỗi rõ ràng thay vì im lặng)
// =====================================================================
let supabaseClient = null;
let mmBootError = null;

function mmShowBanner(message) {
  const bar = document.createElement("div");
  bar.style.cssText =
    "position:fixed;top:0;left:0;right:0;z-index:9999;background:#E60000;color:#fff;" +
    "padding:10px 16px;font-size:13px;line-height:1.5;text-align:center;" +
    "font-family:'Calibri','Inter',system-ui,sans-serif;box-shadow:0 2px 8px rgba(0,0,0,.2)";
  bar.textContent = message;
  document.body.appendChild(bar);
  document.body.style.paddingTop = "48px";
}

function mmRequireClient(errorEl) {
  if (supabaseClient) return true;
  const msg = mmBootError || "Chưa kết nối được tới Supabase.";
  if (errorEl) { errorEl.textContent = msg; } else { alert(msg); }
  return false;
}

function mmBoot() {
  if (!window.supabase || typeof window.supabase.createClient !== "function") {
    mmBootError = "Không tải được thư viện Supabase từ CDN. Vui lòng kiểm tra kết nối mạng, "
                + "hoặc mở trang qua http(s):// thay vì mở trực tiếp bằng file://";
    mmShowBanner(mmBootError);
    return false;
  }
  if (!SUPABASE_URL || SUPABASE_URL.includes("YOUR-PROJECT-REF")) {
    mmBootError = "CHƯA CẤU HÌNH: mở config.js, điền SUPABASE_URL và SUPABASE_ANON_KEY.";
    mmShowBanner(mmBootError);
    return false;
  }
  try {
    supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    return true;
  } catch (err) {
    mmBootError = "Lỗi khởi tạo kết nối Supabase: " + err.message;
    mmShowBanner(mmBootError);
    return false;
  }
}

// =====================================================================
// TIỆN ÍCH TÍNH THỜI GIAN MỞ KHÓA - dùng chung cho cả 2 trang
// =====================================================================

/** Số bài đã mở khóa tính tới hiện tại, dựa trên activated_at. 2 bài/tuần, không giới hạn cứng (so với tổng số bài thì chặn ở chỗ gọi). */
function computeUnlockedCount(activatedAtDate, totalItems) {
  const msPerWeek = 7 * 24 * 60 * 60 * 1000;
  const weeksPassed = Math.floor((Date.now() - activatedAtDate.getTime()) / msPerWeek);
  const count = (weeksPassed + 1) * 2;
  return Math.min(totalItems, count);
}

/** Ngày mở khóa của bài thứ "order" (1-based, đúng theo getLevelItemList). */
function computeUnlockDateForOrder(activatedAtDate, order) {
  const weekIndex = Math.ceil(order / 2);
  const offsetDays = (weekIndex - 1) * 7;
  const d = new Date(activatedAtDate.getTime());
  d.setDate(d.getDate() + offsetDays);
  return d;
}

function formatDateVN(date) {
  return date.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
}
