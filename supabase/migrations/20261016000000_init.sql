-- 점심 메뉴 돌림판 스키마
create table public.menus (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 30),
  created_at timestamptz not null default now()
);
create index menus_user_id_idx on public.menus(user_id);

create table public.spins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  menu_name text not null,
  created_at timestamptz not null default now()
);
create index spins_user_id_created_at_idx on public.spins(user_id, created_at desc);

-- 백엔드는 secret key로 접근하고, 브라우저에서 직접 접근해도 본인 데이터만 보이도록 RLS 설정
alter table public.menus enable row level security;
alter table public.spins enable row level security;

create policy "own menus" on public.menus
  for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "own spins" on public.spins
  for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
