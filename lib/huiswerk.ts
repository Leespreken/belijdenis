import { db } from "./db";

export type Huiswerk = {
  id: string;
  les: number;
  lezen: boolean;
  vragen: number[];
  leren: number[];
  bericht: string | null;
  aangemaakt: string;
};

export async function haalHuiswerk(catechisantId: string): Promise<Huiswerk[]> {
  const { data } = await db().from("huiswerk").select("*").eq("catechisant_id", catechisantId).order("aangemaakt", { ascending: false });
  return (data ?? []).map((r) => ({
    id: r.id, les: r.les, lezen: r.lezen, vragen: r.vragen ?? [], leren: r.leren ?? [], bericht: r.bericht, aangemaakt: r.aangemaakt,
  }));
}

export async function haalAlleHuiswerk(): Promise<Map<string, Huiswerk[]>> {
  const { data } = await db().from("huiswerk").select("*").order("aangemaakt", { ascending: false });
  const m = new Map<string, Huiswerk[]>();
  (data ?? []).forEach((r) => {
    const lijst = m.get(r.catechisant_id) ?? [];
    lijst.push({ id: r.id, les: r.les, lezen: r.lezen, vragen: r.vragen ?? [], leren: r.leren ?? [], bericht: r.bericht, aangemaakt: r.aangemaakt });
    m.set(r.catechisant_id, lijst);
  });
  return m;
}
