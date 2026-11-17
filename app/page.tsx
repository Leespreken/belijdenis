import { redirect } from "next/navigation";
import { huidige } from "@/lib/auth";
import InlogForm from "@/components/InlogForm";

export const dynamic = "force-dynamic";
export default async function Home() {
  if (await huidige()) redirect("/lessen");
  return (
    <div className="wrap">
      <div className="titelblok">
        <svg className="ichthus" viewBox="0 0 200 110" aria-hidden focusable="false">
          <path d="M10 55 C 55 5, 150 5, 190 20 C 165 40, 165 70, 190 90 C 150 105, 55 105, 10 55 Z" />
          <line x1="190" y1="20" x2="190" y2="90" />
        </svg>
        <div className="kicker">Belijdeniscatechese</div>
        <h1>Welkom</h1>
        <p className="ondertitel">Thema&rsquo;s uit de Gereformeerde geloofsleer,<br/>toegelicht vooral vanuit het Kort Begrip</p>
      </div>
      <p>Hier leer je de stof van de catechese en oefen je de vragen. Neem er rustig de tijd voor.</p>
      <InlogForm />
    </div>
  );
}
