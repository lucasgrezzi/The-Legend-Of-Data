-- DataQuest — banco do Supabase (contas + ranking)
-- Rodar UMA vez no painel do Supabase: SQL Editor → New query → colar tudo → Run.

-- ── Progresso salvo de cada jogador (1 linha por conta) ──
create table if not exists public.saves (
  user_id       uuid primary key references auth.users (id) on delete cascade,
  name          text not null check (char_length(name) between 2 and 20),
  race          text not null check (race in ('elfo', 'anao', 'orc', 'goblin')),
  total_xp      int  not null default 0 check (total_xp between 0 and 5000),
  missions_done int  not null default 0 check (missions_done between 0 and 500),
  -- snapshot completo do gameStore ({ version, state }) — só o dono lê
  state         jsonb not null,
  updated_at    timestamptz not null default now()
);

alter table public.saves enable row level security;

-- Cada pessoa só lê e grava a PRÓPRIA linha
drop policy if exists "saves: dono lê" on public.saves;
create policy "saves: dono lê" on public.saves
  for select to authenticated using ((select auth.uid()) = user_id);

drop policy if exists "saves: dono cria" on public.saves;
create policy "saves: dono cria" on public.saves
  for insert to authenticated with check ((select auth.uid()) = user_id);

drop policy if exists "saves: dono atualiza" on public.saves;
create policy "saves: dono atualiza" on public.saves
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

revoke all on public.saves from anon;
grant select, insert, update on public.saves to authenticated;

-- ── Ranking: expõe só nome, raça, XP e missões (nunca e-mail nem o save completo) ──
create or replace function public.get_leaderboard(lim int default 50)
returns table (name text, race text, total_xp int, missions_done int, is_me boolean)
language sql
stable
security definer
set search_path = ''
as $$
  select s.name, s.race, s.total_xp, s.missions_done, s.user_id = auth.uid()
  from public.saves s
  order by s.total_xp desc, s.missions_done desc, s.updated_at asc
  limit least(greatest(lim, 1), 100);
$$;

revoke execute on function public.get_leaderboard(int) from public;
grant execute on function public.get_leaderboard(int) to anon, authenticated;
