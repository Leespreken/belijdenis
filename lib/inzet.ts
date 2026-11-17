export type AntwoordRij = {
  vraag: number; secs: number; tekens: number; getypt: number; geplakt: boolean;
  kern: number; kern_totaal: number; zelf: number | null; poging: number;
};
export function eenInzet(r: AntwoordRij, open: boolean): "zelf" | "matig" | "doorgeklikt" {
  if (r.geplakt && r.getypt < r.tekens * 0.5) return "doorgeklikt";
  if (r.secs < 6 || r.tekens < 6) return "doorgeklikt";
  if (r.secs >= 15 && r.getypt >= 15 && (open ? r.tekens >= 40 : true)) return "zelf";
  return "matig";
}
export function totaalInzet(rijen: (AntwoordRij & { les: number })[], open: (les: number, v: number) => boolean): { tekst: string; kleur: "ok" | "mid" | "bad" | "grey" } {
  if (!rijen.length) return { tekst: "Nog niet begonnen", kleur: "grey" };
  const e = rijen.map((r) => eenInzet(r, open(r.les, r.vraag)));
  const zelf = e.filter((x) => x === "zelf").length / e.length;
  const dk = e.filter((x) => x === "doorgeklikt").length / e.length;
  if (zelf >= 0.6) return { tekst: "Zelf actief bezig", kleur: "ok" };
  if (dk >= 0.5) return { tekst: "Klikt vooral door", kleur: "bad" };
  return { tekst: "Wisselend", kleur: "mid" };
}
export const min = (s: number) => (s < 60 ? s + " s" : Math.round(s / 60) + " min");
