import { db } from "./db";
import type { Les } from "./content";

export type Lesinhoud = { html: string; bijlezenTitel: string | null; bijlezenHtml: string | null };

export async function haalLesinhoud(nr: number): Promise<Lesinhoud | null> {
  const { data } = await db().from("lesinhoud").select("html,bijlezen_titel,bijlezen_html").eq("les", nr).maybeSingle();
  if (!data) return null;
  return { html: data.html, bijlezenTitel: data.bijlezen_titel, bijlezenHtml: data.bijlezen_html };
}

export async function haalAlleLesinhoud(): Promise<Map<number, Lesinhoud>> {
  const { data } = await db().from("lesinhoud").select("les,html,bijlezen_titel,bijlezen_html");
  const m = new Map<number, Lesinhoud>();
  (data ?? []).forEach((r) => m.set(r.les, { html: r.html, bijlezenTitel: r.bijlezen_titel, bijlezenHtml: r.bijlezen_html }));
  return m;
}

export async function opslaanLesinhoud(nr: number, inhoud: Lesinhoud) {
  const res = await db().from("lesinhoud").upsert({
    les: nr, html: inhoud.html, bijlezen_titel: inhoud.bijlezenTitel, bijlezen_html: inhoud.bijlezenHtml,
    bijgewerkt: new Date().toISOString(),
  }, { onConflict: "les" });
  if (res.error) console.error("opslaanLesinhoud", res.error);
  return res;
}

/** Les met de teksten uit de database, als die er zijn; anders de teksten uit de code. */
export function metLesinhoud(les: Les, inhoud: Lesinhoud | null | undefined): Les {
  if (!inhoud) return les;
  return { ...les, html: inhoud.html, bijlezenTitel: inhoud.bijlezenTitel ?? undefined, bijlezenHtml: inhoud.bijlezenHtml ?? undefined };
}
