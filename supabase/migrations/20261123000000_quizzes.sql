-- Quizzes: a titled, ordered set of problems an author writes for themselves or a class they own.
-- Decision (2026-11-21): taken exam style, through the mock exam path: answers can change until the end,
-- an optional time limit, score and solutions at the end, and misses go to the notebook.

create table quizzes (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users on delete cascade,
  class_id uuid references classes on delete set null,
  title text not null check (length(trim(title)) between 1 and 120),
  minutes int check (minutes between 1 and 300),   -- null: no time limit
  question_ids text[] not null default '{}' check (cardinality(question_ids) <= 100),
  created_at timestamptz not null default now()
);

alter table quizzes enable row level security;
create policy "read visible" on quizzes for select to authenticated using (public.can_see(owner_id, class_id));
create policy "write own" on quizzes for all to authenticated
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid() and (class_id is null or public.owns_class(class_id)));

alter table attempts add column quiz_id uuid references quizzes on delete set null;
