
create table public.learners (
  id uuid primary key,
  display_name text not null default 'Learner',
  chinese_name text, chinese_name_pinyin text, about text, avatar text,
  timezone text not null default 'UTC',
  daily_recognise int not null default 10, daily_produce int not null default 10,
  lesson_pace int not null default 5, pinyin_on boolean not null default true,
  coins int not null default 0, is_synthetic boolean not null default false,
  created_at timestamptz not null default now()
);
create table public.words (
  id uuid primary key default gen_random_uuid(),
  hanzi text not null, pinyin text not null, meaning text not null,
  accepted text[] not null default '{}', alt_readings text[] not null default '{}', synonyms text[] not null default '{}',
  self_scored boolean not null default false,
  origin text not null check (origin in ('course','dictionary','manual')),
  course_lesson int, created_at timestamptz not null default now()
);
create unique index words_course_hanzi on public.words(hanzi) where origin='course';
create unique index words_other_hanzi_pinyin on public.words(hanzi,pinyin) where origin<>'course';
create table public.sources (
  id uuid primary key default gen_random_uuid(),
  learner_id uuid, title text not null,
  kind text not null check (kind in ('course','book','described','manual')),
  word_ids uuid[] not null default '{}', plan jsonb, status text not null default 'ready',
  created_at timestamptz not null default now()
);
create unique index sources_one_course on public.sources(kind) where kind='course';
create table public.lessons (
  id uuid primary key default gen_random_uuid(),
  source_id uuid not null references public.sources(id) on delete cascade,
  ord int not null, title text not null, word_ids uuid[] not null default '{}', course_key text,
  unique(source_id, ord)
);
create table public.learner_words (
  id uuid primary key default gen_random_uuid(),
  learner_id uuid not null, word_id uuid not null references public.words(id),
  status text not null check (status in ('queued','repertoire')),
  entered_via text check (entered_via in ('lesson','declared','imported')),
  queue_position int, source_id uuid, entered_at timestamptz not null default now(),
  unique(learner_id, word_id)
);
create table public.cards (
  id uuid primary key default gen_random_uuid(),
  learner_id uuid not null, word_id uuid not null references public.words(id),
  skill text not null, state jsonb not null, due timestamptz not null,
  unique(learner_id, word_id, skill)
);
create table public.evidence (
  id uuid primary key default gen_random_uuid(),
  learner_id uuid not null, request_id text not null, word_id uuid not null, skill text not null,
  outcome text not null check (outcome in ('fail','hard','good','easy')),
  activity text not null, prev_card jsonb, prev_learner_word jsonb, result jsonb,
  undone boolean not null default false, created_at timestamptz not null default now(),
  unique(learner_id, request_id)
);
create table public.sentences (
  id uuid primary key default gen_random_uuid(),
  tokens jsonb not null, english text not null,
  origin text not null check (origin in ('course','generated','own')),
  course_key text, needs_user_name boolean not null default false, learner_id uuid,
  unique(course_key)
);
create table public.sentence_targets (
  id uuid primary key default gen_random_uuid(),
  sentence_id uuid not null references public.sentences(id) on delete cascade,
  word_id uuid not null references public.words(id), gap text, answers text[] not null default '{}',
  unique(sentence_id, word_id)
);
create table public.compounds (hanzi text primary key, verdict text not null check (verdict in ('transparent','opaque')));
create table public.places (
  id uuid primary key default gen_random_uuid(), learner_id uuid, slot text not null,
  kind text not null default 'neighbour', source_id uuid, host jsonb, lines jsonb, objects jsonb, scenario jsonb, art jsonb,
  status text not null default 'pending', created_at timestamptz not null default now()
);
create table public.content_items (
  id uuid primary key default gen_random_uuid(), learner_id uuid, place_id uuid,
  surface text not null, format text not null, recipe text, level int not null default 1,
  required_word_ids uuid[] not null default '{}', payload jsonb,
  status text not null default 'pending' check (status in ('pending','ready','failed')),
  created_at timestamptz not null default now()
);
create table public.seen (learner_id uuid not null, content_id uuid not null, seen_at timestamptz not null default now(), primary key(learner_id, content_id));
create table public.jobs (
  id uuid primary key default gen_random_uuid(), learner_id uuid not null, kind text not null,
  input jsonb, status text not null default 'queued' check (status in ('queued','running','ready','failed','awaiting_acceptance')),
  step text, error text, outputs jsonb, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.review_sessions (
  id uuid primary key default gen_random_uuid(), learner_id uuid not null, direction text not null, day date not null,
  seed int not null, items jsonb not null, position int not null default 0, round int not null default 1,
  grades jsonb not null default '[]', created_at timestamptz not null default now(),
  unique(learner_id, direction, day)
);
create table public.transcripts (id uuid primary key default gen_random_uuid(), learner_id uuid not null, content_id uuid, place_id uuid, turns jsonb not null default '[]', created_at timestamptz not null default now());
create table public.layouts (id uuid primary key default gen_random_uuid(), learner_id uuid, picture text not null, hotspots jsonb not null default '{}', updated_at timestamptz not null default now());
create unique index layouts_picture on public.layouts(picture) where learner_id is null;
create table public.model_calls (id uuid primary key default gen_random_uuid(), learner_id uuid, job_id uuid, stage text, model text, attempt int, input_tokens int, output_tokens int, cached_tokens int, cost_usd numeric, elapsed_ms int, ok boolean, error text, created_at timestamptz not null default now());
create table public.art_assets (name text primary key, url text not null, width int, height int, has_alpha boolean, uploaded_by uuid, uploaded_at timestamptz not null default now());

grant select, insert, update, delete on public.learners, public.learner_words, public.cards, public.evidence, public.review_sessions, public.transcripts, public.seen, public.jobs to authenticated;
grant select on public.words, public.sources, public.lessons, public.sentences, public.sentence_targets, public.compounds, public.places, public.content_items, public.layouts, public.model_calls, public.art_assets to authenticated;
grant all on all tables in schema public to service_role;

alter table public.learners enable row level security;
alter table public.words enable row level security;
alter table public.sources enable row level security;
alter table public.lessons enable row level security;
alter table public.learner_words enable row level security;
alter table public.cards enable row level security;
alter table public.evidence enable row level security;
alter table public.sentences enable row level security;
alter table public.sentence_targets enable row level security;
alter table public.compounds enable row level security;
alter table public.places enable row level security;
alter table public.content_items enable row level security;
alter table public.seen enable row level security;
alter table public.jobs enable row level security;
alter table public.review_sessions enable row level security;
alter table public.transcripts enable row level security;
alter table public.layouts enable row level security;
alter table public.model_calls enable row level security;
alter table public.art_assets enable row level security;

create policy own on public.learners for all to authenticated using (id = auth.uid()) with check (id = auth.uid());
create policy own on public.learner_words for all to authenticated using (learner_id = auth.uid()) with check (learner_id = auth.uid());
create policy own on public.cards for all to authenticated using (learner_id = auth.uid()) with check (learner_id = auth.uid());
create policy own on public.evidence for all to authenticated using (learner_id = auth.uid()) with check (learner_id = auth.uid());
create policy own on public.review_sessions for all to authenticated using (learner_id = auth.uid()) with check (learner_id = auth.uid());
create policy own on public.transcripts for all to authenticated using (learner_id = auth.uid()) with check (learner_id = auth.uid());
create policy own on public.seen for all to authenticated using (learner_id = auth.uid()) with check (learner_id = auth.uid());
create policy own on public.jobs for all to authenticated using (learner_id = auth.uid()) with check (learner_id = auth.uid());
create policy readall on public.words for select to authenticated using (true);
create policy readall on public.compounds for select to authenticated using (true);
create policy readall on public.art_assets for select to authenticated using (true);
create policy readmine on public.sources for select to authenticated using (learner_id is null or learner_id = auth.uid());
create policy readmine on public.lessons for select to authenticated using (exists (select 1 from public.sources s where s.id = source_id and (s.learner_id is null or s.learner_id = auth.uid())));
create policy readmine on public.sentences for select to authenticated using (learner_id is null or learner_id = auth.uid());
create policy readmine on public.sentence_targets for select to authenticated using (exists (select 1 from public.sentences s where s.id = sentence_id and (s.learner_id is null or s.learner_id = auth.uid())));
create policy readmine on public.places for select to authenticated using (learner_id is null or learner_id = auth.uid());
create policy readmine on public.content_items for select to authenticated using (learner_id is null or learner_id = auth.uid());
create policy readmine on public.layouts for select to authenticated using (learner_id is null or learner_id = auth.uid());
create policy readmine on public.model_calls for select to authenticated using (learner_id = auth.uid());
