import { redirect } from "next/navigation";
import Link from "next/link";
import { huidige } from "@/lib/auth";
import InlogForm from "@/components/InlogForm";

export const dynamic = "force-dynamic";
export default async function Home() {
  if (await huidige()) redirect("/lessen");
  return (
    <div className="wrap">
      <div className="titelblok">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="kerklogo" src="/kerklogo.png" alt="De Bethlehemkerk" width={1577} height={639} />
        <div className="kicker">Belijdeniscatechese Bethlehemkerk</div>
        <div className="gemeente">Gereformeerde Gemeente Woerden</div>
        <h1>Welkom</h1>
        <p className="ondertitel">Thema&rsquo;s uit de Gereformeerde geloofsleer,<br/>toegelicht vooral vanuit het Kort Begrip</p>
      </div>
      <p className="intro">Hier leer je de stof van de catechese en oefen je de vragen. Neem er rustig de tijd voor.</p>
      <InlogForm />
      <p className="note" style={{ textAlign: "center" }}>Nog geen code? <Link href="/inschrijven">Schrijf je hier in</Link>.</p>
    </div>
  );
}
