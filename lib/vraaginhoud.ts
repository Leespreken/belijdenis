import { db } from "./db";
import type { Les, Vraag } from "./content";

export type VraagInhoud = {
  tekst: string;
  antwoord: string;
  kern: { label: string; alt: string[] }[];
  need: number;
  invul: string | null;
  reproductieGoed: string | null;
  reproductieFout1: string | null;
  reproductieFout2: string | null;
};

export async function haalVraaginhoud(nr: number): Promise<Map<number, VraagInhoud>> {
  const { data } = await db().from("vraaginhoud").select("*").eq("les", nr);
  const m = new Map<number, VraagInhoud>();
  (data ?? []).forEach((r) =>
    m.set(r.vraag, {
      tekst: r.tekst, antwoord: r.antwoord, kern: r.kern ?? [], need: r.need,
      invul: r.invul, reproductieGoed: r.reproductie_goed, reproductieFout1: r.reproductie_fout1, reproductieFout2: r.reproductie_fout2,
    })
  );
  return m;
}

export async function opslaanVraaginhoud(nr: number, vraagId: number, v: VraagInhoud) {
  return db().from("vraaginhoud").upsert({
    les: nr, vraag: vraagId, tekst: v.tekst, antwoord: v.antwoord, kern: v.kern, need: v.need,
    invul: v.invul, reproductie_goed: v.reproductieGoed, reproductie_fout1: v.reproductieFout1, reproductie_fout2: v.reproductieFout2,
    bijgewerkt: new Date().toISOString(),
  });
}

/** Les met per-vraag teksten/kernpunten/oefeningen uit de database, waar aanwezig. */
export function metVraaginhoud(les: Les, overrides: Map<number, VraagInhoud>): Les {
  if (overrides.size === 0) return les;
  return {
    ...les,
    vragen: les.vragen.map((v): Vraag => {
      const o = overrides.get(v.id);
      if (!o) return v;
      return {
        ...v,
        tekst: o.tekst, antwoord: o.antwoord, kern: o.kern, need: o.need,
        invul: o.invul ?? undefined,
        reproductie: o.reproductieGoed ? { goed: o.reproductieGoed, fout: [o.reproductieFout1 ?? "", o.reproductieFout2 ?? ""] } : undefined,
      };
    }),
  };
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
