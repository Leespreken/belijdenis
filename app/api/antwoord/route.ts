import { NextRequest, NextResponse } from "next/server";
import { huidige } from "@/lib/auth";
import { db } from "@/lib/db";
import { LESSEN, kernpunten } from "@/lib/content";
import { plusDagen, vandaag, INTERVALLEN } from "@/lib/datum";

export async function POST(req: NextRequest) {
  const c = await huidige();
  if (!c) return NextResponse.json({ ok: false }, { status: 401 });
  const b = await req.json().catch(() => null);
  const les = b ? LESSEN[b.les as number] : undefined;
  const v = les?.vragen.find((x) => x.id === b?.vraag);
  if (!les || !v) return NextResponse.json({ ok: false }, { status: 400 });

  if (b.actie === "zelf") {
    const z = [0, 1, 2].includes(b.zelf) ? b.zelf : null;
    await db().from("antwoorden").update({ zelf: z }).match({ catechisant_id: c.id, les: b.les, vraag: b.vraag });
    return NextResponse.json({ ok: true });
  }

  const antwoord = String(b.antwoord || "").slice(0, 3000);
  const kern = v.open ? 0 : kernpunten(v, antwoord).filter(Boolean).length;
  const { data: oud } = await db().from("antwoorden").select("poging").match({ catechisant_id: c.id, les: b.les, vraag: b.vraag }).maybeSingle();
  await db().from("antwoorden").upsert({
    catechisant_id: c.id, les: b.les, vraag: b.vraag, antwoord,
    secs: Math.max(0, Math.min(1800, Math.round(Number(b.secs) || 0))),
    tekens: antwoord.trim().length,
    getypt: Math.max(0, Math.min(3000, Math.round(Number(b.getypt) || 0))),
    geplakt: !!b.geplakt, kern, kern_totaal: v.kern.length,
    poging: (oud?.poging ?? 0) + 1, zelf: null, gedaan: new Date().toISOString(),
  });
  if (!v.open && v.invul) {
    // Eerste keer: morgen herhalen
    const { data: h } = await db().from("herhaling").select("vraag").match({ catechisant_id: c.id, les: b.les, vraag: b.vraag }).maybeSingle();
    if (!h) await db().from("herhaling").insert({ catechisant_id: c.id, les: b.les, vraag: b.vraag, box: 0, volgende: plusDagen(vandaag(), INTERVALLEN[0]) });
  }
  return NextResponse.json({ ok: true, kern });
}
