-- Plak dit in Supabase > SQL Editor en klik op Run.

create table if not exists catechisanten (
  id uuid primary key default gen_random_uuid(),
  naam text not null,
  code text not null unique,
  email text,
  telefoon text,
  aangemaakt timestamptz not null default now()
);
alter table catechisanten add column if not exists email text;
alter table catechisanten add column if not exists telefoon text;

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

create table if not exists lesinhoud (
  les int primary key,
  html text not null,
  bijlezen_titel text,
  bijlezen_html text,
  bijgewerkt timestamptz not null default now()
);

create table if not exists vraaginhoud (
  les int not null,
  vraag int not null,
  tekst text not null,
  antwoord text not null,
  kern jsonb not null default '[]',
  need int not null default 0,
  invul text,
  reproductie_goed text,
  reproductie_fout1 text,
  reproductie_fout2 text,
  open boolean not null default false,
  actief boolean not null default true,
  volgorde int,
  toegevoegd boolean not null default false,
  bijgewerkt timestamptz not null default now(),
  primary key (les, vraag)
);

-- Bestond de tabel al? Dan deze regels los uitvoeren (hierboven staan ze ook,
-- maar "create table if not exists" voegt geen kolommen toe aan een tabel die er al is):
alter table vraaginhoud add column if not exists open boolean not null default false;
alter table vraaginhoud add column if not exists actief boolean not null default true;
alter table vraaginhoud add column if not exists volgorde int;
alter table vraaginhoud add column if not exists toegevoegd boolean not null default false;

create table if not exists huiswerk (
  id uuid primary key default gen_random_uuid(),
  catechisant_id uuid not null references catechisanten(id) on delete cascade,
  les int not null,
  lezen boolean not null default false,
  vragen int[] not null default '{}',
  leren int[] not null default '{}',
  bericht text,
  aangemaakt timestamptz not null default now()
);
alter table huiswerk enable row level security;

-- Was deze tabel er al? Dan dit los uitvoeren om dubbele rijen (per catechisant+les) op te
-- ruimen vóór de unieke index hieronder wordt gezet (de nieuwste rij per combinatie blijft staan):
delete from huiswerk a using huiswerk b
  where a.catechisant_id = b.catechisant_id and a.les = b.les and a.aangemaakt < b.aangemaakt;
create unique index if not exists huiswerk_cat_les_uniek on huiswerk (catechisant_id, les);

-- Opslag voor geüploade bijlagen (bijv. PDF's bij "Extra materiaal").
insert into storage.buckets (id, name, public)
values ('bijlagen', 'bijlagen', true)
on conflict (id) do nothing;

drop policy if exists "bijlagen zijn openbaar leesbaar" on storage.objects;
create policy "bijlagen zijn openbaar leesbaar" on storage.objects
  for select using (bucket_id = 'bijlagen');

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
alter table lesinhoud enable row level security;
alter table vraaginhoud enable row level security;
