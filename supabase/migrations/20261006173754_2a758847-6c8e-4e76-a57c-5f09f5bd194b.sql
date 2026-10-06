
drop function public.apply_word_import(jsonb);
create or replace function public.apply_word_import(uid uuid, p jsonb)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  e jsonb; c jsonb; wid uuid; entered int := 0; queued int := 0; skipped int := 0; qpos int;
begin
  if uid is null then raise exception 'no learner'; end if;
  select coalesce(max(queue_position),0) into qpos from learner_words where learner_id = uid;
  for e in select * from jsonb_array_elements(p->'words') loop
    select id into wid from words where origin='course' and hanzi = e->>'hanzi';
    if wid is null then
      select id into wid from words where origin<>'course' and hanzi = e->>'hanzi' and pinyin = e->>'pinyin';
    end if;
    if wid is null then
      insert into words(hanzi,pinyin,meaning,origin) values (e->>'hanzi', e->>'pinyin', e->>'meaning', coalesce(e->>'origin','dictionary')) returning id into wid;
    end if;
    if exists (select 1 from learner_words where learner_id=uid and word_id=wid) then
      skipped := skipped + 1; continue;
    end if;
    if jsonb_array_length(coalesce(e->'cards','[]'::jsonb)) > 0 then
      insert into learner_words(learner_id,word_id,status,entered_via) values (uid,wid,'repertoire','imported');
      for c in select * from jsonb_array_elements(e->'cards') loop
        insert into cards(learner_id,word_id,skill,state,due) values (uid,wid,c->>'skill',c->'state',(c->>'due')::timestamptz)
        on conflict (learner_id,word_id,skill) do nothing;
      end loop;
      entered := entered + 1;
    else
      qpos := qpos + 1;
      insert into learner_words(learner_id,word_id,status,queue_position) values (uid,wid,'queued',qpos);
      queued := queued + 1;
    end if;
  end loop;
  return jsonb_build_object('entered',entered,'queued',queued,'skipped',skipped);
end $$;
revoke all on function public.apply_word_import(uuid, jsonb) from public, anon, authenticated;
grant execute on function public.apply_word_import(uuid, jsonb) to service_role;
