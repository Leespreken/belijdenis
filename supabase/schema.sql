-- Plak dit in Supabase > SQL Editor en klik op Run.

create table if not exists catechisanten (
  id uuid primary key default gen_random_uuid(),
  naam text not null,
  code text not null unique,
  aangemaakt timestamptz not null default now()
);

create table if not exists antwoorden (
  catechisant_id uuid not null references catechisanten(id) on delete cascade,
  les int not null,
  vraag int not null,
  antwoord text not null default '',
  secs int not null default 0,          -- seconden tussen beginnen en antwoord bekijken
  tekens int not null default 0,        -- lengte van het antwoord
  getypt int not null default 0,        -- tekens die echt getypt zijn
  geplakt boolean not null default false,
  kern int not null default 0,          -- genoemde kernpunten
  kern_totaal int not null default 0,
  poging int not null default 1,
  zelf int,                             -- 0 = moet oefenen, 1 = gedeeltelijk, 2 = wist ik
  gedaan timestamptz not null default now(),
  primary key (catechisant_id, les, vraag)
);

create table if not exists activiteit (
  catechisant_id uuid not null references catechisanten(id) on delete cascade,
  les int not null,
  dag date not null,
  tab text not null,                    -- lezen | vragen | extra | onthouden
  secs int not null default 0,
  primary key (catechisant_id, les, dag, tab)
);

create table if not exists herhaling (
  catechisant_id uuid not null references catechisanten(id) on delete cascade,
  les int not null,
  vraag int not null,
  box int not null default 0,
  volgende date not null,
  goed int not null default 0,
  fout int not null default 0,
  laatst timestamptz,
  primary key (catechisant_id, les, vraag)
);

create table if not exists extra (
  id uuid primary key default gen_random_uuid(),
  les int not null,
  titel text not null,
  bron text,
  tekst text,
  link text,
  volgorde int not null default 0,
  aangemaakt timestamptz not null default now()
);

create or replace function tel_op(p_cat uuid, p_les int, p_tab text, p_secs int)
returns void language sql as $$
  insert into activiteit (catechisant_id, les, dag, tab, secs)
  values (p_cat, p_les, (now() at time zone 'Europe/Amsterdam')::date, p_tab, p_secs)
  on conflict (catechisant_id, les, dag, tab)
  do update set secs = activiteit.secs + excluded.secs;
$$;

-- Alleen de server (service role) mag erbij; niemand rechtstreeks via de browser.
alter table catechisanten enable row level security;
alter table antwoorden enable row level security;
alter table activiteit enable row level security;
alter table herhaling enable row level security;
alter table extra enable row level security;
