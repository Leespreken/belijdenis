"use client";
import { useMemo, useState } from "react";
import { useActief } from "./useActief";

export type ReproVraag = { id: number; tekst: string; goed: string; fout: [string, string] };

function schudden<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function Reproduceren({ vragen, lesNr }: { vragen: ReproVraag[]; lesNr: number }) {
  useActief(lesNr, "reproduceren");
  const [i, setI] = useState(0);
  const [gekozen, setGekozen] = useState<number | null>(null);
  const [gecontroleerd, setGecontroleerd] = useState(false);
  const [goedAantal, setGoedAantal] = useState(0);

  const v = vragen[i];
  const opties = useMemo(
    () => (v ? schudden([v.goed, ...v.fout]) : []),
    [v]
  );
  const goedIndex = v ? opties.indexOf(v.goed) : -1;

  if (!vragen.length) return <div className="card">Voor deze les is nog geen meerkeuze-oefening beschikbaar.</div>;
  if (i >= vragen.length) return (
    <div className="card">
      <h2 style={{ marginTop: 0 }}>Klaar!</h2>
      <p>Je had {goedAantal} van de {vragen.length} goed.</p>
      <div className="row"><button className="primary" onClick={() => { setI(0); setGekozen(null); setGecontroleerd(false); setGoedAantal(0); }}>Nog eens</button></div>
    </div>
  );

  function controleer() {
    if (gekozen === null) return;
    setGecontroleerd(true);
    if (gekozen === goedIndex) setGoedAantal((n) => n + 1);
  }
  function volgende() { setI(i + 1); setGekozen(null); setGecontroleerd(false); }

  return (
    <div className="card">
      <div className="qnum">Vraag {i + 1} van {vragen.length}</div>
      <div className="qtext">{v.tekst}</div>
      <div className="mcopties">
        {opties.map((tekst, idx) => {
          let klasse = "mcoptie";
          if (gecontroleerd) {
            if (idx === goedIndex) klasse += " goed";
            else if (idx === gekozen) klasse += " fout";
          } else if (idx === gekozen) klasse += " gekozen";
          return (
            <button key={idx} type="button" className={klasse} disabled={gecontroleerd}
              aria-pressed={gekozen === idx} onClick={() => setGekozen(idx)}>
              {tekst}
            </button>
          );
        })}
      </div>
      <div className="row">
        {!gecontroleerd
          ? <button className="primary" disabled={gekozen === null} onClick={controleer}>Controleer antwoord</button>
          : <button className="primary" onClick={volgende}>{i + 1 < vragen.length ? "Volgende" : "Afronden"}</button>}
      </div>
    </div>
  );
}
