import { NextRequest, NextResponse } from "next/server";
import { isBeheerder } from "@/lib/auth";
import { db } from "@/lib/db";
import { stuurEmail } from "@/lib/mail";

export async function POST(req: NextRequest) {
  if (!isBeheerder()) return NextResponse.json({ ok: false }, { status: 401 });
  const b = await req.json().catch(() => null);
  const catId = String(b?.catechisant || "");
  const onderwerp = String(b?.onderwerp || "Bericht van je catecheet").slice(0, 200);
  const bericht = String(b?.bericht || "").trim().slice(0, 10000);
  if (!bericht) return NextResponse.json({ ok: false, fout: "Vul een bericht in." }, { status: 400 });

  const { data: c } = await db().from("catechisanten").select("email").eq("id", catId).maybeSingle();
  if (!c?.email) return NextResponse.json({ ok: false, fout: "Deze catechisant heeft geen e-mailadres." }, { status: 400 });

  try {
    await stuurEmail(c.email, onderwerp, bericht);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ ok: false, fout: e instanceof Error ? e.message : "Versturen is niet gelukt." }, { status: 500 });
  }
}
