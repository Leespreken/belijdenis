import Link from "next/link";
import { isBeheerder } from "@/lib/auth";
import { LESSEN } from "@/lib/content";
import { haalAlleLesinhoud } from "@/lib/lesinhoud";
import { vulOntbrekendeLesteksten } from "@/app/actions";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";
export default async function LessenBeheer() {
  if (!isBeheerder()) redirect("/beheer");
  const lessen = Object.values(LESSEN).sort((a, b) => a.nr - b.nr);
  const inhoud = await haalAlleLesinhoud();

  return (
    <div className="wrap breed">
      <header className="top">
        <div><div className="kicker">Belijdeniscatechese · Beheer</div><h1>Lesteksten bewerken</h1></div>
        <Link className="knop klein" href="/beheer">← Overzicht</Link>
      </header>

      {lessen.some((l) => !inhoud.has(l.nr)) && (
        <div className="card" style={{ background: "#f6efe2" }}>
          <p style={{ marginTop: 0 }}>Nog niet elke les heeft een eigen, bewerkbare tekst in de database staan. Klik hieronder om de ontbrekende lessen te vullen met de tekst die nu op de site staat (bestaande, al bewerkte lesteksten blijven ongemoeid).</p>
          <form action={vulOntbrekendeLesteksten}><button className="primary" type="submit">Vul ontbrekende lesteksten</button></form>
        </div>
      )}

      <div className="lesgrid">
        {lessen.map((les) => (
          <Link key={les.nr} href={`/beheer/lessen/${les.nr}`} className="leskaart">
            <span className="nr">{les.optioneel ? "✻" : les.nr}</span>
            <span className="info">
              <span className="titel">{les.titel}</span>
              <span className="sub">{inhoud.has(les.nr) ? "bewerkt in de database" : "nog de oorspronkelijke tekst uit de code"}</span>
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
