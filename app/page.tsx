import { redirect } from "next/navigation";
import { huidige } from "@/lib/auth";
import InlogForm from "@/components/InlogForm";

export const dynamic = "force-dynamic";
export default async function Home() {
  if (await huidige()) redirect("/les/3");
  return (
    <div className="wrap">
      <header className="top"><div><div className="kicker">Belijdeniscatechese</div><h1>Welkom</h1></div></header>
      <p>Hier leer je de stof van de catechese en oefen je de vragen. Neem er rustig de tijd voor.</p>
      <InlogForm />
    </div>
  );
}
