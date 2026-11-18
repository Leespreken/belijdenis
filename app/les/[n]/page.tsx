import { notFound, redirect } from "next/navigation";
import { huidige } from "@/lib/auth";
import { db } from "@/lib/db";
import { LESSEN } from "@/lib/content";
import { haalLesinhoud, metLesinhoud } from "@/lib/lesinhoud";
import { haalVraaginhoud, metVraaginhoud } from "@/lib/vraaginhoud";
import LesClient from "@/components/LesClient";
import { uitloggen } from "@/app/actions";
import Link from "next/link";
import { vandaag } from "@/lib/datum";

export const dynamic = "force-dynamic";
export default async function LesPagina({ params }: { params: { n: string } }) {
  const c = await huidige();
  if (!c) redirect("/");
  const basisLes = LESSEN[Number(params.n)];
  if (!basisLes) notFound();
  const [a, e, h, inhoud, vraagOverrides] = await Promise.all([
    db().from("antwoorden").select("vraag,antwoord,zelf").match({ catechisant_id: c.id, les: basisLes.nr }),
    db().from("extra").select("id,titel,bron,tekst,link").eq("les", basisLes.nr).order("volgorde").order("aangemaakt"),
    db().from("herhaling").select("vraag").match({ catechisant_id: c.id }).lte("volgende", vandaag()),
    haalLesinhoud(basisLes.nr),
    haalVraaginhoud(basisLes.nr),
  ]);
  const les = metVraaginhoud(metLesinhoud(basisLes, inhoud), vraagOverrides);
  const teHerhalen = h.data?.length ?? 0;
  const volgorde = Object.values(LESSEN).sort((x, y) => x.nr - y.nr);
  const idx = volgorde.findIndex((x) => x.nr === les.nr);
  const vorige = idx > 0 ? volgorde[idx - 1] : undefined;
  const volgende = idx >= 0 && idx < volgorde.length - 1 ? volgorde[idx + 1] : undefined;
  return (
    <div className="wrap">
      <header className="top">
        <div>
          <div className="kicker">Belijdeniscatechese · {les.optioneel ? "Optionele les" : `Les ${les.nr}`}</div>
          <h1>{les.titel}</h1>
          <div className="bijbel">{les.bijbel}</div>
          {les.overig && les.overig.length > 0 && <div className="overig">{les.overig.join(" · ")}</div>}
        </div>
        <form action={uitloggen}><button className="klein" type="submit">Uitloggen</button></form>
      </header>
      <p className="note" style={{ margin: "4px 0" }}>Welkom, {c.naam}. <Link href="/lessen">Alle lessen</Link></p>
      {teHerhalen > 0 && (
        <div className="card" style={{ background: "#f6efe2" }}>
          Er {teHerhalen === 1 ? "staat 1 onderdeel" : `staan ${teHerhalen} onderdelen`} klaar om te herhalen. <Link href="/onthouden">Nu herhalen →</Link>
        </div>
      )}
      <LesClient les={les} opgeslagen={a.data ?? []} extra={e.data ?? []}
        vorige={vorige && { nr: vorige.nr, titel: vorige.titel }} volgende={volgende && { nr: volgende.nr, titel: volgende.titel }} />
    </div>
  );
}
