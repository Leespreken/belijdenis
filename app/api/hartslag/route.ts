import { NextRequest, NextResponse } from "next/server";
import { huidige } from "@/lib/auth";
import { db } from "@/lib/db";
import { LESSEN } from "@/lib/content";

const TABS = ["lezen", "vragen", "extra", "onthouden"];
export async function POST(req: NextRequest) {
  const c = await huidige();
  if (!c) return NextResponse.json({ ok: false }, { status: 401 });
  const b = await req.json().catch(() => null);
  if (!b || !LESSEN[b.les] || !TABS.includes(b.tab)) return NextResponse.json({ ok: false }, { status: 400 });
  const secs = Math.max(0, Math.min(30, Math.round(Number(b.secs) || 0)));
  if (secs > 0) {
    const { error } = await db().rpc("tel_op", { p_cat: c.id, p_les: b.les, p_tab: b.tab, p_secs: secs });
    if (error) return NextResponse.json({ ok: false }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
