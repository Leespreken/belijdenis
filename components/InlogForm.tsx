"use client";
import { useFormState } from "react-dom";
import { inloggen } from "@/app/actions";

export default function InlogForm() {
  const [s, actie] = useFormState(inloggen, null as null | { fout: string });
  return (
    <form action={actie} className="card">
      <label htmlFor="code">Je persoonlijke code</label>
      <input id="code" name="code" type="text" autoComplete="off" autoCapitalize="characters" maxLength={12} placeholder="Bijvoorbeeld: K7M2QX" />
      {s?.fout && <p className="fout" role="alert">{s.fout}</p>}
      <div className="row"><button className="primary" type="submit">Beginnen</button></div>
      <p className="note">Je code heb je van je catecheet gekregen.</p>
    </form>
  );
}
