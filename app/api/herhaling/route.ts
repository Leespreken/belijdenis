import { NextRequest, NextResponse } from "next/server";
import { huidige } from "@/lib/auth";
import { db } from "@/lib/db";
import { LESSEN } from "@/lib/content";
import { plusDagen, vandaag, INTERVALLEN } from "@/lib/datum";

export async function POST(req: NextRequest) {
  const c = await huidige();
  if (!c) return NextResponse.json({ ok: false }, { status: 401 });
  const b = await req.json().catch(() => null);
  if (!b || !LESSEN[b.les as number]?.vragen.some((v) => v.id === b.vraag)) return NextResponse.json({ ok: false }, { status: 400 });
  const key = { catechisant_id: c.id, les: b.les, vraag: b.vraag };
  const { data: h } = await db().from("herhaling").select("box,goed,fout").match(key).maybeSingle();
  const box = h?.box ?? 0;
  const nieuw = b.goed ? Math.min(box + 1, INTERVALLEN.length - 1) : 0;
  await db().from("herhaling").upsert({
    ...key, box: nieuw, volgende: plusDagen(vandaag(), b.goed ? INTERVALLEN[nieuw] : 1),
    goed: (h?.goed ?? 0) + (b.goed ? 1 : 0), fout: (h?.fout ?? 0) + (b.goed ? 0 : 1), laatst: new Date().toISOString(),
  });
  return NextResponse.json({ ok: true });
}
