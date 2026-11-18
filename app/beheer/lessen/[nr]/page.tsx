import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { isBeheerder } from "@/lib/auth";
import { LESSEN } from "@/lib/content";
import { haalLesinhoud, metLesinhoud } from "@/lib/lesinhoud";
import LesEditor from "@/components/LesEditor";

export const dynamic = "force-dynamic";
export default async function LesBewerken({ params }: { params: { nr: string } }) {
  if (!isBeheerder()) redirect("/beheer");
  const basisLes = LESSEN[Number(params.nr)];
  if (!basisLes) notFound();
  const inhoud = await haalLesinhoud(basisLes.nr);
  const les = metLesinhoud(basisLes, inhoud);

  return (
    <div className="wrap breed">
      <header className="top">
        <div>
          <div className="kicker">Belijdeniscatechese · Beheer</div>
          <h1>{les.optioneel ? "Optionele les" : `Les ${les.nr}`}: {les.titel}</h1>
        </div>
        <Link className="knop klein" href="/beheer/lessen">← Alle lessen</Link>
      </header>
      <p className="note">Wijzigingen zijn direct zichtbaar voor catechisanten zodra je op Opslaan klikt. Vragen, kernpunten en de meerkeuze-oefening zijn hier nog niet te bewerken.</p>
      <LesEditor lesNr={les.nr} initieleHtml={les.html} initieleBijlezenTitel={les.bijlezenTitel ?? ""} initieleBijlezenHtml={les.bijlezenHtml ?? ""} />
    </div>
  );
}
