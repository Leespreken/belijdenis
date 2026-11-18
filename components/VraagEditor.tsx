"use client";
import { useState } from "react";
import { kernNaarTekst } from "@/lib/vraaginhoud";
import type { Vraag } from "@/lib/content";

export default function VraagEditor({ lesNr, vraag, actief: initieelActief, volgorde: initieelVolgorde, nieuw }: {
  lesNr: number; vraag: Vraag; actief: boolean; volgorde: number; nieuw?: boolean;
}) {
  const [tekst, setTekst] = useState(vraag.tekst);
  const [antwoord, setAntwoord] = useState(vraag.antwoord);
  const [open, setOpen] = useState(!!vraag.open);
  const [kernTekst, setKernTekst] = useState(kernNaarTekst(vraag.kern));
  const [need, setNeed] = useState(vraag.need);
  const [invul, setInvul] = useState(vraag.invul ?? "");
  const [reproductieGoed, setReproductieGoed] = useState(vraag.reproductie?.goed ?? "");
  const [reproductieFout1, setReproductieFout1] = useState(vraag.reproductie?.fout[0] ?? "");
  const [reproductieFout2, setReproductieFout2] = useState(vraag.reproductie?.fout[1] ?? "");
  const [actief, setActief] = useState(initieelActief);
  const [volgorde, setVolgorde] = useState(String(initieelVolgorde));
  const [bezig, setBezig] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  async function opslaan() {
    setBezig(true); setStatus(null);
    try {
      const res = await fetch("/api/beheer/vraaginhoud", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          les: lesNr, vraag: vraag.id, tekst, antwoord, open, kernTekst, need, invul,
          reproductieGoed, reproductieFout1, reproductieFout2, actief,
          volgorde: volgorde.trim() === "" ? null : Number(volgorde),
        }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || data?.ok !== true) throw new Error(data?.fout || "mislukt");
      setStatus("Opgeslagen.");
    } catch (e) {
      setStatus("Opslaan is niet gelukt. " + (e instanceof Error && e.message !== "mislukt" ? e.message : "Probeer het nog eens."));
    } finally { setBezig(false); }
  }

  return (
    <details className="more" open={nieuw || undefined} style={!actief ? { opacity: 0.6 } : undefined}>
      <summary>
        Vraag {vraag.id}{!actief ? " (uitgeschakeld)" : ""}{open ? " (om over na te denken)" : ""}: {tekst.slice(0, 80)}{tekst.length > 80 ? "…" : ""}
      </summary>
      <div style={{ paddingBottom: 10 }}>
        <div className="row" style={{ marginTop: 6 }}>
          <label style={{ marginBottom: 0 }}>
            <input type="checkbox" checked={actief} onChange={(e) => setActief(e.target.checked)} style={{ width: "auto", marginRight: 8 }} />
            Actief (staat bij de catechisant)
          </label>
        </div>
        <label htmlFor={`volgorde-${vraag.id}`} style={{ marginTop: 10 }}>Volgorde (lager getal = eerder in de lijst; het vraagnummer zelf blijft {vraag.id})</label>
        <input id={`volgorde-${vraag.id}`} type="text" inputMode="numeric" value={volgorde} onChange={(e) => setVolgorde(e.target.value.replace(/[^\d-]/g, ""))} style={{ maxWidth: 100 }} />

        <label htmlFor={`tekst-${vraag.id}`} style={{ marginTop: 10 }}>Vraagtekst</label>
        <textarea id={`tekst-${vraag.id}`} value={tekst} onChange={(e) => setTekst(e.target.value)} style={{ minHeight: 60 }} />

        <label htmlFor={`antwoord-${vraag.id}`} style={{ marginTop: 10 }}>Modelantwoord (uit de les)</label>
        <textarea id={`antwoord-${vraag.id}`} value={antwoord} onChange={(e) => setAntwoord(e.target.value)} />

        <div className="row" style={{ marginTop: 10 }}>
          <label style={{ marginBottom: 0 }}>
            <input type="checkbox" checked={open} onChange={(e) => setOpen(e.target.checked)} style={{ width: "auto", marginRight: 8 }} />
            Open na-denk-vraag (geen kernpunten/oefeningen, telt niet mee in de voortgang)
          </label>
        </div>

        {!open && (
          <>
            <label htmlFor={`kern-${vraag.id}`} style={{ marginTop: 10 }}>Kernpunten (één per regel: <code>Label | synoniem1, synoniem2</code>)</label>
            <textarea id={`kern-${vraag.id}`} value={kernTekst} onChange={(e) => setKernTekst(e.target.value)} placeholder={"Kerkelijk gezag | kerkelijk\nOnder Gods Woord | onder"} />

            <label htmlFor={`need-${vraag.id}`} style={{ marginTop: 10 }}>Hoeveel kernpunten minimaal genoemd moeten zijn</label>
            <input id={`need-${vraag.id}`} type="text" inputMode="numeric" value={need} onChange={(e) => setNeed(Math.max(0, Number(e.target.value.replace(/\D/g, "")) || 0))} style={{ maxWidth: 100 }} />

            <label htmlFor={`invul-${vraag.id}`} style={{ marginTop: 10 }}>Invuloefening voor Onthouden (plaats <code>{"{{woord}}"}</code> of <code>{"{{woord|alternatief}}"}</code> om de gaten te bepalen; leeg = geen invuloefening)</label>
            <textarea id={`invul-${vraag.id}`} value={invul} onChange={(e) => setInvul(e.target.value)} />

            <label style={{ marginTop: 10 }}>Meerkeuze-oefening (Oefenen-tabblad; leeg laten = geen meerkeuze voor deze vraag)</label>
            <label htmlFor={`rgoed-${vraag.id}`} className="note" style={{ fontWeight: 400, marginTop: 6 }}>Het juiste antwoord</label>
            <textarea id={`rgoed-${vraag.id}`} value={reproductieGoed} onChange={(e) => setReproductieGoed(e.target.value)} style={{ minHeight: 50 }} />
            <label htmlFor={`rfout1-${vraag.id}`} className="note" style={{ fontWeight: 400, marginTop: 6 }}>Fout antwoord 1</label>
            <textarea id={`rfout1-${vraag.id}`} value={reproductieFout1} onChange={(e) => setReproductieFout1(e.target.value)} style={{ minHeight: 50 }} />
            <label htmlFor={`rfout2-${vraag.id}`} className="note" style={{ fontWeight: 400, marginTop: 6 }}>Fout antwoord 2</label>
            <textarea id={`rfout2-${vraag.id}`} value={reproductieFout2} onChange={(e) => setReproductieFout2(e.target.value)} style={{ minHeight: 50 }} />
          </>
        )}

        <div className="row" style={{ marginTop: 12 }}>
          <button className="primary" disabled={bezig} onClick={opslaan}>Opslaan</button>
          {status && <span className="note">{status}</span>}
        </div>
      </div>
    </details>
  );
}
