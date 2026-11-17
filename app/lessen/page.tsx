import { redirect } from "next/navigation";
import Link from "next/link";
import { huidige } from "@/lib/auth";
import { db } from "@/lib/db";
import { LESSEN } from "@/lib/content";
import { uitloggen } from "@/app/actions";
import { vandaag } from "@/lib/datum";

export const dynamic = "force-dynamic";
export default async function Lessen() {
  const c = await huidige();
  if (!c) redirect("/");

  const lessen = Object.values(LESSEN).sort((a, b) => a.nr - b.nr);
  const [a, h] = await Promise.all([
    db().from("antwoorden").select("les,vraag").eq("catechisant_id", c.id),
    db().from("herhaling").select("vraag").eq("catechisant_id", c.id).lte("volgende", vandaag()),
  ]);
  const gedaanPerLes = new Map<number, number>();
  (a.data ?? []).forEach((r) => gedaanPerLes.set(r.les, (gedaanPerLes.get(r.les) ?? 0) + 1));
  const teHerhalen = h.data?.length ?? 0;

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

      <p className="note">Kies een les om te lezen en te oefenen.</p>
      <div className="lesgrid">
        {lessen.map((les) => {
          const gedaan = gedaanPerLes.get(les.nr) ?? 0;
          const klaar = gedaan >= les.vragen.length && les.vragen.length > 0;
          return (
            <Link key={les.nr} href={`/les/${les.nr}`} className={"leskaart" + (klaar ? " klaar" : "")}>
              <span className="nr">{les.optioneel ? "✻" : les.nr}</span>
              <span className="info">
                <span className="titel">{les.titel}</span>
                <span className="sub">{les.bijbel}{les.vragen.length > 0 ? ` · ${gedaan} van ${les.vragen.length} onderdelen gedaan` : ""}</span>
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
