import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { isBeheerder } from "@/lib/auth";
import { LESSEN } from "@/lib/content";
import { haalVraaginhoud, metVraaginhoud } from "@/lib/vraaginhoud";
import VraagEditor from "@/components/VraagEditor";

export const dynamic = "force-dynamic";
export default async function VragenBewerken({ params }: { params: { nr: string } }) {
  if (!isBeheerder()) redirect("/beheer");
  const basisLes = LESSEN[Number(params.nr)];
  if (!basisLes) notFound();
  const overrides = await haalVraaginhoud(basisLes.nr);
  const les = metVraaginhoud(basisLes, overrides);

  return (
    <div className="wrap breed">
      <header className="top">
        <div>
          <div className="kicker">Belijdeniscatechese · Beheer</div>
          <h1>Vragen: {les.titel}</h1>
        </div>
        <Link className="knop klein" href={`/beheer/lessen/${les.nr}`}>← Lestekst</Link>
      </header>
      <p className="note">Klik een vraag open om de tekst, het antwoord, de kernpunten, de invuloefening en de meerkeuze-opties te bewerken. Elke vraag slaat apart op.</p>
      {les.vragen.length === 0 && <p className="note">Deze les heeft geen vragen.</p>}
      {les.vragen.map((v) => <VraagEditor key={v.id} lesNr={les.nr} vraag={v} />)}
    </div>
  );
}
