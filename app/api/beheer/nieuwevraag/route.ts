import { NextRequest, NextResponse } from "next/server";
import { isBeheerder } from "@/lib/auth";
import { LESSEN } from "@/lib/content";
import { haalVraaginhoud, nieuwVraagNummer, opslaanNieuweVraag, volledigeVragenlijst } from "@/lib/vraaginhoud";

export async function POST(req: NextRequest) {
  if (!isBeheerder()) return NextResponse.json({ ok: false }, { status: 401 });
  const b = await req.json().catch(() => null);
  const nr = Number(b?.les);
  const les = LESSEN[nr];
  if (!les) return NextResponse.json({ ok: false }, { status: 400 });

  const overrides = await haalVraaginhoud(nr);
  const id = nieuwVraagNummer(les, overrides);
  const lijst = volledigeVragenlijst(les, overrides);
  const volgorde = (lijst.length ? Math.max(...lijst.map((x) => x.volgorde)) : 0) + 1;

  const { error } = await opslaanNieuweVraag(nr, id, volgorde);
  if (error) return NextResponse.json({ ok: false, fout: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, id });
}
