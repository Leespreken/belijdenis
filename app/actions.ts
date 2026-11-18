"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import crypto from "crypto";
import { db } from "@/lib/db";
import { isBeheerder, wachtwoordKlopt, wisBeheer, wisSessie, zetBeheer, zetSessie } from "@/lib/auth";
import { LESSEN } from "@/lib/content";
import { opslaanLesinhoud } from "@/lib/lesinhoud";
import { nieuweCode } from "@/lib/code";
import { vandaag } from "@/lib/datum";

export async function inloggen(_: unknown, fd: FormData) {
  const code = String(fd.get("code") || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
  if (code.length < 4) return { fout: "Vul je persoonlijke code in." };
  const { data } = await db().from("catechisanten").select("id").eq("code", code).maybeSingle();
  if (!data) { await new Promise((r) => setTimeout(r, 800)); return { fout: "Deze code ken ik niet. Controleer of je hem goed hebt overgenomen." }; }
  zetSessie(data.id);
  redirect("/lessen");
}
export async function uitloggen() { wisSessie(); redirect("/"); }

export async function beheerInloggen(_: unknown, fd: FormData) {
  if (!wachtwoordKlopt(String(fd.get("wachtwoord") || ""))) { await new Promise((r) => setTimeout(r, 800)); return { fout: "Onjuist wachtwoord." }; }
  zetBeheer();
  redirect("/beheer");
}
export async function beheerUit() { wisBeheer(); redirect("/beheer"); }

export async function inschrijven(_: unknown, fd: FormData): Promise<{ fout: string } | { code: string } | null> {
  const naam = String(fd.get("naam") || "").trim().slice(0, 60);
  const email = String(fd.get("email") || "").trim().slice(0, 200);
  const telefoon = String(fd.get("telefoon") || "").trim().replace(/[^\d+]/g, "").slice(0, 20);
  if (!naam) return { fout: "Vul je naam in." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { fout: "Vul een geldig e-mailadres in." };

  let id: string | null = null;
  let code = "";
  for (let i = 0; i < 5; i++) {
    code = nieuweCode();
    const { data, error } = await db().from("catechisanten").insert({ naam, email, telefoon: telefoon || null, code }).select("id").single();
    if (!error) { id = data.id; break; }
  }
  if (!id) return { fout: "Inschrijven is niet gelukt. Probeer het nog eens." };
  zetSessie(id);
  return { code };
}

export async function nieuweCatechisant(fd: FormData) {
  if (!isBeheerder()) return;
  const namen = String(fd.get("namen") || "").split(/\n|,/).map((s) => s.trim()).filter(Boolean).slice(0, 50);
  for (const naam of namen) {
    for (let i = 0; i < 5; i++) {
      const { error } = await db().from("catechisanten").insert({ naam: naam.slice(0, 60), code: nieuweCode() });
      if (!error) break;
    }
  }
  revalidatePath("/beheer");
}
export async function verwijderCatechisant(fd: FormData) {
  if (!isBeheerder()) return;
  await db().from("catechisanten").delete().eq("id", String(fd.get("id")));
  redirect("/beheer");
}
export async function nieuweExtra(fd: FormData) {
  if (!isBeheerder()) return;
  let link = String(fd.get("link") || "").trim();
  link = /^https:\/\//.test(link) ? link : "";

  const bestand = fd.get("pdf");
  if (bestand instanceof File && bestand.size > 0) {
    if (bestand.type !== "application/pdf") return;
    if (bestand.size > 20 * 1024 * 1024) return; // max 20 MB
    const pad = `${crypto.randomUUID()}.pdf`;
    const { error } = await db().storage.from("bijlagen").upload(pad, bestand, { contentType: "application/pdf" });
    if (!error) {
      const { data } = db().storage.from("bijlagen").getPublicUrl(pad);
      link = data.publicUrl;
    }
  }

  await db().from("extra").insert({
    les: Number(fd.get("les")) || 3, titel: String(fd.get("titel") || "").slice(0, 200) || "Zonder titel",
    bron: String(fd.get("bron") || "").slice(0, 200) || null, tekst: String(fd.get("tekst") || "").slice(0, 60000),
    link: link || null,
  });
  revalidatePath("/beheer"); revalidatePath("/les/" + (Number(fd.get("les")) || 3));
}
export async function verwijderExtra(fd: FormData) {
  if (!isBeheerder()) return;
  await db().from("extra").delete().eq("id", String(fd.get("id")));
  revalidatePath("/beheer");
}

export async function nieuwHuiswerk(fd: FormData) {
  if (!isBeheerder()) return;
  const les = Number(fd.get("les"));
  if (!LESSEN[les]) return;
  const lezen = fd.get("lezen") === "on";
  const vragen = [...new Set(fd.getAll("vragen").map(Number).filter(Number.isFinite))];
  const leren = [...new Set(fd.getAll("leren").map(Number).filter(Number.isFinite))];
  const bericht = String(fd.get("bericht") || "").trim().slice(0, 4000) || null;
  const doelgroep = String(fd.get("doelgroep") || "alle");
  if (!lezen && !vragen.length && !leren.length) return;

  let catIds: string[];
  if (doelgroep === "alle") {
    const { data } = await db().from("catechisanten").select("id");
    catIds = (data ?? []).map((r) => r.id);
  } else {
    catIds = [doelgroep];
  }
  if (!catIds.length) return;

  for (const catId of catIds) {
    const { data: bestaand } = await db().from("huiswerk").select("lezen,vragen,leren,bericht").match({ catechisant_id: catId, les }).maybeSingle();
    await db().from("huiswerk").upsert({
      catechisant_id: catId, les,
      lezen: lezen || !!bestaand?.lezen,
      vragen: [...new Set([...(bestaand?.vragen ?? []), ...vragen])],
      leren: [...new Set([...(bestaand?.leren ?? []), ...leren])],
      bericht: bericht ?? bestaand?.bericht ?? null,
    }, { onConflict: "catechisant_id,les" });
  }

  if (leren.length) {
    const vandaagDatum = vandaag();
    for (const catId of catIds) {
      for (const vraagId of leren) {
        const { data: bestaat } = await db().from("herhaling").select("vraag").match({ catechisant_id: catId, les, vraag: vraagId }).maybeSingle();
        if (!bestaat) {
          await db().from("herhaling").insert({ catechisant_id: catId, les, vraag: vraagId, box: 0, volgende: vandaagDatum });
        }
      }
    }
  }

  revalidatePath("/beheer");
  revalidatePath("/lessen");
}

export async function verwijderHuiswerk(fd: FormData) {
  if (!isBeheerder()) return;
  await db().from("huiswerk").delete().eq("id", String(fd.get("id")));
  revalidatePath("/beheer");
  revalidatePath("/lessen");
}

export async function vulOntbrekendeLesteksten() {
  if (!isBeheerder()) return;
  const { data } = await db().from("lesinhoud").select("les");
  const aanwezig = new Set((data ?? []).map((r) => r.les));
  for (const les of Object.values(LESSEN)) {
    if (aanwezig.has(les.nr)) continue;
    await opslaanLesinhoud(les.nr, { html: les.html, bijlezenTitel: les.bijlezenTitel ?? null, bijlezenHtml: les.bijlezenHtml ?? null });
  }
  revalidatePath("/beheer/lessen");
}
