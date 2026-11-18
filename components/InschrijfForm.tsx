"use client";
import Link from "next/link";
import { useFormState } from "react-dom";
import { inschrijven } from "@/app/actions";

export default function InschrijfForm() {
  const [s, actie] = useFormState(inschrijven, null as null | { fout: string } | { code: string });

  if (s && "code" in s) {
    return (
      <div className="card">
        <h3 style={{ marginTop: 0 }}>Welkom!</h3>
        <p>Je bent ingeschreven. Dit is je persoonlijke code — bewaar hem goed, hiermee kun je later weer inloggen:</p>
        <p style={{ fontSize: "1.6rem", fontWeight: 700, letterSpacing: 2 }}>{s.code}</p>
        <div className="row"><Link className="knop primary" href="/lessen">Naar de lessen →</Link></div>
      </div>
    );
  }

  return (
    <form action={actie} className="card">
      <label htmlFor="naam">Je voornaam</label>
      <input id="naam" name="naam" type="text" autoComplete="given-name" required />
      <label htmlFor="email" style={{ marginTop: 8 }}>Je e-mailadres</label>
      <input id="email" name="email" type="email" autoComplete="email" required />
      <label htmlFor="telefoon" style={{ marginTop: 8 }}>Je telefoonnummer (voor WhatsApp-berichtjes van je catecheet; mag leeg)</label>
      <input id="telefoon" name="telefoon" type="tel" autoComplete="tel" placeholder="06 12345678" />
      {s && "fout" in s && <p className="fout" role="alert">{s.fout}</p>}
      <div className="row"><button className="primary" type="submit">Inschrijven</button></div>
      <p className="note">Heb je al een code van je catecheet gekregen? <Link href="/">Log dan hier in</Link>.</p>
    </form>
  );
}
