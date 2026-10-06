-- =====================================================================
-- SCHEMA CHO WEBSITE CHECK KEY - "THE WORLD OF GRAMMAR AND VOCABULARY"
-- BẢN REBUILD TOÀN DIỆN - chạy toàn bộ file này trong Supabase SQL Editor.
--
-- ⚠️ THAY ĐỔI QUAN TRỌNG SO VỚI BẢN CŨ:
-- Bảng "module_content" được XÓA VÀ TẠO LẠI với cấu trúc mới (item_id dạng
-- text thay vì module_number dạng int giới hạn 1-10), vì khung chương trình
-- thật có Unit tới 28 và các bài Revision/Exam dùng mã chữ (vd "rev_1_5",
-- "exam_1"), không nhét vừa kiểu int cũ. Bạn xác nhận dữ liệu hiện tại chỉ
-- là dữ liệu test nên có thể xóa sạch an toàn - nếu KHÔNG, hãy dừng lại và
-- tự sao lưu bảng module_content trước khi chạy file này.
-- =====================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------
-- 1. BẢNG profiles
-- ---------------------------------------------------------------------
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text not null,
  full_name   text,
  is_admin    boolean not null default false,
  created_at  timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------
-- 2. BẢNG user_devices (tối đa 2 thiết bị / tài khoản)
-- ---------------------------------------------------------------------
create table if not exists public.user_devices (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references public.profiles(id) on delete cascade,
  device_id       text not null,
  device_label    text,
  created_at      timestamptz not null default now(),
  last_login_at   timestamptz not null default now(),
  unique (user_id, device_id)
);

-- ---------------------------------------------------------------------
-- 3. BẢNG keys
-- ---------------------------------------------------------------------
create table if not exists public.keys (
  id            uuid primary key default gen_random_uuid(),
  code          text not null unique,
  level_code    text not null,
  is_used       boolean not null default false,
  user_id       uuid references public.profiles(id) on delete set null,
  activated_at  timestamptz,
  created_at    timestamptz not null default now(),
  created_by    uuid references public.profiles(id),
  batch_note    text
);

create index if not exists idx_keys_level_code on public.keys(level_code);
create index if not exists idx_keys_user_id on public.keys(user_id);

-- ---------------------------------------------------------------------
-- 4. BẢNG user_unlocked_levels
-- ---------------------------------------------------------------------
create table if not exists public.user_unlocked_levels (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references public.profiles(id) on delete cascade,
  level_code     text not null,
  activated_at   timestamptz not null default now(),
  unique (user_id, level_code)
);

-- ---------------------------------------------------------------------
-- 5. BẢNG module_content - CẤU TRÚC MỚI
--    item_id    : mã bài học, khớp CHÍNH XÁC với "id" do getLevelItemList()
--                 sinh ra trong config.js (vd "0" = Hello, "7" = Unit 7,
--                 "rev_1_5" = Revision, "exam_1" = Exam Practice).
--    item_order : vị trí 1-based của bài trong danh sách (khớp "order" do
--                 getLevelItemList() trả về) - dùng để tính đã mở khóa hay
--                 chưa, THAY vì so sánh trực tiếp số Unit (vì thứ tự thật
--                 bị xen kẽ bởi Revision/Exam nên không thể suy ra từ riêng
--                 item_id). Admin KHÔNG tự nhập cột này - admin.html tự
--                 tính bằng config.js rồi gửi lên.
-- ---------------------------------------------------------------------
drop table if exists public.module_content cascade;
create table public.module_content (
  id             uuid primary key default gen_random_uuid(),
  level_code     text not null,
  item_id        text not null,
  item_order     int  not null,
  title          text not null default '',
  content        text not null default '',
  resource_url   text,
  updated_at     timestamptz not null default now(),
  unique (level_code, item_id)
);

create index if not exists idx_module_content_level on public.module_content(level_code);

