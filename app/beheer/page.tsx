import Link from "next/link";
import { db } from "@/lib/db";
import { isBeheerder } from "@/lib/auth";
import { LESSEN } from "@/lib/content";
import { totaalInzet, min, AntwoordRij } from "@/lib/inzet";
import BeheerLogin from "@/components/BeheerLogin";
import { beheerUit, nieuweCatechisant, nieuweExtra, verwijderExtra } from "@/app/actions";
import { haalAlleVraaginhoud, metVraaginhoud } from "@/lib/vraaginhoud";
import { haalAlleLesinhoud, metLesinhoud } from "@/lib/lesinhoud";
import { verwachteLeestijd, leesStatus } from "@/lib/leesinzet";

export const dynamic = "force-dynamic";
const dagTxt = (d: string) => new Date(d + "T12:00:00Z").toLocaleDateString("nl-NL", { day: "numeric", month: "short" });

export default async function Beheer() {
  if (!isBeheerder()) return <div className="wrap"><header className="top"><div><div className="kicker">Belijdeniscatechese Bethlehemkerk</div><h1>Beheer</h1></div></header><BeheerLogin /></div>;

  const [cs, act, ant, her, ext, overridesPerLes, lesinhoudPerLes] = await Promise.all([
    db().from("catechisanten").select("id,naam,code").order("naam"),
    db().from("activiteit").select("catechisant_id,les,dag,tab,secs"),
    db().from("antwoorden").select("*"),
    db().from("herhaling").select("catechisant_id,goed,fout"),
    db().from("extra").select("id,les,titel,bron").order("les").order("aangemaakt"),
    haalAlleVraaginhoud(),
    haalAlleLesinhoud(),
  ]);
  const lessen = Object.values(LESSEN)
    .map((l) => metVraaginhoud(l, overridesPerLes.get(l.nr) ?? new Map()))
    .sort((a, b) => a.nr - b.nr);
  const lessenMap = new Map(lessen.map((l) => [l.nr, l]));
  const openVraag = (les: number, v: number) => !!lessenMap.get(les)?.vragen.find((x) => x.id === v)?.open;
  const aantalVragen = lessen.reduce((s, l) => s + l.vragen.length, 0);
  const verwachtPerLes = new Map(
    Object.values(LESSEN).map((l) => [l.nr, verwachteLeestijd(metLesinhoud(l, lesinhoudPerLes.get(l.nr)).html)])
  );

  const rijen = (cs.data ?? []).map((c) => {
    const a = (act.data ?? []).filter((x) => x.catechisant_id === c.id);
    const totaal = a.reduce((s, x) => s + x.secs, 0);
    const vragenSecs = a.filter((x) => x.tab === "vragen").reduce((s, x) => s + x.secs, 0);
    const laatst = a.map((x) => x.dag).sort().pop();
    const an = (ant.data ?? []).filter((x) => x.catechisant_id === c.id) as (AntwoordRij & { les: number })[];
    const zelf = an.filter((x) => !x.geplakt && x.tekens >= 6 && x.getypt >= x.tekens * 0.5).length;
    const geplakt = an.filter((x) => x.geplakt).length;
    const h = (her.data ?? []).filter((x) => x.catechisant_id === c.id);

    const lezenPerLes = new Map<number, number>();
    a.filter((x) => x.tab === "lezen").forEach((x) => lezenPerLes.set(x.les, (lezenPerLes.get(x.les) ?? 0) + x.secs));
    const lesNrsAangeraakt = new Set<number>([...lezenPerLes.keys(), ...an.map((x) => x.les)]);
    const leesStatussen = [...lesNrsAangeraakt].map((nr) => leesStatus(lezenPerLes.get(nr) ?? 0, verwachtPerLes.get(nr) ?? 60).tekst);
    const gelezen = leesStatussen.filter((s) => s === "Gelezen").length;
    const lezen = !leesStatussen.length
      ? { tekst: "–", kleur: "grey" as const }
      : gelezen / leesStatussen.length >= 0.7
        ? { tekst: "Leest de les", kleur: "ok" as const }
        : leesStatussen.filter((s) => s === "Snel doorgeklikt").length / leesStatussen.length >= 0.5
          ? { tekst: "Slaat vaak over", kleur: "bad" as const }
          : { tekst: "Wisselend", kleur: "mid" as const };

    return { c, totaal, vragenSecs, laatst, gedaan: an.length, zelf, geplakt, goed: h.reduce((s, x) => s + x.goed, 0), fout: h.reduce((s, x) => s + x.fout, 0), inzet: totaalInzet(an, openVraag), lezen };
  });

  return (
    <div className="wrap breed">
      <header className="top"><div><div className="kicker">Belijdeniscatechese Bethlehemkerk</div><h1>Overzicht catechisanten</h1></div>
        <div className="row" style={{ marginTop: 0 }}>
          <Link className="knop klein" href="/beheer/lessen">Lesteksten bewerken</Link>
          <form action={beheerUit}><button className="klein" type="submit">Uitloggen</button></form>
        </div>
      </header>

      <div className="card">
        <div className="tablewrap">
          <table>
            <thead><tr><th>Naam</th><th>Code</th><th>Totaal bezig</th><th>Waarvan vragen</th><th>Laatst actief</th><th>Lezen</th><th>Vragen gedaan</th><th>Zelf getypt</th><th>Geplakt</th><th>Herhaald (goed/fout)</th><th>Inzet</th></tr></thead>
            <tbody>
              {rijen.map((r) => (
                <tr key={r.c.id}>
                  <td><Link href={`/beheer/${r.c.id}`}>{r.c.naam}</Link></td>
                  <td><code>{r.c.code}</code></td>
                  <td>{min(r.totaal)}</td><td>{min(r.vragenSecs)}</td>
                  <td>{r.laatst ? dagTxt(r.laatst) : "–"}</td>
                  <td><span className={"badge " + r.lezen.kleur}>{r.lezen.tekst}</span></td>
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
        <p className="note">“Totaal bezig” telt alleen seconden waarin de pagina open en zichtbaar was en er iets gedaan werd (typen, klikken, scrollen). “Lezen” vergelijkt de tijd op het leesscherm met een geschatte leestijd per les (klik op een naam voor de les-voor-les uitsplitsing). “Zelf getypt” betekent dat het antwoord echt is ingetypt en niet geplakt. “Inzet” en “Lezen” zijn een indicatie, geen oordeel: een aanleiding voor een gesprek.</p>
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
          <label htmlFor="link" style={{ marginTop: 8 }}>Link naar bijlage (https://…, bijv. een PDF of artikel online; mag leeg)</label><input id="link" name="link" type="text" />
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
