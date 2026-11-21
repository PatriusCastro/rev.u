-- Rev.U schema. Content tables are written only by scripts/import.ts (service role); user tables are owner-only.

create table exams (
  id text primary key,
  name text not null
);

-- Added beside the plan's tables so weights and mock settings live as data, not code.
create table subjects (
  id text primary key,
  exam_id text not null references exams on delete cascade,
  name text not null,
  weight numeric not null,
  mock_items int not null,
  mock_minutes int not null,
  sort int not null default 0
);

create table topics (
  id text primary key,              -- e.g. trigonometry/angles-of-elevation
  subject_id text not null references subjects on delete cascade,
  area text not null,               -- e.g. Trigonometry (groups sub-topics on the Subjects screen)
  name text not null,
  minutes int not null default 8,
  lesson text not null,
  sort int not null default 0
);

create table questions (
  id text primary key,              -- file path without extension
  topic_id text not null references topics on delete cascade,
  body text not null,
  choices jsonb not null,           -- [{ "key": "A", "text": "20.00 m" }, ...]
  answer text not null,
  hint text not null,
  steps jsonb not null,             -- ["step 1", "step 2", ...]
  figure text                       -- inline SVG, trusted: written by the import script only
);

create table profiles (
  id uuid primary key references auth.users on delete cascade,
  exam_date date,
  created_at timestamptz not null default now()
);

create table attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  mode text not null check (mode in ('practice', 'repeat', 'mock')),
  subject_id text references subjects,
  question_ids text[] not null,
  minutes int,                      -- mock time limit
  started_at timestamptz not null default now(),
  finished_at timestamptz
);

create table answers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  attempt_id uuid not null references attempts on delete cascade,
  question_id text not null references questions on delete cascade,
  choice text not null,
  correct boolean not null,
  created_at timestamptz not null default now(),
  unique (attempt_id, question_id)
);
create index answers_user_time on answers (user_id, created_at);

create table repeats (
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  question_id text not null references questions on delete cascade,
  interval int not null check (interval in (1, 3, 7)),
  due date not null,
  misses int not null default 1,
  cleared_at timestamptz,
  primary key (user_id, question_id)
);

create table documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  topic_id text references topics on delete set null,
  title text not null,
  path text not null unique,
  size bigint not null,
  created_at timestamptz not null default now()
);

-- Progress views. security_invoker makes them respect the caller's row access, so each user sees only their own answers.
create view topic_progress with (security_invoker = true) as
select t.id as topic_id,
  (select count(*) from questions q where q.topic_id = t.id) as total,
  count(a.id) as answered,
  count(a.id) filter (where a.correct) as correct,
  count(distinct a.question_id) as seen
from topics t
left join questions q on q.topic_id = t.id
left join answers a on a.question_id = q.id
group by t.id;

create view daily_answers with (security_invoker = true) as
select (created_at at time zone 'Asia/Manila')::date as day, count(*) as answered
from answers group by 1;

-- Access rules
alter table exams enable row level security;
alter table subjects enable row level security;
alter table topics enable row level security;
alter table questions enable row level security;
alter table profiles enable row level security;
alter table attempts enable row level security;
alter table answers enable row level security;
alter table repeats enable row level security;
alter table documents enable row level security;

create policy "read content" on exams for select to authenticated using (true);
create policy "read content" on subjects for select to authenticated using (true);
create policy "read content" on topics for select to authenticated using (true);
create policy "read content" on questions for select to authenticated using (true);

create policy "owner" on profiles for all to authenticated using (id = auth.uid()) with check (id = auth.uid());
create policy "owner" on attempts for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "owner" on answers for all to authenticated using (user_id = auth.uid())
  with check (user_id = auth.uid() and exists (select 1 from attempts a where a.id = attempt_id and a.user_id = auth.uid()));
create policy "owner" on repeats for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "owner" on documents for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

-- A profile row for every new user
create function public.handle_new_user() returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id) values (new.id);
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

-- PDF library: private bucket, PDFs only, 20 MB per file, 200 MB per user, one folder per user
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('library', 'library', false, 20971520, array['application/pdf']);

create function public.library_usage(uid uuid) returns bigint language sql stable security definer set search_path = '' as $$
  select coalesce(sum((metadata->>'size')::bigint), 0) from storage.objects where bucket_id = 'library' and owner_id = uid::text
$$;
revoke execute on function public.library_usage(uuid) from public, anon;

create policy "library read own" on storage.objects for select to authenticated
  using (bucket_id = 'library' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "library upload own" on storage.objects for insert to authenticated
  with check (bucket_id = 'library' and (storage.foldername(name))[1] = auth.uid()::text
    and public.library_usage(auth.uid()) < 209715200);
create policy "library delete own" on storage.objects for delete to authenticated
  using (bucket_id = 'library' and (storage.foldername(name))[1] = auth.uid()::text);
