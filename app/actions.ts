"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import crypto from "crypto";
import { db } from "@/lib/db";
import { isBeheerder, wachtwoordKlopt, wisBeheer, wisSessie, zetBeheer, zetSessie } from "@/lib/auth";

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

const LETTERS = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
function nieuweCode() { return Array.from({ length: 6 }, () => LETTERS[crypto.randomInt(LETTERS.length)]).join(""); }

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
  const link = String(fd.get("link") || "").trim();
  await db().from("extra").insert({
    les: Number(fd.get("les")) || 3, titel: String(fd.get("titel") || "").slice(0, 200) || "Zonder titel",
    bron: String(fd.get("bron") || "").slice(0, 200) || null, tekst: String(fd.get("tekst") || "").slice(0, 60000),
    link: /^https:\/\//.test(link) ? link : null,
  });
  revalidatePath("/beheer"); revalidatePath("/les/" + (Number(fd.get("les")) || 3));
}
export async function verwijderExtra(fd: FormData) {
  if (!isBeheerder()) return;
  await db().from("extra").delete().eq("id", String(fd.get("id")));
  revalidatePath("/beheer");
}
