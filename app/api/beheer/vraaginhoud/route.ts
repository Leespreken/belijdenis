import { NextRequest, NextResponse } from "next/server";
import { isBeheerder } from "@/lib/auth";
import { LESSEN } from "@/lib/content";
import { haalVraaginhoud, opslaanVraaginhoud, tekstNaarKern } from "@/lib/vraaginhoud";

export async function POST(req: NextRequest) {
  if (!isBeheerder()) return NextResponse.json({ ok: false }, { status: 401 });
  const b = await req.json().catch(() => null);
  const nr = Number(b?.les);
  const vraagId = Number(b?.vraag);
  if (!b || !LESSEN[nr] || !Number.isFinite(vraagId)) return NextResponse.json({ ok: false }, { status: 400 });

  const uitCode = LESSEN[nr].vragen.find((x) => x.id === vraagId);
  const overrides = await haalVraaginhoud(nr);
  const bestaatAl = uitCode || overrides.has(vraagId);
  if (!bestaatAl) return NextResponse.json({ ok: false }, { status: 400 });

  const tekst = String(b.tekst || "").slice(0, 2000);
  const antwoord = String(b.antwoord || "").slice(0, 4000);
  const open = !!b.open;
  const need = Math.max(0, Math.min(20, Math.round(Number(b.need) || 0)));
  const kern = tekstNaarKern(String(b.kernTekst || "")).slice(0, 20);
  const invul = b.invul ? String(b.invul).slice(0, 2000) : null;
  const reproductieGoed = b.reproductieGoed ? String(b.reproductieGoed).slice(0, 1000) : null;
  const reproductieFout1 = b.reproductieFout1 ? String(b.reproductieFout1).slice(0, 1000) : null;
  const reproductieFout2 = b.reproductieFout2 ? String(b.reproductieFout2).slice(0, 1000) : null;
  const actief = b.actief !== false;
  const volgorde = b.volgorde === "" || b.volgorde === null || b.volgorde === undefined ? null : Math.round(Number(b.volgorde));
  const toegevoegd = !uitCode;

  const { error } = await opslaanVraaginhoud(nr, vraagId, {
    tekst, antwoord, open, kern, need, invul, reproductieGoed, reproductieFout1, reproductieFout2,
    actief, volgorde, toegevoegd,
  });
  if (error) return NextResponse.json({ ok: false, fout: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
