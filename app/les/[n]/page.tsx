import { notFound, redirect } from "next/navigation";
import { huidige } from "@/lib/auth";
import { db } from "@/lib/db";
import { LESSEN } from "@/lib/content";
import LesClient from "@/components/LesClient";
import { uitloggen } from "@/app/actions";
import Link from "next/link";
import { vandaag } from "@/lib/datum";

export const dynamic = "force-dynamic";
export default async function LesPagina({ params }: { params: { n: string } }) {
  const c = await huidige();
  if (!c) redirect("/");
  const les = LESSEN[Number(params.n)];
  if (!les) notFound();
  const [a, e, h] = await Promise.all([
    db().from("antwoorden").select("vraag,antwoord,zelf").match({ catechisant_id: c.id, les: les.nr }),
    db().from("extra").select("id,titel,bron,tekst,link").eq("les", les.nr).order("volgorde").order("aangemaakt"),
    db().from("herhaling").select("vraag").match({ catechisant_id: c.id }).lte("volgende", vandaag()),
  ]);
  const teHerhalen = h.data?.length ?? 0;
  return (
    <div className="wrap">
      <header className="top">
        <div>
          <div className="kicker">Belijdeniscatechese · Les {les.nr}</div>
          <h1>{les.titel}</h1>
          <div className="bijbel">Bijbel: {les.bijbel}</div>
        </div>
        <form action={uitloggen}><button className="klein" type="submit">Uitloggen</button></form>
      </header>
      <p className="note" style={{ margin: "4px 0" }}>Welkom, {c.naam}.</p>
      {teHerhalen > 0 && (
        <div className="card" style={{ background: "#f6efe2" }}>
          Er {teHerhalen === 1 ? "staat 1 onderdeel" : `staan ${teHerhalen} onderdelen`} klaar om te herhalen. <Link href="/onthouden">Nu herhalen →</Link>
        </div>
      )}
      <LesClient les={les} opgeslagen={a.data ?? []} extra={e.data ?? []} />
    </div>
  );
}
