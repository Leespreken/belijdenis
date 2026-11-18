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
Een les staat in `lib/content.ts` (tekst, vragen, kernpunten, invuloefening, meerkeuze-opties).
Extra materiaal (krantenartikel e.d.) voeg je zonder code toe op `/beheer`.

## Lesteksten en vragen bewerken zonder code (`/beheer/lessen`)
De lestekst én de vragen (vraagtekst, modelantwoord, kernpunten, invuloefening, meerkeuze-opties) zijn
vanaf nu bewerkbaar in de browser, zonder dat daar een nieuwe versie van de site voor nodig is.
Eenmalig nodig: voer de bijgewerkte `supabase/schema.sql` opnieuw uit in de Supabase *SQL Editor*
(dit voegt alleen nieuwe tabellen/kolommen toe; bestaande gegevens blijven ongemoeid).
Ga daarna naar `/beheer/lessen`, klik op **"Vul ontbrekende lesteksten"** om de huidige teksten als
startpunt in de database te zetten, open een les om de lestekst te bewerken (eenvoudige
tekstverwerker/WYSIWYG), en klik op **"Vragen bewerken"** om per vraag alle onderdelen aan te passen.

Bij elke vraag kun je ook:
- **Actief/inactief zetten** — een uitgeschakelde vraag blijft bestaan met hetzelfde nummer en de al
  opgeslagen antwoorden blijven intact, maar de vraag verschijnt niet meer bij de catechisant. Zo kun je
  bijvoorbeeld alleen de vragen 1, 4, 5 en 8 laten staan zonder de nummering aan te passen.
- **Volgorde wijzigen** — een los getal (lager = eerder in de lijst) dat onafhankelijk is van het
  vraagnummer.
- **"+ Nieuwe vraag toevoegen"** (onderaan de vragenlijst van een les) maakt een vraag aan met een vers
  nummer, die je direct kunt invullen.

Echt verwijderen van een vraag kan nog niet via het scherm (dat zou de al opgeslagen antwoorden van
catechisanten kunnen wezen); gebruik in plaats daarvan de aan/uit-schakelaar. De lestitel, Bijbelverwijzing
en overige verwijzingen (HC/NGB/DL/KB) zijn nog niet via het scherm te wijzigen.

## Extra materiaal: PDF uploaden of een link
Bij "Extra materiaal bij een les" op `/beheer` kun je een PDF rechtstreeks uploaden (max 20 MB) —
die komt dan in Supabase Storage terecht (bucket `bijlagen`, openbaar leesbaar via een onraadbare
bestandsnaam) en verschijnt bij de les als "📎 Bijlage openen". Je kunt in plaats daarvan ook een
link naar een al online staand artikel of PDF invullen. Eenmalig nodig: voer de bijgewerkte
`supabase/schema.sql` opnieuw uit (maakt de opslagbucket aan).

## Zelf inschrijven, huiswerk en berichten
Catechisanten kunnen zich nu ook zelf inschrijven via `/inschrijven` (naam, e-mail, telefoonnummer);
ze krijgen daarna automatisch een code, net als wanneer jij ze handmatig toevoegt op `/beheer`.

Op `/beheer` kun je:
- **Huiswerk geven**: per les aanvinken wat je opgeeft — lezen van de les, het maken van specifieke
  vragen, en/of het leren van specifieke vragen (die laatste komen er dan direct bij in "Onthouden").
  Dit geldt voor alle catechisanten of voor één persoon. De catechisant ziet dit huiswerk met
  voortgang bovenaan `/lessen`.
- **Een bericht sturen**: een los berichtje of artikeltje naar iemand sturen, per **e-mail**
  (automatisch, via de dienst Resend) of door een kant-en-klaar **WhatsApp**-bericht te openen
  (jij verstuurt het zelf met één klik — er is geen WhatsApp-koppeling nodig).

**Eenmalig nodig voor e-mail:** maak een gratis account op [resend.com](https://resend.com), maak
daar een API-sleutel aan, en zet die in Vercel (Project → Settings → Environment Variables) als
`RESEND_API_KEY`. Optioneel: `RESEND_FROM` (bijv. `"Belijdeniscatechese <noreply@jouwdomein.nl>"`
nadat je dat domein bij Resend hebt geverifieerd — zonder eigen domein wordt een Resend-testadres
gebruikt, wat prima werkt maar er minder persoonlijk uitziet).
