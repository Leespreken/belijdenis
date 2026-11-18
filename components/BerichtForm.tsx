"use client";
import { useState } from "react";
import { waLink } from "@/lib/telefoon";

type Cat = { id: string; naam: string; email: string | null; telefoon: string | null };

export default function BerichtForm({ catechisanten }: { catechisanten: Cat[] }) {
  const [catId, setCatId] = useState(catechisanten[0]?.id ?? "");
  const [onderwerp, setOnderwerp] = useState("Bericht van je catecheet");
  const [bericht, setBericht] = useState("");
  const [bezig, setBezig] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const cat = catechisanten.find((c) => c.id === catId);

  async function mailVersturen() {
    if (!bericht.trim()) { setStatus("Vul eerst een bericht in."); return; }
    setBezig(true); setStatus(null);
    try {
      const res = await fetch("/api/beheer/berichtmail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ catechisant: catId, onderwerp, bericht }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || data?.ok !== true) throw new Error(data?.fout || "mislukt");
      setStatus("E-mail verstuurd.");
    } catch (e) {
      setStatus("Versturen is niet gelukt. " + (e instanceof Error && e.message !== "mislukt" ? e.message : "Probeer het nog eens."));
    } finally { setBezig(false); }
  }

  function whatsappOpenen() {
    if (!bericht.trim()) { setStatus("Vul eerst een bericht in."); return; }
    const link = waLink(cat?.telefoon, bericht);
    if (!link) { setStatus("Deze catechisant heeft geen telefoonnummer."); return; }
    window.open(link, "_blank");
  }

  return (
    <div className="card">
      <h3 style={{ marginTop: 0 }}>Bericht sturen</h3>
      <label htmlFor="b-cat">Aan</label>
      <select id="b-cat" value={catId} onChange={(e) => setCatId(e.target.value)}>
        {catechisanten.map((c) => <option key={c.id} value={c.id}>{c.naam}</option>)}
      </select>

      <label htmlFor="b-onderwerp" style={{ marginTop: 8 }}>Onderwerp (voor de e-mail)</label>
      <input id="b-onderwerp" type="text" value={onderwerp} onChange={(e) => setOnderwerp(e.target.value)} />

      <label htmlFor="b-bericht" style={{ marginTop: 8 }}>Bericht (of plak hier een kort artikeltje)</label>
      <textarea id="b-bericht" value={bericht} onChange={(e) => setBericht(e.target.value)} style={{ minHeight: 120 }} />

      <div className="row" style={{ marginTop: 10 }}>
        <button className="primary" disabled={bezig || !cat?.email} onClick={mailVersturen}>E-mail versturen</button>
        <button type="button" disabled={!cat?.telefoon} onClick={whatsappOpenen}>Open in WhatsApp</button>
        {status && <span className="note">{status}</span>}
      </div>
      {!cat?.email && <p className="note">Geen e-mailadres bekend bij {cat?.naam}.</p>}
      {!cat?.telefoon && <p className="note">Geen telefoonnummer bekend bij {cat?.naam}.</p>}
    </div>
  );
}
