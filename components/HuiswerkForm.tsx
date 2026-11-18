"use client";
import { useState } from "react";
import { nieuwHuiswerk } from "@/app/actions";

type Vraag = { id: number; tekst: string };
type Les = { nr: number; titel: string; optioneel?: boolean; vragen: Vraag[]; leerbaar: Vraag[] };
type Cat = { id: string; naam: string };

export default function HuiswerkForm({ lessen, catechisanten }: { lessen: Les[]; catechisanten: Cat[] }) {
  const [lesNr, setLesNr] = useState(lessen[0]?.nr ?? 0);
  const les = lessen.find((l) => l.nr === lesNr);

  return (
    <form action={nieuwHuiswerk} className="card">
      <h3 style={{ marginTop: 0 }}>Huiswerk geven</h3>
      <label htmlFor="hw-doelgroep">Voor wie</label>
      <select id="hw-doelgroep" name="doelgroep" defaultValue="alle">
        <option value="alle">Alle catechisanten</option>
        {catechisanten.map((c) => <option key={c.id} value={c.id}>{c.naam}</option>)}
      </select>

      <label htmlFor="hw-les" style={{ marginTop: 8 }}>Les</label>
      <select id="hw-les" name="les" value={lesNr} onChange={(e) => setLesNr(Number(e.target.value))}>
        {lessen.map((l) => <option key={l.nr} value={l.nr}>{l.optioneel ? "Optioneel" : `Les ${l.nr}`}: {l.titel}</option>)}
      </select>

      <div className="row" style={{ marginTop: 8 }}>
        <label style={{ marginBottom: 0, fontWeight: 400 }}>
          <input type="checkbox" name="lezen" style={{ width: "auto", marginRight: 8 }} /> Lezen: deze les
        </label>
      </div>

      {les && les.vragen.length > 0 && (
        <div style={{ marginTop: 8 }}>
          <label style={{ marginBottom: 4 }}>Maken: deze vragen</label>
          {les.vragen.map((v) => (
            <label key={v.id} style={{ display: "block", fontWeight: 400, marginBottom: 4 }}>
              <input type="checkbox" name="vragen" value={v.id} style={{ width: "auto", marginRight: 8 }} />
              Vraag {v.id}: {v.tekst.slice(0, 70)}{v.tekst.length > 70 ? "…" : ""}
            </label>
          ))}
        </div>
      )}

      {les && les.leerbaar.length > 0 && (
        <div style={{ marginTop: 8 }}>
          <label style={{ marginBottom: 4 }}>Leren: deze vragen (komen bij Onthouden)</label>
          {les.leerbaar.map((v) => (
            <label key={v.id} style={{ display: "block", fontWeight: 400, marginBottom: 4 }}>
              <input type="checkbox" name="leren" value={v.id} style={{ width: "auto", marginRight: 8 }} />
              Vraag {v.id}: {v.tekst.slice(0, 70)}{v.tekst.length > 70 ? "…" : ""}
            </label>
          ))}
        </div>
      )}

      <label htmlFor="hw-bericht" style={{ marginTop: 8 }}>Bericht erbij (optioneel; bijv. een toelichting of kort artikeltje)</label>
      <textarea id="hw-bericht" name="bericht" />

      <div className="row" style={{ marginTop: 10 }}><button className="primary" type="submit">Huiswerk geven</button></div>
    </form>
  );
}
