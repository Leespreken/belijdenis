import crypto from "crypto";
import { cookies } from "next/headers";
import { db } from "./db";

function secret() {
  const s = process.env.SESSION_SECRET;
  if (!s || s.length < 16) throw new Error("SESSION_SECRET ontbreekt of is te kort");
  return s;
}
function sign(v: string) {
  return v + "." + crypto.createHmac("sha256", secret()).update(v).digest("base64url");
}
function check(t?: string) {
  if (!t) return null;
  const i = t.lastIndexOf(".");
  if (i < 0) return null;
  const v = t.slice(0, i);
  const want = sign(v);
  const a = Buffer.from(want), b = Buffer.from(t);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  return v;
}

const OPT = { httpOnly: true, sameSite: "lax" as const, secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 24 * 120 };

export function zetSessie(id: string) { cookies().set("bc_sessie", sign("c:" + id), OPT); }
export function wisSessie() { cookies().delete("bc_sessie"); }
export function zetBeheer() { cookies().set("bc_beheer", sign("admin"), { ...OPT, maxAge: 60 * 60 * 12 }); }
export function wisBeheer() { cookies().delete("bc_beheer"); }
export function isBeheerder() { return check(cookies().get("bc_beheer")?.value) === "admin"; }

export type Catechisant = { id: string; naam: string };
export async function huidige(): Promise<Catechisant | null> {
  const v = check(cookies().get("bc_sessie")?.value);
  if (!v || !v.startsWith("c:")) return null;
  const { data } = await db().from("catechisanten").select("id,naam").eq("id", v.slice(2)).maybeSingle();
  return data ?? null;
}

export function wachtwoordKlopt(invoer: string) {
  const w = process.env.ADMIN_PASSWORD || "";
  const a = Buffer.from(invoer), b = Buffer.from(w);
  return w.length > 0 && a.length === b.length && crypto.timingSafeEqual(a, b);
}
