import Link from "next/link";
import { db } from "@/lib/db";
import { isBeheerder } from "@/lib/auth";
import { LESSEN } from "@/lib/content";
import { totaalInzet, min, AntwoordRij } from "@/lib/inzet";
import BeheerLogin from "@/components/BeheerLogin";
import { beheerUit, nieuweCatechisant, nieuweExtra, verwijderExtra } from "@/app/actions";

export const dynamic = "force-dynamic";
const dagTxt = (d: string) => new Date(d + "T12:00:00Z").toLocaleDateString("nl-NL", { day: "numeric", month: "short" });

export default async function Beheer() {
  if (!isBeheerder()) return <div className="wrap"><header className="top"><div><div className="kicker">Belijdeniscatechese Bethlehemkerk</div><h1>Beheer</h1></div></header><BeheerLogin /></div>;

  const [cs, act, ant, her, ext] = await Promise.all([
    db().from("catechisanten").select("id,naam,code").order("naam"),
    db().from("activiteit").select("catechisant_id,les,dag,tab,secs"),
    db().from("antwoorden").select("*"),
    db().from("herhaling").select("catechisant_id,goed,fout"),
    db().from("extra").select("id,les,titel,bron").order("les").order("aangemaakt"),
  ]);
  const lessen = Object.values(LESSEN).sort((a, b) => a.nr - b.nr);
  const openVraag = (les: number, v: number) => !!LESSEN[les]?.vragen.find((x) => x.id === v)?.open;
  const aantalVragen = lessen.reduce((s, l) => s + l.vragen.length, 0);

  const rijen = (cs.data ?? []).map((c) => {
    const a = (act.data ?? []).filter((x) => x.catechisant_id === c.id);
    const totaal = a.reduce((s, x) => s + x.secs, 0);
    const vragenSecs = a.filter((x) => x.tab === "vragen").reduce((s, x) => s + x.secs, 0);
    const laatst = a.map((x) => x.dag).sort().pop();
    const an = (ant.data ?? []).filter((x) => x.catechisant_id === c.id) as (AntwoordRij & { les: number })[];
    const zelf = an.filter((x) => !x.geplakt && x.tekens >= 6 && x.getypt >= x.tekens * 0.5).length;
    const geplakt = an.filter((x) => x.geplakt).length;
    const h = (her.data ?? []).filter((x) => x.catechisant_id === c.id);
    return { c, totaal, vragenSecs, laatst, gedaan: an.length, zelf, geplakt, goed: h.reduce((s, x) => s + x.goed, 0), fout: h.reduce((s, x) => s + x.fout, 0), inzet: totaalInzet(an, openVraag) };
  });

  return (
    <div className="wrap breed">
      <header className="top"><div><div className="kicker">Belijdeniscatechese Bethlehemkerk</div><h1>Overzicht catechisanten</h1></div>
        <form action={beheerUit}><button className="klein" type="submit">Uitloggen</button></form></header>

      <div className="card">
        <div className="tablewrap">
          <table>
            <thead><tr><th>Naam</th><th>Code</th><th>Totaal bezig</th><th>Waarvan vragen</th><th>Laatst actief</th><th>Vragen gedaan</th><th>Zelf getypt</th><th>Geplakt</th><th>Herhaald (goed/fout)</th><th>Inzet</th></tr></thead>
            <tbody>
              {rijen.map((r) => (
                <tr key={r.c.id}>
                  <td><Link href={`/beheer/${r.c.id}`}>{r.c.naam}</Link></td>
                  <td><code>{r.c.code}</code></td>
                  <td>{min(r.totaal)}</td><td>{min(r.vragenSecs)}</td>
                  <td>{r.laatst ? dagTxt(r.laatst) : "–"}</td>
                  <td>{r.gedaan} / {aantalVragen}</td>
                  <td>{r.zelf} / {r.gedaan}</td>
                  <td>{r.geplakt ? <span className="badge bad">{r.geplakt}×</span> : "–"}</td>
                  <td>{r.goed} / {r.fout}</td>
                  <td><span className={"badge " + r.inzet.kleur}>{r.inzet.tekst}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!rijen.length && <p className="note">Nog geen catechisanten. Voeg ze hieronder toe.</p>}
        <p className="note">“Totaal bezig” telt alleen seconden waarin de pagina open en zichtbaar was en er iets gedaan werd (typen, klikken, scrollen). “Zelf getypt” betekent dat het antwoord echt is ingetypt en niet geplakt. “Inzet” is een indicatie, geen oordeel: een aanleiding voor een gesprek.</p>
      </div>

      <div className="grid2">
        <form action={nieuweCatechisant} className="card">
          <h3 style={{ marginTop: 0 }}>Catechisanten toevoegen</h3>
          <label htmlFor="namen">Voornaam (een per regel)</label>
          <textarea id="namen" name="namen" placeholder={"Anne\nJan\nMarieke"} />
          <div className="row"><button className="primary" type="submit">Toevoegen en codes maken</button></div>
        </form>
        <form action={nieuweExtra} className="card">
          <h3 style={{ marginTop: 0 }}>Extra materiaal bij een les</h3>
          <label htmlFor="les">Les</label>
          <select id="les" name="les">
            {lessen.map((l) => <option key={l.nr} value={l.nr}>{l.optioneel ? "Optioneel" : `Les ${l.nr}`}: {l.titel}</option>)}
          </select>
          <label htmlFor="titel" style={{ marginTop: 8 }}>Titel</label><input id="titel" name="titel" type="text" required />
          <label htmlFor="bron" style={{ marginTop: 8 }}>Bron (krant, datum)</label><input id="bron" name="bron" type="text" />
          <label htmlFor="tekst" style={{ marginTop: 8 }}>Tekst (lege regel = nieuwe alinea)</label><textarea id="tekst" name="tekst" />
          <label htmlFor="link" style={{ marginTop: 8 }}>Link (https://…, mag leeg)</label><input id="link" name="link" type="text" />
          <div className="row"><button className="primary" type="submit">Toevoegen</button></div>
        </form>
      </div>

      <div className="card">
        <h3 style={{ marginTop: 0 }}>Extra materiaal</h3>
        {(ext.data ?? []).length === 0 && <p className="note">Nog niets toegevoegd.</p>}
        {(ext.data ?? []).map((x) => (
          <form key={x.id} action={verwijderExtra} className="row" style={{ justifyContent: "space-between" }}>
            <span>Les {x.les}: <b>{x.titel}</b> <span className="note">{x.bron}</span></span>
            <input type="hidden" name="id" value={x.id} />
            <button className="klein gevaar" type="submit">Verwijderen</button>
          </form>
        ))}
      </div>
    </div>
  );
}
