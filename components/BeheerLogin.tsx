"use client";
import { useFormState } from "react-dom";
import { beheerInloggen } from "@/app/actions";
export default function BeheerLogin() {
  const [s, actie] = useFormState(beheerInloggen, null as null | { fout: string });
  return (
    <form action={actie} className="card">
      <label htmlFor="w">Wachtwoord</label>
      <input id="w" name="wachtwoord" type="password" autoComplete="current-password" />
      {s?.fout && <p className="fout" role="alert">{s.fout}</p>}
      <div className="row"><button className="primary" type="submit">Inloggen</button></div>
    </form>
  );
}
