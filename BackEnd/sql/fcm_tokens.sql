-- fcm_tokens 테이블: FCM 푸시 토큰 저장
create table if not exists fcm_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  token text not null unique,
  created_at timestamptz default now()
);

-- RLS 활성화
alter table fcm_tokens enable row level security;

-- 본인 토큰만 접근
create policy "users can manage own fcm tokens"
  on fcm_tokens
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- 인덱스
create index if not exists idx_fcm_tokens_user_id on fcm_tokens(user_id);