-- =====================================================================
-- HÀM TÍNH SỐ BÀI ĐÃ MỞ KHÓA (dùng chung cho RLS lẫn client hiển thị)
-- Quy tắc: kích hoạt -> mở ngay 2 bài đầu. Cứ 7 ngày trôi qua, mở thêm 2 bài.
-- KHÔNG giới hạn cứng ở đây (vì tổng số bài khác nhau theo từng Level) -
-- việc so totalItems do nơi gọi (client hoặc policy) tự chặn.
-- =====================================================================
create or replace function public.get_unlocked_item_count(
  p_activated_at timestamptz
)
returns int
language sql
immutable
as $$
  select (floor(extract(epoch from (now() - p_activated_at)) / (7 * 86400))::int + 1) * 2;
$$;

-- Giữ tên hàm cũ "get_unlocked_module_count" làm alias, phòng khi có chỗ nào
-- (ví dụ Supabase Edge Function khác) còn gọi theo tên cũ.
create or replace function public.get_unlocked_module_count(
  p_activated_at timestamptz
)
returns int
language sql
immutable
as $$
  select public.get_unlocked_item_count(p_activated_at);
$$;

-- =====================================================================
-- HÀM KIỂM TRA QUYỀN ADMIN
-- =====================================================================

-- Cách 1 (tổng quát): dựa vào cột is_admin trong bảng profiles.
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select coalesce((select p.is_admin from public.profiles p where p.id = auth.uid()), false);
$$;

-- Cách 2 (đang dùng thực tế trong admin.html): whitelist thẳng 2 email admin.
-- security definer + KHÔNG nhận tham số từ client (tự lấy email của phiên
-- đăng nhập hiện tại qua auth.jwt()), để không ai giả mạo email truyền vào.
-- Nếu bạn thêm/bớt admin, sửa danh sách email trong mảng ARRAY[...] dưới đây.
create or replace function public.check_is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select coalesce(
    (auth.jwt() ->> 'email') in (
      'ngannguyen@inbook.vn',
      'nguyenchaukieungan10032006@gmail.com'
    ),
    false
  );
$$;

