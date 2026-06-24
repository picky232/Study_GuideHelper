-- 사용자 프로필 (auth.users와 1:1, id로 연결)
create table users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  name text,
  daily_study_hours numeric,
  notify_time time,
  created_at timestamptz default now()
);

-- 목표
create table goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  subject text not null,
  exam_type text,
  deadline date not null,
  daily_hours numeric not null,
  study_range text,
  current_level int,
  status text default 'active',
  created_at timestamptz default now()
);

-- 일자별 학습 태스크
create table schedules (
  id uuid primary key default gen_random_uuid(),
  goal_id uuid not null references goals(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  date date not null,
  title text not null,
  duration_min int not null,
  is_done boolean default false,
  is_review boolean default false,
  review_round int default 0,
  created_at timestamptz default now()
);

-- FCM 토큰
create table fcm_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  token text not null,
  created_at timestamptz default now()
);

-- RLS 활성화
alter table users enable row level security;
alter table goals enable row level security;
alter table schedules enable row level security;
alter table fcm_tokens enable row level security;

-- 본인 데이터만 접근 가능
create policy "본인 프로필만 조회/수정" on users
  for all using (auth.uid() = id);

create policy "본인 목표만 접근" on goals
  for all using (auth.uid() = user_id);

create policy "본인 일정만 접근" on schedules
  for all using (auth.uid() = user_id);

create policy "본인 FCM 토큰만 접근" on fcm_tokens
  for all using (auth.uid() = user_id);
