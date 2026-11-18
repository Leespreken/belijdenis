import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { db } from "@/lib/db";
import { isBeheerder } from "@/lib/auth";
import { LESSEN } from "@/lib/content";
import { eenInzet, min } from "@/lib/inzet";
import { verwijderCatechisant } from "@/app/actions";
import { haalAlleVraaginhoud, metVraaginhoud } from "@/lib/vraaginhoud";

export const dynamic = "force-dynamic";
const zl = ["Moet ik oefenen", "Gedeeltelijk", "Wist ik"];

export default async function Detail({ params }: { params: { id: string } }) {
  if (!isBeheerder()) redirect("/beheer");
  const { data: c } = await db().from("catechisanten").select("id,naam,code").eq("id", params.id).maybeSingle();
  if (!c) notFound();
  const [act, ant, overridesPerLes] = await Promise.all([
    db().from("activiteit").select("les,dag,tab,secs").eq("catechisant_id", c.id).order("dag", { ascending: false }),
    db().from("antwoorden").select("*").eq("catechisant_id", c.id).order("les").order("vraag"),
    haalAlleVraaginhoud(),
  ]);
  const lessenMap = new Map(
    Object.values(LESSEN).map((l) => [l.nr, metVraaginhoud(l, overridesPerLes.get(l.nr) ?? new Map())])
  );
  const perDag = new Map<string, Record<string, number>>();
  (act.data ?? []).forEach((a) => { const m = perDag.get(a.dag) ?? {}; m[a.tab] = (m[a.tab] ?? 0) + a.secs; perDag.set(a.dag, m); });

  return (
    <div className="wrap">
      <header className="top"><div><div className="kicker">Catechisant</div><h1>{c.naam}</h1><div className="bijbel">Code: {c.code}</div></div><Link className="knop klein" href="/beheer">← Overzicht</Link></header>

      <div className="card">
        <h3 style={{ marginTop: 0 }}>Tijd per dag</h3>
        <div className="tablewrap"><table>
          <thead><tr><th>Dag</th><th>Lezen</th><th>Vragen</th><th>Extra</th><th>Herhalen</th></tr></thead>
          <tbody>{[...perDag.entries()].map(([d, m]) => (
            <tr key={d}><td>{new Date(d + "T12:00:00Z").toLocaleDateString("nl-NL", { weekday: "short", day: "numeric", month: "short" })}</td>
              <td>{min(m.lezen ?? 0)}</td><td>{min(m.vragen ?? 0)}</td><td>{min(m.extra ?? 0)}</td><td>{min(m.onthouden ?? 0)}</td></tr>
          ))}</tbody>
        </table></div>
        {!perDag.size && <p className="note">Nog niet actief geweest.</p>}
      </div>

      <div className="card">
        <h3 style={{ marginTop: 0 }}>Antwoorden</h3>
        {(ant.data ?? []).map((a) => {
          const v = lessenMap.get(a.les)?.vragen.find((x) => x.id === a.vraag); if (!v) return null;
          const e = eenInzet(a, !!v.open);
          return (
            <div key={a.les + "-" + a.vraag}>
              <div style={{ fontWeight: 600 }}>Les {a.les} · {v.open ? "Nadenkvraag" : "Vraag " + a.vraag}: {v.tekst}</div>
              <div className="ans">{a.antwoord || "(niets ingevuld)"}</div>
              <div className="note" style={{ marginBottom: 12 }}>
                {a.geplakt ? <span className="badge bad">geplakt</span> : <span className="badge ok">zelf getypt</span>}{" "}
                {a.getypt} van {a.tekens} tekens getypt · {min(a.secs)} voor het antwoord · poging {a.poging}
                {!v.open && ` · kernpunten ${a.kern}/${a.kern_totaal}`} · zelf: {a.zelf == null ? "–" : zl[a.zelf]} · {e === "zelf" ? "zelf actief" : e === "matig" ? "matig" : "doorgeklikt"}
              </div>
            </div>
          );
        })}
        {!(ant.data ?? []).length && <p className="note">Nog geen vragen gedaan.</p>}
      </div>

      <details className="more"><summary>Catechisant verwijderen</summary><p className="note">Dit wist de catechisant en alle bijbehorende gegevens. Dit kan niet ongedaan worden gemaakt.</p><form action={verwijderCatechisant}><input type="hidden" name="id" value={c.id} /><button className="gevaar klein" type="submit">Ja, definitief verwijderen</button></form></details>
    </div>
  );
}
