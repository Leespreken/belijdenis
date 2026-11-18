"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function NieuweVraagKnop({ lesNr }: { lesNr: number }) {
  const router = useRouter();
  const [bezig, setBezig] = useState(false);
  const [fout, setFout] = useState<string | null>(null);

  async function toevoegen() {
    setBezig(true); setFout(null);
    try {
      const res = await fetch("/api/beheer/nieuwevraag", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ les: lesNr }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || data?.ok !== true) throw new Error(data?.fout || "mislukt");
      router.refresh();
    } catch (e) {
      setFout("Toevoegen is niet gelukt. " + (e instanceof Error && e.message !== "mislukt" ? e.message : "Probeer het nog eens."));
    } finally { setBezig(false); }
  }

  return (
    <div className="row" style={{ marginTop: 16 }}>
      <button className="knop" disabled={bezig} onClick={toevoegen}>+ Nieuwe vraag toevoegen</button>
      {fout && <span className="note">{fout}</span>}
    </div>
  );
}
