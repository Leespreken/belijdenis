import { NextRequest, NextResponse } from "next/server";
import { huidige } from "@/lib/auth";
import { db } from "@/lib/db";
import { LESSEN } from "@/lib/content";
import { plusDagen, vandaag, INTERVALLEN } from "@/lib/datum";
import { haalVraaginhoud, metVraaginhoud } from "@/lib/vraaginhoud";

export async function POST(req: NextRequest) {
  const c = await huidige();
  if (!c) return NextResponse.json({ ok: false }, { status: 401 });
  const b = await req.json().catch(() => null);
  const basisLes = b ? LESSEN[b.les as number] : undefined;
  if (!basisLes) return NextResponse.json({ ok: false }, { status: 400 });
  const les = metVraaginhoud(basisLes, await haalVraaginhoud(basisLes.nr));
  if (!les.vragen.some((v) => v.id === b.vraag)) return NextResponse.json({ ok: false }, { status: 400 });
  const key = { catechisant_id: c.id, les: b.les, vraag: b.vraag };
  const { data: h, error: leesFout } = await db().from("herhaling").select("box,goed,fout").match(key).maybeSingle();
  if (leesFout) return NextResponse.json({ ok: false }, { status: 500 });
  const box = h?.box ?? 0;
  const nieuw = b.goed ? Math.min(box + 1, INTERVALLEN.length - 1) : 0;
  const { error } = await db().from("herhaling").upsert({
    ...key, box: nieuw, volgende: plusDagen(vandaag(), b.goed ? INTERVALLEN[nieuw] : 1),
    goed: (h?.goed ?? 0) + (b.goed ? 1 : 0), fout: (h?.fout ?? 0) + (b.goed ? 0 : 1), laatst: new Date().toISOString(),
  });
  if (error) return NextResponse.json({ ok: false }, { status: 500 });
  return NextResponse.json({ ok: true });
}
