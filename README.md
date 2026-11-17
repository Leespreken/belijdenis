# Belijdeniscatechisatie.nl

Leer- en oefenomgeving bij de belijdeniscatechese (nu: les 3, *De belijdenisgeschriften*).

## Wat het doet
- Catechisanten loggen in met een **persoonlijke code** (geen account nodig).
- Les lezen, vragen beantwoorden (eerst zelf typen, dan het antwoord uit de les bekijken), extra materiaal lezen.
- **Onthouden:** invuloefening die vragen steeds terugbrengt na 1, 3, 7, 14 en 30 dagen (goed = langer wachten, fout = morgen weer).
- **Voor jou** (`/beheer`): per catechisant de actieve minuten (alleen als de pagina open is en er iets gebeurt), of de antwoorden zelf getypt of geplakt zijn, kernpunten, herhalingen, alle antwoorden, en extra materiaal toevoegen.

## Installeren (eenmalig)
1. **Supabase:** maak een nieuw project (of gebruik een bestaand project). Open *SQL Editor*, plak de inhoud van `supabase/schema.sql` en klik *Run*.
2. **GitHub + Vercel:** zet deze map in een nieuwe GitHub-repository en importeer die in Vercel.
3. **Instellingen in Vercel** (*Settings → Environment Variables*), zie `.env.example`:
   - `SUPABASE_URL` en `SUPABASE_SERVICE_ROLE_KEY` (Supabase: *Project Settings → API*; de service-role-sleutel is geheim)
   - `ADMIN_PASSWORD`: je wachtwoord voor `/beheer`
   - `SESSION_SECRET`: lange willekeurige tekst
4. **Domein:** in Vercel *Settings → Domains* belijdeniscatechisatie.nl toevoegen en de DNS-instructies volgen.
5. Ga naar `https://belijdeniscatechisatie.nl/beheer`, log in, voeg de catechisanten toe en geef iedereen zijn eigen code.

## Beveiliging
De catechisanten hebben alleen een code. De database is alleen bereikbaar via de server (de tabellen hebben geen openbare toegang). De pagina's vragen zoekmachines niet te indexeren. Er worden alleen voornaam, antwoorden en tijden opgeslagen.

## Een nieuwe les toevoegen
Een les staat in `lib/content.ts` (tekst, vragen, kernpunten, invuloefening). Les 3 is het voorbeeld.
Extra materiaal (krantenartikel e.d.) voeg je zonder code toe op `/beheer`.
