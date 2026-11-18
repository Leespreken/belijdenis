import { NextRequest, NextResponse } from "next/server";
import { isBeheerder } from "@/lib/auth";
import { LESSEN } from "@/lib/content";
import { opslaanLesinhoud } from "@/lib/lesinhoud";

export async function POST(req: NextRequest) {
  if (!isBeheerder()) return NextResponse.json({ ok: false }, { status: 401 });
  const b = await req.json().catch(() => null);
  const nr = Number(b?.les);
  if (!b || !LESSEN[nr]) return NextResponse.json({ ok: false }, { status: 400 });
  const html = String(b.html || "").slice(0, 200000);
  const bijlezenTitel = b.bijlezenTitel ? String(b.bijlezenTitel).slice(0, 300) : null;
  const bijlezenHtml = b.bijlezenHtml ? String(b.bijlezenHtml).slice(0, 200000) : null;
  const { error } = await opslaanLesinhoud(nr, { html, bijlezenTitel, bijlezenHtml });
  if (error) return NextResponse.json({ ok: false, fout: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
