// Gera supabase/xp-no-servidor.sql: o XP do ranking passa a ser calculado NO BANCO, a partir das fases concluídas.
// Uso: `node scripts/gerar_sql_xp.mjs` → depois colar o arquivo no Supabase (SQL Editor → New query → Run).
// Rode de novo (e cole de novo) sempre que criar uma fase ou mudar o XP de uma: o arquivo é idempotente.
//
// Regras do gatilho (ver o SQL gerado):
//   • só conta fase que existe, uma vez cada (o máximo do ranking é o XP de todas as fases somado);
//   • cada fase vale no máximo o XP dela (metade, se o save diz que a solução foi revelada — xpByMission);
//   • total_xp e missions_done são recalculados a cada gravação — o que o navegador manda nesses campos é ignorado;
//   • nome e raça não mudam depois de criados (o personagem é fixo).
import fs from "node:fs";

const DIR = new URL("../data/missions/", import.meta.url);
const OUT = new URL("../supabase/xp-no-servidor.sql", import.meta.url);

const missions = fs.readdirSync(DIR)
  .filter((f) => /^mission-\d+\.ts$/.test(f))
  .map((f) => {
    const src = fs.readFileSync(new URL(f, DIR), "utf-8");
    const id = Number(src.match(/^\s*id:\s*(\d+),/m)?.[1]);
    const xp = Number(src.match(/^\s*xpReward:\s*(\d+),/m)?.[1]);
    if (!Number.isInteger(id) || !Number.isInteger(xp)) throw new Error(`não consegui ler id/xpReward de ${f}`);
    return { id, xp };
  })
  .sort((a, b) => a.id - b.id);

const values = missions
  .map((m) => `  (${m.id}, ${m.xp})`)
  .join(",\n");
const total = missions.reduce((s, m) => s + m.xp, 0);

const sql = `-- DataQuest — XP calculado no servidor (anti-trapaça do ranking)
-- GERADO por scripts/gerar_sql_xp.mjs (${missions.length} fases, ${total} XP no total). Não edite à mão: rode o script de novo.
-- Rodar no painel do Supabase: SQL Editor → New query → colar tudo → Run. Pode rodar quantas vezes quiser.

-- ── As fases do jogo e o XP de cada uma ──
create table if not exists public.missions (
  id int primary key,
  xp int not null check (xp between 0 and 500)
);
alter table public.missions enable row level security;  -- sem políticas: só o gatilho (security definer) lê
revoke all on public.missions from anon, authenticated;

insert into public.missions (id, xp) values
${values}
on conflict (id) do update set xp = excluded.xp;
delete from public.missions where id not in (${missions.map((m) => m.id).join(", ")});

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
`;

fs.writeFileSync(OUT, sql);
console.log(`ok: supabase/xp-no-servidor.sql (${missions.length} fases, ${total} XP)`);
