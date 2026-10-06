create table public.drama_videos (
  id uuid primary key default gen_random_uuid(),
  learner_id uuid not null references public.learners(id) on delete cascade,
  content_ref text not null,
  model text not null,
  prompt text not null,
  captions jsonb not null default '[]'::jsonb,
  aspect text not null default '9:16',
  duration_s int not null default 8,
  gateway_job_id text,
  status text not null default 'queued' check (status in ('queued','running','ready','failed')),
  progress int,
  error text,
  storage_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (learner_id, content_ref)
);
grant select on public.drama_videos to authenticated;
grant all on public.drama_videos to service_role;
alter table public.drama_videos enable row level security;
create policy own_read on public.drama_videos for select to authenticated using (learner_id = auth.uid());
create policy "own drama videos read" on storage.objects for select to authenticated using (bucket_id = 'drama-videos' and (storage.foldername(name))[1] = auth.uid()::text);