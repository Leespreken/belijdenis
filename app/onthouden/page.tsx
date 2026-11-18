import { redirect } from "next/navigation";
import Link from "next/link";
import { huidige } from "@/lib/auth";
import { db } from "@/lib/db";
import { LESSEN } from "@/lib/content";
import { vandaag } from "@/lib/datum";
import { haalVraaginhoud, metVraaginhoud } from "@/lib/vraaginhoud";
import Herhaal, { Kaart } from "@/components/Herhaal";

export const dynamic = "force-dynamic";
export default async function Onthouden({ searchParams }: { searchParams: { alles?: string } }) {
  const c = await huidige();
  if (!c) redirect("/");
  let q = db().from("herhaling").select("les,vraag,volgende").eq("catechisant_id", c.id).order("volgende");
  if (!searchParams.alles) q = q.lte("volgende", vandaag());
  const { data } = await q;
  const lesNrs = [...new Set((data ?? []).map((r) => r.les))];
  const overridesPerLes = new Map(await Promise.all(lesNrs.map(async (nr) => [nr, await haalVraaginhoud(nr)] as const)));
  const kaarten: Kaart[] = (data ?? []).flatMap((r) => {
    const basis = LESSEN[r.les];
    if (!basis) return [];
    const les = metVraaginhoud(basis, overridesPerLes.get(r.les) ?? new Map());
    const v = les.vragen.find((x) => x.id === r.vraag);
    return v?.invul ? [{ les: r.les, vraag: r.vraag, tekst: v.tekst, invul: v.invul }] : [];
  }).slice(0, 12);
  const eerste = kaarten[0]?.les ?? 3;
  return (
    <div className="wrap">
      <header className="top"><div><div className="kicker">Belijdeniscatechese Bethlehemkerk</div><h1>Onthouden</h1><div className="bijbel">Een paar minuten per dag houdt het vast.</div></div>
        <Link className="knop klein" href={`/les/${eerste}`}>← Terug</Link></header>
      <Herhaal kaarten={kaarten} leesLes={eerste} />
      {!searchParams.alles && <p className="note"><Link href="/onthouden?alles=1">Toch alles oefenen wat ik al gedaan heb</Link></p>}
    </div>
  );
}
