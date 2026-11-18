import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { isBeheerder } from "@/lib/auth";
import { LESSEN } from "@/lib/content";
import { haalVraaginhoud, volledigeVragenlijst } from "@/lib/vraaginhoud";
import VraagEditor from "@/components/VraagEditor";
import NieuweVraagKnop from "@/components/NieuweVraagKnop";

export const dynamic = "force-dynamic";
export default async function VragenBewerken({ params }: { params: { nr: string } }) {
  if (!isBeheerder()) redirect("/beheer");
  const basisLes = LESSEN[Number(params.nr)];
  if (!basisLes) notFound();
  const overrides = await haalVraaginhoud(basisLes.nr);
  const vragen = volledigeVragenlijst(basisLes, overrides);

  return (
    <div className="wrap breed">
      <header className="top">
        <div>
          <div className="kicker">Belijdeniscatechese · Beheer</div>
          <h1>Vragen: {basisLes.titel}</h1>
        </div>
        <Link className="knop klein" href={`/beheer/lessen/${basisLes.nr}`}>← Lestekst</Link>
      </header>
      <p className="note">
        Klik een vraag open om de tekst, het antwoord, de kernpunten, de invuloefening en de meerkeuze-opties te bewerken.
        Met &quot;Actief&quot; schakel je een vraag uit of weer aan — het vraagnummer blijft dan hetzelfde. Met &quot;Volgorde&quot;
        bepaal je de plaats in de lijst. Elke vraag slaat apart op.
      </p>
      {vragen.length === 0 && <p className="note">Deze les heeft geen vragen.</p>}
      {vragen.map((v) => (
        <VraagEditor key={v.vraag.id} lesNr={basisLes.nr} vraag={v.vraag} actief={v.actief} volgorde={v.volgorde} nieuw={v.toegevoegd && v.vraag.tekst === "Nieuwe vraag"} />
      ))}
      <NieuweVraagKnop lesNr={basisLes.nr} />
    </div>
  );
}
