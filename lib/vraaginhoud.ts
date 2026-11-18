import { db } from "./db";
import type { Les, Vraag } from "./content";

export type VraagInhoud = {
  tekst: string;
  antwoord: string;
  open: boolean;
  kern: { label: string; alt: string[] }[];
  need: number;
  invul: string | null;
  reproductieGoed: string | null;
  reproductieFout1: string | null;
  reproductieFout2: string | null;
  actief: boolean;
  volgorde: number | null;
  toegevoegd: boolean;
};

export async function haalVraaginhoud(nr: number): Promise<Map<number, VraagInhoud>> {
  const { data } = await db().from("vraaginhoud").select("*").eq("les", nr);
  return naarMap(data ?? []);
}

/** Alle vraaginhoud van alle lessen, gegroepeerd per les. Handig voor overzichtspagina's. */
export async function haalAlleVraaginhoud(): Promise<Map<number, Map<number, VraagInhoud>>> {
  const { data } = await db().from("vraaginhoud").select("*");
  const perLes = new Map<number, typeof data>();
  (data ?? []).forEach((r) => {
    if (!perLes.has(r.les)) perLes.set(r.les, []);
    perLes.get(r.les)!.push(r);
  });
  const m = new Map<number, Map<number, VraagInhoud>>();
  perLes.forEach((rijen, les) => m.set(les, naarMap(rijen ?? [])));
  return m;
}

function naarMap(data: Record<string, unknown>[]): Map<number, VraagInhoud> {
  const m = new Map<number, VraagInhoud>();
  (data ?? []).forEach((r) =>
    m.set(r.vraag as number, {
      tekst: r.tekst as string, antwoord: r.antwoord as string, open: !!r.open,
      kern: (r.kern as VraagInhoud["kern"]) ?? [], need: r.need as number,
      invul: r.invul as string | null,
      reproductieGoed: r.reproductie_goed as string | null,
      reproductieFout1: r.reproductie_fout1 as string | null,
      reproductieFout2: r.reproductie_fout2 as string | null,
      actief: r.actief === undefined || r.actief === null ? true : !!r.actief,
      volgorde: (r.volgorde as number | null) ?? null,
      toegevoegd: !!r.toegevoegd,
    })
  );
  return m;
}

export async function opslaanVraaginhoud(nr: number, vraagId: number, v: VraagInhoud) {
  const res = await db().from("vraaginhoud").upsert({
    les: nr, vraag: vraagId, tekst: v.tekst, antwoord: v.antwoord, open: v.open, kern: v.kern, need: v.need,
    invul: v.invul, reproductie_goed: v.reproductieGoed, reproductie_fout1: v.reproductieFout1, reproductie_fout2: v.reproductieFout2,
    actief: v.actief, volgorde: v.volgorde, toegevoegd: v.toegevoegd,
    bijgewerkt: new Date().toISOString(),
  }, { onConflict: "les,vraag" });
  if (res.error) console.error("opslaanVraaginhoud", res.error);
  return res;
}

function naarVraag(id: number, o: VraagInhoud): Vraag {
  return {
    id,
    tekst: o.tekst,
    antwoord: o.antwoord,
    open: o.open || undefined,
    kern: o.kern,
    need: o.need,
    invul: o.invul ?? undefined,
    reproductie: o.reproductieGoed ? { goed: o.reproductieGoed, fout: [o.reproductieFout1 ?? "", o.reproductieFout2 ?? ""] } : undefined,
  };
}

/**
 * Les zoals de catechisant hem ziet: teksten/kernpunten/oefeningen uit de database waar aanwezig,
 * uitgeschakelde vragen weggelaten, toegevoegde vragen erbij, alles gesorteerd op volgorde.
 */
export function metVraaginhoud(les: Les, overrides: Map<number, VraagInhoud>): Les {
  const vragen = volledigeVragenlijst(les, overrides)
    .filter((x) => x.actief)
    .sort((a, b) => a.volgorde - b.volgorde)
    .map((x) => x.vraag);
  return { ...les, vragen };
}

type VraagMetVolgorde = { vraag: Vraag; actief: boolean; volgorde: number; toegevoegd: boolean };

/** Alle vragen (uit code + database), inclusief uitgeschakelde — voor het beheerscherm. */
export function volledigeVragenlijst(les: Les, overrides: Map<number, VraagInhoud>): VraagMetVolgorde[] {
  const basis: VraagMetVolgorde[] = les.vragen.map((v, i) => {
    const o = overrides.get(v.id);
    return {
      vraag: o ? naarVraag(v.id, o) : v,
      actief: o ? o.actief : true,
      volgorde: o?.volgorde ?? i,
      toegevoegd: false,
    };
  });
  const codeIds = new Set(les.vragen.map((v) => v.id));
  const toegevoegd: VraagMetVolgorde[] = [...overrides.entries()]
    .filter(([id, o]) => o.toegevoegd && !codeIds.has(id))
    .map(([id, o]) => ({
      vraag: naarVraag(id, o),
      actief: o.actief,
      volgorde: o.volgorde ?? 1000 + id,
      toegevoegd: true,
    }));
  return [...basis, ...toegevoegd].sort((a, b) => a.volgorde - b.volgorde);
}

/** Een vers, nooit eerder gebruikt vraagnummer binnen deze les. */
export function nieuwVraagNummer(les: Les, overrides: Map<number, VraagInhoud>): number {
  const ids = [...les.vragen.map((v) => v.id), ...overrides.keys()];
  return (ids.length ? Math.max(...ids) : 0) + 1;
}

export async function opslaanNieuweVraag(nr: number, vraagId: number, volgorde: number) {
  return opslaanVraaginhoud(nr, vraagId, {
    tekst: "Nieuwe vraag", antwoord: "", open: false, kern: [], need: 0, invul: null,
    reproductieGoed: null, reproductieFout1: null, reproductieFout2: null,
    actief: true, volgorde, toegevoegd: true,
  });
}

export function kernNaarTekst(kern: { label: string; alt: string[] }[]) {
  return kern.map((k) => `${k.label} | ${k.alt.join(", ")}`).join("\n");
}

export function tekstNaarKern(tekst: string): { label: string; alt: string[] }[] {
  return tekst
    .split("\n")
    .map((r) => r.trim())
    .filter(Boolean)
    .map((regel) => {
      const [label, altStr] = regel.split("|");
      return { label: (label ?? "").trim(), alt: (altStr ?? "").split(",").map((s) => s.trim()).filter(Boolean) };
    });
}
