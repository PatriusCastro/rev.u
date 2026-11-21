-- User-written content, classes, reports, and answers as one atomic database call.
-- Decisions (2026-11-22): any user can write lessons and problems; content is private to its author unless
-- placed in a class the author owns; class members see it; no approval step, students report problems instead.

-- Classes
create table classes (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users on delete cascade,
  name text not null check (length(trim(name)) between 1 and 80),
  code text not null unique default upper(substr(md5(gen_random_uuid()::text), 1, 6)),
  created_at timestamptz not null default now()
);
create table class_members (
  class_id uuid not null references classes on delete cascade,
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (class_id, user_id)
);

-- Ownership of content. owner_id null = built-in (written by the import script).
alter table topics add column owner_id uuid references auth.users on delete cascade,
  add column class_id uuid references classes on delete set null;
alter table questions add column owner_id uuid references auth.users on delete cascade,
  add column class_id uuid references classes on delete set null,
  add column title text;

alter table questions add constraint questions_shape check (jsonb_typeof(choices) = 'array' and jsonb_typeof(steps) = 'array');

-- Security definer helpers avoid policies that query each other's tables recursively.
create function public.owns_class(cid uuid) returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.classes where id = cid and owner_id = auth.uid())
$$;
create function public.in_class(cid uuid) returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.class_members where class_id = cid and user_id = auth.uid())
$$;
create function public.can_see(owner uuid, cid uuid) returns boolean language sql stable security definer set search_path = '' as $$
  select owner is null or owner = auth.uid() or (cid is not null and (public.owns_class(cid) or public.in_class(cid)))
$$;

-- Joining needs to find a class by code, which members-only rules would hide.
create function public.join_class(p_code text) returns text language plpgsql security definer set search_path = '' as $$
declare c public.classes%rowtype;
begin
  if auth.uid() is null then raise exception 'not signed in'; end if;
  select * into c from public.classes where code = upper(trim(p_code));
  if not found then return null; end if;
  insert into public.class_members (class_id, user_id) values (c.id, auth.uid()) on conflict do nothing;
  return c.name;
end $$;

alter table classes enable row level security;
alter table class_members enable row level security;
create policy "see own or joined" on classes for select to authenticated using (owner_id = auth.uid() or public.in_class(id));
create policy "create own" on classes for insert to authenticated with check (owner_id = auth.uid());
create policy "change own" on classes for update to authenticated using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "delete own" on classes for delete to authenticated using (owner_id = auth.uid());
create policy "see own membership or own class" on class_members for select to authenticated using (user_id = auth.uid() or public.owns_class(class_id));
create policy "leave or remove" on class_members for delete to authenticated using (user_id = auth.uid() or public.owns_class(class_id));

-- Content rules: read what you can see; write only your own, and only into your own classes.
drop policy "read content" on topics;
drop policy "read content" on questions;
create policy "read visible" on topics for select to authenticated using (public.can_see(owner_id, class_id));
create policy "write own" on topics for all to authenticated
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid() and (class_id is null or public.owns_class(class_id)));
create policy "read visible" on questions for select to authenticated using (public.can_see(owner_id, class_id));
create policy "write own" on questions for all to authenticated
  using (owner_id = auth.uid())
  with check (
    -- figure is raw SVG rendered into the page, so only the import script may set it.
    owner_id = auth.uid() and figure is null and (class_id is null or public.owns_class(class_id))
    -- A problem may sit under a built-in topic, or under its author's topic with the same audience.
    and exists (select 1 from topics t where t.id = topic_id and (t.owner_id is null or (t.owner_id = auth.uid() and t.class_id is not distinct from questions.class_id)))
  );

-- Reports on a problem's solution, seen by the reporter and the problem's author.
create table flags (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  question_id text not null references questions on delete cascade,
  note text not null check (length(trim(note)) between 1 and 500),
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);
alter table flags enable row level security;
create policy "report visible" on flags for insert to authenticated
  with check (user_id = auth.uid() and exists (select 1 from questions q where q.id = question_id));
create policy "see own or about mine" on flags for select to authenticated
  using (user_id = auth.uid() or exists (select 1 from questions q where q.id = question_id and q.owner_id = auth.uid()));
create policy "author resolves" on flags for update to authenticated
  using (exists (select 1 from questions q where q.id = question_id and q.owner_id = auth.uid()));

