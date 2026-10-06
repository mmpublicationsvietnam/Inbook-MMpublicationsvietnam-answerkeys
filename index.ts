// =====================================================================
// Edge Function: admin-reset-password
// =====================================================================
// MỤC ĐÍCH:
//   Cho phép Admin (đã đăng nhập, đã được xác nhận quyền qua check_is_admin())
//   đặt lại mật khẩu mới cho một học viên khi họ quên mật khẩu, mà KHÔNG cần
//   đặt service_role key vào bất kỳ file JS nào chạy trên trình duyệt.
//
// VÌ SAO PHẢI TÁCH RA EDGE FUNCTION RIÊNG:
//   supabase.auth.admin.updateUserById(...) là một API "Admin" của Supabase,
//   chỉ hoạt động với service_role key (key có toàn quyền, bỏ qua mọi RLS).
//   Nếu nhúng trực tiếp key này vào admin.html, bất kỳ ai mở "View Page Source"
//   trên trang admin cũng lấy được key và có thể đọc/sửa/xóa TOÀN BỘ dữ liệu
//   trong Supabase (bỏ qua mọi RLS Policy) - đây là lỗ hổng bảo mật rất nghiêm
//   trọng. Edge Function chạy trên server của Supabase, service_role key chỉ
//   được lưu dưới dạng "secret" (biến môi trường) tại đây, không bao giờ gửi
//   về phía trình duyệt.
//
// LUỒNG HOẠT ĐỘNG:
//   1. admin.html gửi request kèm JWT (access_token) của Admin đang đăng nhập
//      trong header Authorization: Bearer <token>.
//   2. Function này dùng JWT đó để xác minh người gọi đúng là Admin hợp lệ
//      (gọi lại RPC check_is_admin bằng một client Supabase được "đeo" đúng
//      JWT này - không dùng service_role cho bước xác minh).
//   3. Nếu hợp lệ, dùng một client Supabase KHÁC được tạo bằng service_role
//      key (lấy từ secret môi trường) để gọi auth.admin.updateUserById và
//      đặt mật khẩu mới cho user có email được chỉ định.
//
// CÁCH TRIỂN KHAI (deploy) - chạy trên máy có Supabase CLI:
//   1. supabase login
//   2. supabase link --project-ref fjznnrzbhymzdhrfinbz
//   3. supabase secrets set SUPABASE_SERVICE_ROLE_KEY=<service_role_key_của_bạn>
//      (Lấy service_role key tại: Supabase Dashboard > Project Settings > API
//       > Project API keys > service_role. KHÔNG commit key này lên GitHub,
//       KHÔNG dán vào bất kỳ file .html/.js nào trong thư mục public/.)
//   4. supabase functions deploy admin-reset-password
//   (SUPABASE_URL và SUPABASE_ANON_KEY được Supabase tự cấp sẵn cho mọi Edge
//    Function, không cần set tay.)
//
// Xem thêm hướng dẫn chi tiết trong README.md cùng thư mục này.
// =====================================================================

import { createClient } from "jsr:@supabase/supabase-js@2";

const ADMIN_EMAIL_WHITELIST = [
  "ngannguyen@inbook.vn",
  "nguyenchaukieungan10032006@gmail.com",
];

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: CORS_HEADERS });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Chỉ hỗ trợ phương thức POST." }, 405);
  }

  const authHeader = req.headers.get("Authorization") || "";
  const callerJwt = authHeader.replace(/^Bearer\s+/i, "").trim();
  if (!callerJwt) {
    return jsonResponse({ error: "Thiếu token xác thực (Authorization header)." }, 401);
  }

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
  const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");
  const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !SERVICE_ROLE_KEY) {
    return jsonResponse(
      {
        error:
          "Edge Function chưa được cấu hình đủ secret (thiếu SUPABASE_SERVICE_ROLE_KEY). " +
          "Xem README.md để chạy 'supabase secrets set'.",
      },
      500,
    );
  }

  // --- Bước 1: Xác minh người gọi là Admin hợp lệ, dùng chính JWT của họ (KHÔNG dùng service_role ở bước này) ---
  const callerClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${callerJwt}` } },
  });

  const { data: callerUser, error: callerUserError } = await callerClient.auth.getUser(callerJwt);
  if (callerUserError || !callerUser || !callerUser.user) {
    return jsonResponse({ error: "Token không hợp lệ hoặc đã hết hạn, vui lòng đăng nhập lại." }, 401);
  }

  const callerEmail = (callerUser.user.email || "").toLowerCase();

  // Xác minh qua RPC check_is_admin() (đã định nghĩa trong schema.sql) VÀ đối chiếu whitelist
  // ngay trong function này như một lớp bảo vệ thứ hai, để không phụ thuộc hoàn toàn vào phía DB.
  const { data: isAdminRpc, error: rpcError } = await callerClient.rpc("check_is_admin");
  const isWhitelisted = ADMIN_EMAIL_WHITELIST.includes(callerEmail);

  if (rpcError || isAdminRpc !== true || !isWhitelisted) {
    return jsonResponse({ error: "Tài khoản gọi hàm này không có quyền quản trị." }, 403);
  }

  // --- Bước 2: Đọc dữ liệu đầu vào ---
  let body: { email?: string; newPassword?: string };
  try {
    body = await req.json();
  } catch {
    return jsonResponse({ error: "Body request không phải JSON hợp lệ." }, 400);
  }

  const targetEmail = (body.email || "").trim();
  const newPassword = body.newPassword || "";

  if (!targetEmail || newPassword.length < 6) {
    return jsonResponse({ error: "Cần email hợp lệ và mật khẩu mới tối thiểu 6 ký tự." }, 400);
  }

  // --- Bước 3: Dùng client service_role (CHỈ tồn tại trong bộ nhớ của server lúc này) để đổi mật khẩu ---
  const adminClient = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

  // Supabase Admin API không có "get user by email" trực tiếp theo email đơn giản ở mọi phiên bản,
  // nên ta liệt kê và lọc theo email (số lượng user của dự án này nhỏ, đủ nhanh).
  // Nếu dự án phát triển lớn hơn nhiều, nên thay bằng một bảng profiles có lưu user_id <-> email.
  let targetUserId: string | null = null;
  let page = 1;
  const perPage = 1000;
  while (!targetUserId) {
    const { data: listData, error: listError } = await adminClient.auth.admin.listUsers({ page, perPage });
    if (listError) {
      return jsonResponse({ error: "Lỗi khi tìm người dùng: " + listError.message }, 500);
    }
    const found = listData.users.find((u) => (u.email || "").toLowerCase() === targetEmail.toLowerCase());
    if (found) {
      targetUserId = found.id;
      break;
    }
    if (listData.users.length < perPage) break; // hết danh sách, không tìm thấy
    page += 1;
  }

  if (!targetUserId) {
    return jsonResponse({ error: `Không tìm thấy học viên với email ${targetEmail}.` }, 404);
  }

  const { error: updateError } = await adminClient.auth.admin.updateUserById(targetUserId, {
    password: newPassword,
  });

  if (updateError) {
    return jsonResponse({ error: "Đặt lại mật khẩu thất bại: " + updateError.message }, 500);
  }

  return jsonResponse({ success: true, email: targetEmail });
});
