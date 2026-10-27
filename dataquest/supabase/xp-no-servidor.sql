-- DataQuest — XP calculado no servidor (anti-trapaça do ranking)
-- GERADO por scripts/gerar_sql_xp.mjs (33 fases, 995 XP no total). Não edite à mão: rode o script de novo.
-- Rodar no painel do Supabase: SQL Editor → New query → colar tudo → Run. Pode rodar quantas vezes quiser.

-- ── As fases do jogo e o XP de cada uma ──
create table if not exists public.missions (
  id int primary key,
  xp int not null check (xp between 0 and 500)
);
alter table public.missions enable row level security;  -- sem políticas: só o gatilho (security definer) lê
revoke all on public.missions from anon, authenticated;

insert into public.missions (id, xp) values
  (0, 10),
  (1, 20),
  (2, 20),
  (3, 25),
  (4, 30),
  (5, 20),
  (6, 25),
  (7, 25),
  (8, 35),
  (9, 25),
  (10, 30),
  (11, 30),
  (12, 40),
  (13, 35),
  (14, 40),
  (15, 30),
  (16, 35),
  (17, 25),
  (18, 25),
  (19, 30),
  (20, 30),
  (21, 30),
  (22, 45),
  (23, 35),
  (24, 35),
  (25, 35),
  (26, 30),
  (27, 45),
  (28, 25),
  (29, 30),
  (30, 30),
  (31, 35),
  (32, 35)
on conflict (id) do update set xp = excluded.xp;
delete from public.missions where id not in (0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32);

-- ── Recalcula XP e fases concluídas a cada gravação do save ──
create or replace function public.saves_recalc_xp()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  done   int[];
  valid  int[];
  xp_map jsonb;
begin
  -- fases que o save diz ter concluído (só números)
  select coalesce(array_agg(distinct v::int), '{}') into done
  from jsonb_array_elements_text(
    case when jsonb_typeof(new.state -> 'state' -> 'completedMissionIds') = 'array'
         then new.state -> 'state' -> 'completedMissionIds' else '[]'::jsonb end
  ) as v
  where v ~ '^[0-9]{1,6}$';

  -- vale só a fase que existe (cada uma uma vez). Pré-requisitos não são conferidos de propósito: fases novas
  -- entram NO MEIO da trilha, e quem já tinha vencido as de depois não pode perder o XP delas.
  select coalesce(array_agg(m.id), '{}') into valid
  from public.missions m
  where m.id = any(done);

  -- XP de cada fase: o que o save registrou (metade com a solução revelada), nunca acima do XP da fase.
  -- Save antigo sem o registro da fase → o XP cheio dela.
  xp_map := case when jsonb_typeof(new.state -> 'state' -> 'xpByMission') = 'object'
                 then new.state -> 'state' -> 'xpByMission' else '{}'::jsonb end;
  select coalesce(sum(least(m.xp,
           case when (xp_map ->> m.id::text) ~ '^[0-9]{1,6}$' then (xp_map ->> m.id::text)::int else m.xp end)), 0)
    into new.total_xp
  from public.missions m
  where m.id = any(valid);

  new.missions_done := cardinality(valid);

  -- o personagem é fixo: depois de criado, nome e raça não mudam
  if tg_op = 'UPDATE' then
    new.name := old.name;
    new.race := old.race;
  end if;
  return new;
end;
$$;

drop trigger if exists saves_recalc_xp on public.saves;
create trigger saves_recalc_xp
  before insert or update on public.saves
  for each row execute function public.saves_recalc_xp();

-- recalcula quem já está no ranking
update public.saves set updated_at = updated_at;
