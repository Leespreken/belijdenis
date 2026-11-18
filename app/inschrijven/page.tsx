import { redirect } from "next/navigation";
import { huidige } from "@/lib/auth";
import InschrijfForm from "@/components/InschrijfForm";

export const dynamic = "force-dynamic";
export default async function Inschrijven() {
  if (await huidige()) redirect("/lessen");
  return (
    <div className="wrap">
      <div className="titelblok">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="kerklogo" src="/kerklogo.png" alt="De Bethlehemkerk" width={1577} height={639} />
        <div className="kicker">Belijdeniscatechese Bethlehemkerk</div>
        <div className="gemeente">Gereformeerde Gemeente Woerden</div>
        <h1>Inschrijven</h1>
      </div>
      <p className="intro">Vul je gegevens in om te beginnen. Je krijgt daarna een eigen code waarmee je steeds kunt inloggen.</p>
      <InschrijfForm />
    </div>
  );
}
