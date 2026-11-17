"use client";
import { useState } from "react";
import Link from "next/link";
import type { Les } from "@/lib/content";
import { kernpunten } from "@/lib/content";
import { opslaan } from "@/lib/opslaan";
import { useActief } from "./useActief";
import Reproduceren from "./Reproduceren";

export type Opgeslagen = { vraag: number; antwoord: string; zelf: number | null };
export type ExtraItem = { id: string; titel: string; bron: string | null; tekst: string | null; link: string | null };
type Tab = "lezen" | "vragen" | "reproduceren" | "extra";

function ActieveTab({ les, tab }: { les: number; tab: string }) {
  const fout = useActief(les, tab);
  return fout ? <p className="fout" role="alert">{fout}</p> : null;
}

type LesLink = { nr: number; titel: string };

export default function LesClient({ les, opgeslagen, extra, vorige, volgende }: {
  les: Les; opgeslagen: Opgeslagen[]; extra: ExtraItem[]; vorige?: LesLink; volgende?: LesLink;
}) {
  const [tab, setTab] = useState<Tab>("lezen");
  const [klaar, setKlaar] = useState<Record<number, { antwoord: string; zelf: number | null }>>(
    Object.fromEntries(opgeslagen.map((o) => [o.vraag, { antwoord: o.antwoord, zelf: o.zelf }]))
  );
  const gedaan = les.vragen.filter((v) => klaar[v.id]).length;
  const reproVragen = les.vragen.filter((v): v is typeof v & { reproductie: NonNullable<typeof v.reproductie> } => !!v.reproductie);
  let volgNr = 3;
  const reproNr = reproVragen.length > 0 ? volgNr++ : 0;
  const extraNr = extra.length > 0 ? volgNr++ : 0;

  return (
    <>
      <ActieveTab les={les.nr} tab={tab} />
      <nav className="tabs" role="tablist" aria-label="Onderdelen">
        <button role="tab" aria-selected={tab === "lezen"} onClick={() => setTab("lezen")}>1. De les</button>
        <button role="tab" aria-selected={tab === "vragen"} onClick={() => setTab("vragen")}>2. Vragen</button>
        {reproVragen.length > 0 && <button role="tab" aria-selected={tab === "reproduceren"} onClick={() => setTab("reproduceren")}>{reproNr}. Reproduceren</button>}
        {extra.length > 0 && <button role="tab" aria-selected={tab === "extra"} onClick={() => setTab("extra")}>{extraNr}. Extra</button>}
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

      {tab === "reproduceren" && (
        <section>
          <Reproduceren lesNr={les.nr} vragen={reproVragen.map((v) => ({ id: v.id, tekst: v.tekst, goed: v.reproductie.goed, fout: v.reproductie.fout }))} />
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

      {tab !== "reproduceren" && (vorige || volgende) && (
        <nav className="lesnav">
          {vorige ? <Link className="knop" href={`/les/${vorige.nr}`}>← Les {vorige.nr}: {vorige.titel}</Link> : <span />}
          {volgende ? <Link className="knop primary" href={`/les/${volgende.nr}`}>Les {volgende.nr}: {volgende.titel} →</Link> : <span />}
        </nav>
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
  const [fout, setFout] = useState<string | null>(null);

  async function toon() {
    setBezig(true); setFout(null);
    const secs = start ? Math.round((Date.now() - start) / 1000) : 0;
    try {
      await opslaan("/api/antwoord", { actie: "toon", les: les.nr, vraag: v.id, antwoord: tekst, secs, getypt, geplakt });
      onKlaar(tekst);
    } catch {
      setFout("Je antwoord is niet bevestigd als opgeslagen. Je tekst staat er nog; probeer opnieuw.");
    } finally { setBezig(false); }
  }
  async function zelf(z: number) {
    setBezig(true); setFout(null);
    try {
      await opslaan("/api/antwoord", { actie: "zelf", les: les.nr, vraag: v.id, zelf: z });
      onZelf(z);
    } catch {
      setFout("Je beoordeling is niet opgeslagen. Probeer opnieuw.");
    } finally { setBezig(false); }
  }
  function opnieuw() { setTekst(""); setStart(0); setGetypt(0); setGeplakt(false); setFout(null); onOpnieuw(); }
  const cov = klaar && !v.open ? kernpunten(v, klaar.antwoord) : [];
  const aantal = cov.filter(Boolean).length;

  return (
    <div className="card">
      <div className="qnum">{v.open ? "Om over na te denken" : `Vraag ${idx + 1} van ${les.vragen.length - 1}`}</div>
      <div className="qtext">{v.tekst}</div>
      <textarea
        aria-label={"Jouw antwoord op: " + v.tekst}
        placeholder="Schrijf hier je antwoord in je eigen woorden…"
        value={klaar ? klaar.antwoord : tekst} readOnly={!!klaar || bezig}
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
              <button key={z} aria-pressed={klaar.zelf === z} disabled={bezig} onClick={() => zelf(z)}>{t}</button>
            ))}
            <button disabled={bezig} onClick={opnieuw}>Opnieuw proberen</button>
          </div>
        </>
      )}
      {fout && <p className="fout" role="alert">{fout}</p>}
    </div>
  );
}
