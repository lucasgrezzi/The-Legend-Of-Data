-- Loja do Mercador: mostra o título equipado no ranking.
-- Rodar UMA vez no SQL Editor do Supabase. O site funciona sem isto (o ranking só não mostra o título).
-- Expõe apenas o id do título equipado (ex.: "titulo-curioso") — nada mais do save.

drop function if exists public.get_leaderboard(int);

create or replace function public.get_leaderboard(lim int default 50)
returns table (name text, race text, total_xp int, missions_done int, is_me boolean, title_id text)
language sql
stable
security definer
set search_path = ''
as $$
  select s.name, s.race, s.total_xp, s.missions_done, s.user_id = auth.uid(),
         s.state -> 'state' -> 'equipped' ->> 'titulo'
  from public.saves s
  order by s.total_xp desc, s.missions_done desc, s.updated_at asc
  limit least(greatest(lim, 1), 100);
$$;

revoke execute on function public.get_leaderboard(int) from public;
grant execute on function public.get_leaderboard(int) to anon, authenticated;
