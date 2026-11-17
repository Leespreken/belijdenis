"use client";
import { useState } from "react";
import { normaal } from "@/lib/content";
import { useActief } from "./useActief";

export type Kaart = { les: number; vraag: number; tekst: string; invul: string };
type Deel = { t: string } | { gat: string[] };

function parse(s: string): Deel[] {
  const out: Deel[] = []; let last = 0;
  for (const m of s.matchAll(/\{\{(.+?)\}\}/g)) {
    if (m.index! > last) out.push({ t: s.slice(last, m.index) });
    out.push({ gat: m[1].split("|").map((x) => x.trim()) });
    last = m.index! + m[0].length;
  }
  if (last < s.length) out.push({ t: s.slice(last) });
  return out;
}

export default function Herhaal({ kaarten, leesLes }: { kaarten: Kaart[]; leesLes: number }) {
  useActief(leesLes, "onthouden");
  const [i, setI] = useState(0);
  const [waarden, setWaarden] = useState<string[]>([]);
  const [uitslag, setUitslag] = useState<boolean[] | null>(null);
  const [goed, setGoed] = useState(0);

  if (!kaarten.length) return <div className="card">Er is nu niets om te herhalen. Kom morgen terug.</div>;
  if (i >= kaarten.length) return (
    <div className="card">
      <h2 style={{ marginTop: 0 }}>Klaar voor nu</h2>
      <p>Je had {goed} van de {kaarten.length} helemaal goed. Wat je goed deed, komt later terug; wat nog niet lukte, morgen alweer.</p>
      <a className="knop primary" href={`/les/${leesLes}`}>Terug naar de les</a>
    </div>
  );

  const k = kaarten[i];
  const delen = parse(k.invul);
  const gaten = delen.filter((d): d is { gat: string[] } => "gat" in d);

  async function controleer() {
    const u = gaten.map((g, n) => g.gat.some((a) => normaal(a) === normaal(waarden[n] || "")));
    setUitslag(u);
    const allesGoed = u.every(Boolean);
    if (allesGoed) setGoed((x) => x + 1);
    fetch("/api/herhaling", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ les: k.les, vraag: k.vraag, goed: allesGoed }) }).catch(() => {});
  }
  function volgende() { setI(i + 1); setWaarden([]); setUitslag(null); }

  let gatNr = -1;
  return (
    <div className="card">
      <div className="qnum">Herhalen {i + 1} van {kaarten.length}</div>
      <div className="qtext">{k.tekst}</div>
      <p className="note">Vul de ontbrekende woorden in.</p>
      <div className="invultekst">
        {delen.map((d, n) => {
          if ("t" in d) return <span key={n}>{d.t}</span>;
          gatNr++; const g = gatNr;
          return (
            <input key={n} className={"invul" + (uitslag ? (uitslag[g] ? " goed" : " fout") : "")} aria-label={`Ontbrekend woord ${g + 1}`}
              value={waarden[g] || ""} readOnly={!!uitslag} autoComplete="off" autoCapitalize="none" spellCheck={false}
              onChange={(e) => setWaarden((w) => { const c = [...w]; c[g] = e.target.value; return c; })}
              />
          );
        })}
      </div>
      {uitslag && (
        <p className="note">
          {uitslag.every(Boolean) ? "Helemaal goed!" : "Niet alles klopte. Juiste woorden: " + gaten.filter((_, n) => !uitslag[n]).map((g) => g.gat[0]).join(", ") + ". Dit komt morgen terug."}
        </p>
      )}
      <div className="row">
        {!uitslag ? <button className="primary" onClick={controleer}>Controleer</button> : <button className="primary" onClick={volgende}>{i + 1 < kaarten.length ? "Volgende" : "Afronden"}</button>}
      </div>
    </div>
  );
}
