import { redirect } from "next/navigation";
import Link from "next/link";
import { huidige } from "@/lib/auth";
import { db } from "@/lib/db";
import { LESSEN, telbareVragen } from "@/lib/content";
import { uitloggen } from "@/app/actions";
import { vandaag } from "@/lib/datum";
import { haalAlleVraaginhoud, metVraaginhoud } from "@/lib/vraaginhoud";
import { haalAlleLesinhoud, metLesinhoud } from "@/lib/lesinhoud";
import { verwachteLeestijd, leesStatus } from "@/lib/leesinzet";
import { haalHuiswerk } from "@/lib/huiswerk";

export const dynamic = "force-dynamic";
export default async function Lessen() {
  const c = await huidige();
  if (!c) redirect("/");

  const [a, h, overridesPerLes, lesinhoudPerLes, huiswerk, lezenAct, herhalingAlles] = await Promise.all([
    db().from("antwoorden").select("les,vraag").eq("catechisant_id", c.id),
    db().from("herhaling").select("vraag").eq("catechisant_id", c.id).lte("volgende", vandaag()),
    haalAlleVraaginhoud(),
    haalAlleLesinhoud(),
    haalHuiswerk(c.id),
    db().from("activiteit").select("les,secs").eq("catechisant_id", c.id).eq("tab", "lezen"),
    db().from("herhaling").select("les,vraag").eq("catechisant_id", c.id),
  ]);
  const lessen = Object.values(LESSEN)
    .map((l) => metVraaginhoud(l, overridesPerLes.get(l.nr) ?? new Map()))
    .sort((a, b) => a.nr - b.nr);
  const openVragen = new Map<number, Set<number>>();
  lessen.forEach((l) => openVragen.set(l.nr, new Set(l.vragen.filter((v) => v.open).map((v) => v.id))));
  const gedaanPerLes = new Map<number, number>();
  const gedaanVragen = new Set<string>();
  (a.data ?? []).forEach((r) => {
    gedaanVragen.add(r.les + "-" + r.vraag);
    if (openVragen.get(r.les)?.has(r.vraag)) return;
    gedaanPerLes.set(r.les, (gedaanPerLes.get(r.les) ?? 0) + 1);
  });
  const teHerhalen = h.data?.length ?? 0;
  const inHerhaling = new Set((herhalingAlles.data ?? []).map((r) => r.les + "-" + r.vraag));
  const lezenSecsPerLes = new Map<number, number>();
  (lezenAct.data ?? []).forEach((r) => lezenSecsPerLes.set(r.les, (lezenSecsPerLes.get(r.les) ?? 0) + r.secs));

  return (
    <div className="wrap">
      <header className="top">
        <div><div className="kicker">Belijdeniscatechese Bethlehemkerk</div><h1>Welkom, {c.naam}</h1></div>
        <form action={uitloggen}><button className="klein" type="submit">Uitloggen</button></form>
      </header>

      {teHerhalen > 0 && (
        <div className="card" style={{ background: "#f6efe2" }}>
          Er {teHerhalen === 1 ? "staat 1 onderdeel" : `staan ${teHerhalen} onderdelen`} klaar om te herhalen. <Link href="/onthouden">Nu herhalen →</Link>
        </div>
      )}

      {huiswerk.length > 0 && (
        <div className="card">
          <h3 style={{ marginTop: 0 }}>Huiswerk</h3>
          {huiswerk.map((hw) => {
            const les = lessen.find((l) => l.nr === hw.les);
            if (!les) return null;
            const leesStat = hw.lezen ? leesStatus(lezenSecsPerLes.get(hw.les) ?? 0, verwachteLeestijd(metLesinhoud(les, lesinhoudPerLes.get(hw.les)).html)) : null;
            const vragenGedaan = hw.vragen.filter((v) => gedaanVragen.has(hw.les + "-" + v)).length;
            const lerenGedaan = hw.leren.filter((v) => inHerhaling.has(hw.les + "-" + v)).length;
            return (
              <div key={hw.id} style={{ marginBottom: 12 }}>
                <div style={{ fontWeight: 600 }}>Les {hw.les}: {les.titel}</div>
                <div className="note">
                  {hw.lezen && leesStat && <>Lezen: <span className={"badge " + leesStat.kleur}>{leesStat.tekst}</span>{" "}</>}
                  {hw.vragen.length > 0 && <>Maken: {vragenGedaan} van {hw.vragen.length} gedaan{" "}</>}
                  {hw.leren.length > 0 && <>Leren: {lerenGedaan} van {hw.leren.length} in Onthouden</>}
                </div>
                {hw.bericht && <p style={{ marginTop: 4 }}>{hw.bericht}</p>}
                <Link className="knop klein" href={`/les/${hw.les}`} style={{ marginTop: 6, display: "inline-block" }}>Naar de les →</Link>
              </div>
            );
          })}
        </div>
      )}

      <p className="note">Kies een les om te lezen en te oefenen.</p>
      <div className="lesgrid">
        {lessen.map((les) => {
          const totaal = telbareVragen(les).length;
          const gedaan = gedaanPerLes.get(les.nr) ?? 0;
          const klaar = gedaan >= totaal && totaal > 0;
          return (
            <Link key={les.nr} href={`/les/${les.nr}`} className={"leskaart" + (klaar ? " klaar" : "")}>
              <span className="nr">{les.optioneel ? "✻" : les.nr}</span>
              <span className="info">
                <span className="titel">{les.titel}</span>
                <span className="sub">{les.bijbel}{totaal > 0 ? ` · ${gedaan} van ${totaal} vragen gedaan` : ""}</span>
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
