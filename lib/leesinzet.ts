export function wordenInHtml(html: string): number {
  const tekst = html.replace(/<[^>]+>/g, " ");
  return (tekst.match(/[\p{L}\p{N}'-]+/gu) ?? []).length;
}

/** Geschatte leestijd in seconden, op basis van een rustig leestempo voor overdenkende tekst. */
export function verwachteLeestijd(html: string): number {
  const WOORDEN_PER_MINUUT = 130;
  const woorden = wordenInHtml(html);
  return Math.max(30, Math.round((woorden / WOORDEN_PER_MINUUT) * 60));
}

export type LeesStatus = { tekst: string; kleur: "ok" | "mid" | "bad" | "grey" };

export function leesStatus(secs: number, verwacht: number): LeesStatus {
  if (secs <= 0) return { tekst: "Niet gelezen", kleur: "grey" };
  if (secs < verwacht * 0.35) return { tekst: "Snel doorgeklikt", kleur: "bad" };
  if (secs < verwacht * 0.8) return { tekst: "Deels gelezen", kleur: "mid" };
  return { tekst: "Gelezen", kleur: "ok" };
}
