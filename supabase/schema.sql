-- LearningStar: Familien-Rangliste über mehrere Geräte.
--
-- Die Kinder melden sich nicht an. Stattdessen teilt sich eine Familie einen
-- zufälligen Familien-Code. Die Tabellen sind für die öffentlichen Rollen
-- gesperrt; alle Zugriffe laufen über die Funktionen unten, die den Code prüfen.
--
-- Einrichtung: Inhalt im Supabase-Dashboard unter "SQL Editor" ausführen.

create table if not exists public.families (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null check (char_length(name) between 1 and 40),
  created_at timestamptz not null default now()
);

create table if not exists public.players (
  id uuid primary key,
  family_id uuid not null references public.families (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 20),
  avatar text not null check (char_length(avatar) between 1 and 16),
  color text not null check (color ~ '^#[0-9a-fA-F]{6}$'),
  created_at timestamptz not null default now(),
  total_points integer not null default 0 check (total_points >= 0),
  missions jsonb not null default '{}'::jsonb,
  mistakes jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create index if not exists players_family_idx on public.players (family_id);

-- Jede gespielte Mission, damit sich z. B. die Punkte der Woche berechnen lassen.
create table if not exists public.point_events (
  id bigint generated always as identity primary key,
  family_id uuid not null references public.families (id) on delete cascade,
  player_id uuid not null references public.players (id) on delete cascade,
  mission_id text not null,
  points integer not null check (points between 0 and 100),
  created_at timestamptz not null default now()
);

create index if not exists point_events_family_time_idx on public.point_events (family_id, created_at);

alter table public.families enable row level security;
alter table public.players enable row level security;
alter table public.point_events enable row level security;

revoke all on public.families, public.players, public.point_events from anon, authenticated;

-- --- Hilfsfunktionen (nicht öffentlich) --------------------------------------

create or replace function public.ls_normalize_code(p_code text)
returns text
language sql
immutable
set search_path = ''
as $$
  select upper(regexp_replace(coalesce(p_code, ''), '[^A-Za-z0-9]', '', 'g'))
$$;

create or replace function public.ls_family_id(p_code text)
returns uuid
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_id uuid;
begin
  select id into v_id from public.families where code = public.ls_normalize_code(p_code);
  if v_id is null then
    raise exception 'family_not_found' using errcode = 'P0002';
  end if;
  return v_id;
end;
$$;

create or replace function public.ls_player_json(p public.players)
returns jsonb
language sql
stable
set search_path = ''
as $$
  select jsonb_build_object(
    'id', p.id,
    'name', p.name,
    'avatar', p.avatar,
    'color', p.color,
    'createdAt', p.created_at,
    'totalPoints', p.total_points,
    'missions', p.missions,
    'mistakes', p.mistakes
  )
$$;

-- --- Öffentliche Funktionen ------------------------------------------------

-- Legt eine Familie an und gibt ihren Code zurück, z. B. {"code": "K7PM3XQA", "name": "Familie Muster"}.
create or replace function public.create_family(p_name text)
returns jsonb
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  -- Ohne leicht verwechselbare Zeichen (0/O, 1/I/L).
  v_alphabet constant text := 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  v_code text;
  v_name text := btrim(p_name);
begin
  loop
    v_code := '';
    for i in 1..8 loop
      v_code := v_code || substr(v_alphabet, 1 + floor(random() * length(v_alphabet))::int, 1);
    end loop;
    exit when not exists (select 1 from public.families where code = v_code);
  end loop;
  insert into public.families (code, name) values (v_code, v_name);
  return jsonb_build_object('code', v_code, 'name', v_name);
end;
$$;

create or replace function public.join_family(p_code text)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object('code', f.code, 'name', f.name)
  from public.families f
  where f.id = public.ls_family_id(p_code)
$$;

create or replace function public.list_players(p_code text)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(jsonb_agg(public.ls_player_json(p) order by p.created_at), '[]'::jsonb)
  from public.players p
  where p.family_id = public.ls_family_id(p_code)
$$;

-- Legt einen Spieler an. Bereits gesammelte Punkte (z. B. von einem Gerät ohne
-- Familie) werden übernommen. Erneutes Anlegen desselben Spielers ist harmlos.
create or replace function public.create_player(p_code text, p_player jsonb)
returns jsonb
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_family uuid := public.ls_family_id(p_code);
  v_player public.players;
begin
  insert into public.players (id, family_id, name, avatar, color, created_at, total_points, missions, mistakes)
  values (
    (p_player ->> 'id')::uuid,
    v_family,
    btrim(p_player ->> 'name'),
    p_player ->> 'avatar',
    p_player ->> 'color',
    coalesce((p_player ->> 'createdAt')::timestamptz, now()),
    greatest(coalesce((p_player ->> 'totalPoints')::int, 0), 0),
    coalesce(p_player -> 'missions', '{}'::jsonb),
    coalesce(p_player -> 'mistakes', '{}'::jsonb)
  )
  on conflict (id) do nothing;

  select * into v_player from public.players where id = (p_player ->> 'id')::uuid;
  if v_player.family_id <> v_family then
    raise exception 'player_not_found' using errcode = 'P0002';
  end if;
  return public.ls_player_json(v_player);
end;
$$;

create or replace function public.get_player(p_code text, p_player_id uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_player public.players;
begin
  select * into v_player from public.players
  where id = p_player_id and family_id = public.ls_family_id(p_code);
  if v_player.id is null then
    raise exception 'player_not_found' using errcode = 'P0002';
  end if;
  return public.ls_player_json(v_player);
end;
$$;

-- Speichert das Ergebnis einer Mission: Die Punkte werden auf dem Server
-- addiert, damit keine verloren gehen, wenn ein Kind auf zwei Geräten spielt.
create or replace function public.save_progress(
  p_code text,
  p_player_id uuid,
  p_mission_id text,
  p_points integer,
  p_missions jsonb,
  p_mistakes jsonb
)
returns jsonb
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_family uuid := public.ls_family_id(p_code);
  v_player public.players;
begin
  if pg_column_size(p_missions) + pg_column_size(p_mistakes) > 200000 then
    raise exception 'progress_too_large' using errcode = '22023';
  end if;

  update public.players
  set total_points = total_points + p_points,
      missions = p_missions,
      mistakes = p_mistakes,
      updated_at = now()
  where id = p_player_id and family_id = v_family
  returning * into v_player;

  if v_player.id is null then
    raise exception 'player_not_found' using errcode = 'P0002';
  end if;

  insert into public.point_events (family_id, player_id, mission_id, points)
  values (v_family, p_player_id, p_mission_id, p_points);

  return public.ls_player_json(v_player);
end;
$$;

-- Rangliste der Familie: Punkte seit Montag 0 Uhr (deutsche Zeit) und insgesamt.
create or replace function public.leaderboard(p_code text)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  with family as (
    select public.ls_family_id(p_code) as id
  ),
  week as (
    select date_trunc('week', now() at time zone 'Europe/Berlin') at time zone 'Europe/Berlin' as starts_at
  )
  select coalesce(jsonb_agg(entry order by (entry ->> 'weekPoints')::int desc, (entry ->> 'totalPoints')::int desc), '[]'::jsonb)
  from (
    select jsonb_build_object(
      'playerId', p.id,
      'name', p.name,
      'avatar', p.avatar,
      'color', p.color,
      'totalPoints', p.total_points,
      'weekPoints', coalesce((
        select sum(e.points) from public.point_events e, week
        where e.player_id = p.id and e.created_at >= week.starts_at
      ), 0)
    ) as entry
    from public.players p, family
    where p.family_id = family.id
  ) entries
$$;

revoke execute on function
  public.ls_normalize_code(text),
  public.ls_family_id(text),
  public.ls_player_json(public.players),
  public.create_family(text),
  public.join_family(text),
  public.list_players(text),
  public.create_player(text, jsonb),
  public.get_player(text, uuid),
  public.save_progress(text, uuid, text, integer, jsonb, jsonb),
  public.leaderboard(text)
from public;

-- Supabase gibt neuen Funktionen standardmäßig Rechte für anon/authenticated,
-- die Hilfsfunktionen sollen aber nicht über die API aufrufbar sein.
revoke execute on function
  public.ls_normalize_code(text),
  public.ls_family_id(text),
  public.ls_player_json(public.players)
from anon, authenticated;

grant execute on function
  public.create_family(text),
  public.join_family(text),
  public.list_players(text),
  public.create_player(text, jsonb),
  public.get_player(text, uuid),
  public.save_progress(text, uuid, text, integer, jsonb, jsonb),
  public.leaderboard(text)
to anon, authenticated;