-- Spaced repeat rule (docs/build-plan.md): a miss puts the problem at 1 day; a right answer on a due repeat
-- moves it 1 -> 3 -> 7 -> cleared; a right answer before it is due changes nothing.
-- Returns { stage, moved }; stage is '1' | '3' | '7' | 'cleared' | null (not in the notebook).
create function apply_repeat(p_question text, p_correct boolean) returns jsonb
language plpgsql security invoker set search_path = public as $$
declare
  r repeats%rowtype;
  today date := (now() at time zone 'Asia/Manila')::date;
  nxt int;
begin
  select * into r from repeats where user_id = auth.uid() and question_id = p_question for update;
  if not p_correct then
    insert into repeats (user_id, question_id, interval, due, misses, cleared_at)
    values (auth.uid(), p_question, 1, today + 1, 1, null)
    on conflict (user_id, question_id) do update set interval = 1, due = today + 1, misses = repeats.misses + 1, cleared_at = null;
    return jsonb_build_object('stage', '1', 'moved', true);
  end if;
  if not found or r.cleared_at is not null then return jsonb_build_object('stage', null, 'moved', false); end if;
  if r.due > today then return jsonb_build_object('stage', r.interval::text, 'moved', false); end if;
  if r.interval = 7 then
    update repeats set cleared_at = now() where user_id = auth.uid() and question_id = p_question;
    return jsonb_build_object('stage', 'cleared', 'moved', true);
  end if;
  nxt := case r.interval when 1 then 3 else 7 end;
  update repeats set interval = nxt, due = today + nxt where user_id = auth.uid() and question_id = p_question;
  return jsonb_build_object('stage', nxt::text, 'moved', true);
end $$;

-- Ends a set once. A mock exam's final answers go through the repeat rule here.
create function finish_attempt(p_attempt uuid) returns void
language plpgsql security invoker set search_path = public as $$
declare m text;
begin
  update attempts set finished_at = now() where id = p_attempt and user_id = auth.uid() and finished_at is null returning mode into m;
  if m = 'mock' then
    perform apply_repeat(a.question_id, a.correct) from answers a where a.attempt_id = p_attempt;
  end if;
end $$;

-- Saves one answer atomically. Practice and repeats: one answer per problem, the notebook updates, and the
-- answer and solution come back. Mock: answers can change until the exam ends, and nothing is revealed.
-- An empty choice is "Show me how": a miss.
create function submit_answer(p_attempt uuid, p_question text, p_choice text) returns jsonb
language plpgsql security invoker set search_path = public as $$
declare
  a attempts%rowtype;
  q questions%rowtype;
  ok boolean;
begin
  select * into a from attempts where id = p_attempt and user_id = auth.uid() for update;
  if not found or not (p_question = any (a.question_ids)) then return jsonb_build_object('error', 'This problem is not part of this set.'); end if;
  if a.finished_at is not null then return jsonb_build_object('error', 'This set is already finished.', 'over', true); end if;
  if a.mode = 'mock' and now() > a.started_at + make_interval(mins => a.minutes) + interval '30 seconds' then
    perform finish_attempt(p_attempt);
    return jsonb_build_object('error', 'Time is up. Your answers so far are saved.', 'over', true);
  end if;
  select * into q from questions where id = p_question; -- row rules apply: an invisible problem is not found
  if not found then return jsonb_build_object('error', 'This problem is no longer available.'); end if;
  ok := p_choice = q.answer;

  if a.mode = 'mock' then
    if p_choice = '' then return jsonb_build_object('error', 'Pick an answer first.'); end if;
    insert into answers (attempt_id, question_id, choice, correct) values (p_attempt, p_question, p_choice, ok)
    on conflict (attempt_id, question_id) do update set choice = excluded.choice, correct = excluded.correct, created_at = now();
    return jsonb_build_object('saved', true);
  end if;

  begin
    insert into answers (attempt_id, question_id, choice, correct) values (p_attempt, p_question, p_choice, ok);
  exception when unique_violation then
    return jsonb_build_object('error', 'You already answered this one.');
  end;
  if (select count(*) from answers where attempt_id = p_attempt) = cardinality(a.question_ids) then
    update attempts set finished_at = now() where id = p_attempt;
  end if;
  return jsonb_build_object('correct', ok, 'answer', q.answer, 'steps', q.steps) || apply_repeat(p_question, ok);
end $$;

revoke execute on function public.owns_class(uuid), public.in_class(uuid), public.can_see(uuid, uuid), public.join_class(text),
  apply_repeat(text, boolean), finish_attempt(uuid), submit_answer(uuid, text, text) from public, anon;
grant execute on function public.owns_class(uuid), public.in_class(uuid), public.can_see(uuid, uuid), public.join_class(text),
  apply_repeat(text, boolean), finish_attempt(uuid), submit_answer(uuid, text, text) to authenticated;