-- =====================================================================
-- RPC: register_device
-- =====================================================================
create or replace function public.register_device(
  p_device_id text,
  p_device_label text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count int;
begin
  if p_device_id is null or length(trim(p_device_id)) = 0 then
    raise exception 'INVALID_DEVICE_ID';
  end if;

  update public.user_devices
     set last_login_at = now()
   where user_id = auth.uid() and device_id = p_device_id;

  if found then
    return;
  end if;

  select count(*) into v_count from public.user_devices where user_id = auth.uid();

  if v_count >= 2 then
    raise exception 'DEVICE_LIMIT_REACHED';
  end if;

  insert into public.user_devices (user_id, device_id, device_label)
  values (auth.uid(), p_device_id, p_device_label);
end;
$$;

-- =====================================================================
-- RPC: redeem_key
-- =====================================================================
create or replace function public.redeem_key(
  p_code text
)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_key record;
begin
  select * into v_key from public.keys where code = upper(trim(p_code)) for update;

  if not found then
    raise exception 'CODE_NOT_FOUND';
  end if;

  if v_key.is_used then
    raise exception 'CODE_ALREADY_USED';
  end if;

  update public.keys
     set is_used = true, user_id = auth.uid(), activated_at = now()
   where id = v_key.id;

  insert into public.user_unlocked_levels (user_id, level_code, activated_at)
  values (auth.uid(), v_key.level_code, now())
  on conflict (user_id, level_code) do nothing;

  return v_key.level_code;
end;
$$;

-- =====================================================================
-- RPC: admin_generate_keys
-- =====================================================================
create or replace function public.admin_generate_keys(
  p_level_code text,
  p_quantity int,
  p_note text default null
)
returns setof text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_code text;
  v_prefix text;
  i int;
begin
  if not public.check_is_admin() then
    raise exception 'FORBIDDEN_NOT_ADMIN';
  end if;

  if p_quantity is null or p_quantity <= 0 or p_quantity > 5000 then
    raise exception 'INVALID_QUANTITY';
  end if;

  v_prefix := upper(regexp_replace(p_level_code, '[^A-Za-z0-9]', '', 'g'));

  for i in 1..p_quantity loop
    loop
      v_code := v_prefix || '-' ||
                upper(substr(md5(random()::text || clock_timestamp()::text), 1, 4)) || '-' ||
                upper(substr(md5(random()::text || clock_timestamp()::text), 5, 4));
      exit when not exists (select 1 from public.keys where code = v_code);
    end loop;

    insert into public.keys (code, level_code, created_by, batch_note)
    values (v_code, p_level_code, auth.uid(), p_note);

    return next v_code;
  end loop;
  return;
end;
$$;

-- =====================================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================================
alter table public.profiles enable row level security;
alter table public.user_devices enable row level security;
alter table public.keys enable row level security;
alter table public.user_unlocked_levels enable row level security;
alter table public.module_content enable row level security;

-- ---- profiles ----
drop policy if exists "profiles_select_own_or_admin" on public.profiles;
create policy "profiles_select_own_or_admin"
  on public.profiles for select
  using (id = auth.uid() or public.check_is_admin());

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles for update
  using (id = auth.uid());

-- ---- user_devices ----
drop policy if exists "devices_select_own_or_admin" on public.user_devices;
create policy "devices_select_own_or_admin"
  on public.user_devices for select
  using (user_id = auth.uid() or public.check_is_admin());

-- ---- keys ----
drop policy if exists "keys_select_own_or_admin" on public.keys;
create policy "keys_select_own_or_admin"
  on public.keys for select
  using (user_id = auth.uid() or public.check_is_admin());

drop policy if exists "keys_insert_admin" on public.keys;
create policy "keys_insert_admin"
  on public.keys for insert
  with check (public.check_is_admin());

drop policy if exists "keys_update_admin" on public.keys;
create policy "keys_update_admin"
  on public.keys for update
  using (public.check_is_admin())
  with check (public.check_is_admin());

drop policy if exists "keys_delete_admin" on public.keys;
create policy "keys_delete_admin"
  on public.keys for delete
  using (public.check_is_admin());

-- ---- user_unlocked_levels ----
drop policy if exists "unlocked_select_own_or_admin" on public.user_unlocked_levels;
create policy "unlocked_select_own_or_admin"
  on public.user_unlocked_levels for select
  using (user_id = auth.uid() or public.check_is_admin());

-- ---- module_content ----
-- User chỉ xem được bài mà: (1) Level đã kích hoạt VÀ (2) item_order nằm
-- trong số bài đã tới lịch mở khóa (so bằng get_unlocked_item_count).
drop policy if exists "module_content_select_unlocked" on public.module_content;
create policy "module_content_select_unlocked"
  on public.module_content for select
  using (
    public.check_is_admin()
    or exists (
      select 1 from public.user_unlocked_levels uul
      where uul.user_id = auth.uid()
        and uul.level_code = module_content.level_code
        and module_content.item_order <= public.get_unlocked_item_count(uul.activated_at)
    )
  );

drop policy if exists "module_content_admin_write" on public.module_content;
create policy "module_content_admin_write"
  on public.module_content for all
  using (public.check_is_admin())
  with check (public.check_is_admin());

-- =====================================================================
-- GHI CHÚ QUAN TRỌNG:
-- 1. Để thêm/bớt admin: sửa danh sách email trong hàm check_is_admin() ở
--    trên rồi chạy lại riêng đoạn CREATE OR REPLACE FUNCTION đó.
-- 2. Khung chương trình (bao nhiêu Unit, Revision/Exam nằm ở đâu) KHÔNG
--    nằm trong database - nó nằm trong config.js (SYLLABUS_CONFIG), vì
--    đây là dữ liệu tĩnh dùng để cả 2 trang tính toán giống nhau. Database
--    chỉ lưu NỘI DUNG ĐÁP ÁN (title/content/resource_url) ứng với từng
--    item_id, và item_order để biết khi nào mở khóa.
-- 3. Nếu bạn từng chạy bản schema.sql cũ, bảng module_content cũ (cấu trúc
--    module_number kiểu int) đã bị XÓA bởi "drop table ... cascade" ở trên.
-- =====================================================================
