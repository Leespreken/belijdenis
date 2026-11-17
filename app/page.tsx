import { redirect } from "next/navigation";
import { huidige } from "@/lib/auth";
import InlogForm from "@/components/InlogForm";

export const dynamic = "force-dynamic";
export default async function Home() {
  if (await huidige()) redirect("/lessen");
  return (
    <div className="wrap">
      <div className="titelblok">
        <svg className="kerklogo" viewBox="0 0 240 150" aria-hidden focusable="false">
          <rect x="28" y="18" width="38" height="112" rx="1" />
          <rect x="38" y="34" width="18" height="22" />
          <path d="M43 38 L51 38 L55 50 L39 50 Z" />
          <line x1="47" y1="50" x2="47" y2="54" />
          <path d="M66 58 L150 22 L228 112" />
          <line x1="228" y1="112" x2="228" y2="130" />
          <path d="M78 128 L87 108 L96 128 Z" />
          <line x1="87" y1="108" x2="87" y2="128" />
          <path d="M100 128 L109 96 L118 128 Z" />
          <line x1="109" y1="96" x2="109" y2="128" />
          <path d="M122 128 L131 84 L140 128 Z" />
          <line x1="131" y1="84" x2="131" y2="128" />
          <line x1="18" y1="130" x2="232" y2="130" />
        </svg>
        <div className="kicker">Belijdeniscatechese Bethlehemkerk</div>
        <h1>Welkom</h1>
        <p className="ondertitel">Thema&rsquo;s uit de Gereformeerde geloofsleer,<br/>toegelicht vooral vanuit het Kort Begrip</p>
      </div>
      <p className="intro">Hier leer je de stof van de catechese en oefen je de vragen. Neem er rustig de tijd voor.</p>
      <InlogForm />
    </div>
  );
}
