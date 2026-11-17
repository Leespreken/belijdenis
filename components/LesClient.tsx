"use client";
import { useState } from "react";
import type { Les } from "@/lib/content";
import { kernpunten } from "@/lib/content";
import { useActief } from "./useActief";

export type Opgeslagen = { vraag: number; antwoord: string; zelf: number | null };
export type ExtraItem = { id: string; titel: string; bron: string | null; tekst: string | null; link: string | null };
type Tab = "lezen" | "vragen" | "extra";

function ActieveTab({ les, tab }: { les: number; tab: string }) { useActief(les, tab); return null; }

export default function LesClient({ les, opgeslagen, extra }: { les: Les; opgeslagen: Opgeslagen[]; extra: ExtraItem[] }) {
  const [tab, setTab] = useState<Tab>("lezen");
  const [klaar, setKlaar] = useState<Record<number, { antwoord: string; zelf: number | null }>>(
    Object.fromEntries(opgeslagen.map((o) => [o.vraag, { antwoord: o.antwoord, zelf: o.zelf }]))
  );
  const gedaan = les.vragen.filter((v) => klaar[v.id]).length;

  return (
    <>
      <ActieveTab les={les.nr} tab={tab} />
      <nav className="tabs" role="tablist" aria-label="Onderdelen">
        <button role="tab" aria-selected={tab === "lezen"} onClick={() => setTab("lezen")}>1. De les</button>
        <button role="tab" aria-selected={tab === "vragen"} onClick={() => setTab("vragen")}>2. Vragen</button>
        {extra.length > 0 && <button role="tab" aria-selected={tab === "extra"} onClick={() => setTab("extra")}>3. Extra</button>}
      </nav>

      {tab === "lezen" && (
        <section className="lesson">
          <div className="card" dangerouslySetInnerHTML={{ __html: les.html }} />
          {les.bijlezenHtml && (
            <details className="more"><summary>{les.bijlezenTitel}</summary><div dangerouslySetInnerHTML={{ __html: les.bijlezenHtml }} /></details>
          )}
          <div className="row"><button className="primary" onClick={() => { setTab("vragen"); scrollTo({ top: 0 }); }}>Naar de vragen →</button></div>
        </section>
      )}

      {tab === "vragen" && (
        <section>
          <div className="card">
            <div className="status">{gedaan} van {les.vragen.length} onderdelen gedaan</div>
            <div className="progress" aria-hidden><i style={{ width: (gedaan / les.vragen.length) * 100 + "%" }} /></div>
            <p className="note" style={{ margin: "8px 0 0" }}>Typ eerst je eigen antwoord. Kijk pas daarna naar het antwoord uit de les.</p>
          </div>
          {les.vragen.map((v, i) => (
            <VraagKaart key={v.id} les={les} idx={i} klaar={klaar[v.id]} onKlaar={(a) => setKlaar((k) => ({ ...k, [v.id]: { antwoord: a, zelf: null } }))}
              onZelf={(z) => setKlaar((k) => ({ ...k, [v.id]: { ...k[v.id], zelf: z } }))}
              onOpnieuw={() => setKlaar((k) => { const n = { ...k }; delete n[v.id]; return n; })} />
          ))}
        </section>
      )}

      {tab === "extra" && (
        <section>
          {extra.map((x) => (
            <div className="card lesson" key={x.id}>
              <h2 style={{ marginTop: 0 }}>{x.titel}</h2>
              {x.bron && <p className="note">{x.bron}</p>}
              {(x.tekst || "").split(/\n\s*\n/).filter((t) => t.trim()).map((t, i) => <p key={i}>{t.trim()}</p>)}
              {x.link && <p><a href={x.link} target="_blank" rel="noopener noreferrer">Lees het volledige artikel</a></p>}
            </div>
          ))}
        </section>
      )}
    </>
  );
}

function VraagKaart({ les, idx, klaar, onKlaar, onZelf, onOpnieuw }: {
  les: Les; idx: number; klaar?: { antwoord: string; zelf: number | null };
  onKlaar: (a: string) => void; onZelf: (z: number) => void; onOpnieuw: () => void;
}) {
  const v = les.vragen[idx];
  const [tekst, setTekst] = useState("");
  const [start, setStart] = useState(0);
  const [getypt, setGetypt] = useState(0);
  const [geplakt, setGeplakt] = useState(false);
  const [bezig, setBezig] = useState(false);

  async function toon() {
    setBezig(true);
    const secs = start ? Math.round((Date.now() - start) / 1000) : 0;
    await fetch("/api/antwoord", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ actie: "toon", les: les.nr, vraag: v.id, antwoord: tekst, secs, getypt, geplakt }) }).catch(() => {});
    onKlaar(tekst); setBezig(false);
  }
  async function zelf(z: number) {
    onZelf(z);
    fetch("/api/antwoord", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ actie: "zelf", les: les.nr, vraag: v.id, zelf: z }) }).catch(() => {});
  }
  function opnieuw() { setTekst(""); setStart(0); setGetypt(0); setGeplakt(false); onOpnieuw(); }
  const cov = klaar && !v.open ? kernpunten(v, klaar.antwoord) : [];
  const aantal = cov.filter(Boolean).length;

  return (
    <div className="card">
      <div className="qnum">{v.open ? "Om over na te denken" : `Vraag ${idx + 1} van ${les.vragen.length - 1}`}</div>
      <div className="qtext">{v.tekst}</div>
      <textarea
        aria-label={"Jouw antwoord op: " + v.tekst}
        placeholder="Schrijf hier je antwoord in je eigen woorden…"
        value={klaar ? klaar.antwoord : tekst} readOnly={!!klaar}
        onFocus={() => { if (!start) setStart(Date.now()); }}
        onInput={(e) => {
          const ne = e.nativeEvent as InputEvent;
          if (!start) setStart(Date.now());
          if (ne.inputType === "insertFromPaste" || ne.inputType === "insertFromDrop") setGeplakt(true);
          else if (ne.inputType?.startsWith("insert")) setGetypt((n) => n + (ne.data?.length || 1));
        }}
        onChange={(e) => setTekst(e.target.value)}
      />
      {!klaar && <div className="row"><button className="primary" disabled={bezig} onClick={toon}>Toon het antwoord uit de les</button></div>}
      {klaar && (
        <>
          <div className="model">
            <div className="lbl">{v.open ? "Gedachten bij deze vraag" : "Antwoord uit de les"}</div>
            <div>{v.antwoord}</div>
          </div>
          {!v.open && (
            <>
              <div className="chips">{v.kern.map((k, i) => <span key={i} className={"chip " + (cov[i] ? "y" : "n")}>{cov[i] ? "✓ " : "○ "}{k.label}</span>)}</div>
              <p className="note">{aantal >= v.need ? "Mooi, je antwoord noemt de kernpunten." : "Lees de les nog eens na; een deel van de kernpunten ontbrak nog in je antwoord."}</p>
            </>
          )}
          <div className="row self">
            <span className="status">Hoe ging het?</span>
            {([["Wist ik", 2], ["Gedeeltelijk", 1], ["Moet ik oefenen", 0]] as const).map(([t, z]) => (
              <button key={z} aria-pressed={klaar.zelf === z} onClick={() => zelf(z)}>{t}</button>
            ))}
            <button onClick={opnieuw}>Opnieuw proberen</button>
          </div>
        </>
      )}
    </div>
  );
}
