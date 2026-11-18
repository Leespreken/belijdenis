/** Bouwt een wa.me-link met vooraf ingevulde tekst. Gaat uit van Nederlandse nummers tenzij er al een landcode in staat. */
export function waLink(telefoon: string | null | undefined, bericht: string): string | null {
  if (!telefoon) return null;
  let nr = telefoon.replace(/[^\d+]/g, "");
  if (!nr) return null;
  if (nr.startsWith("+")) nr = nr.slice(1);
  else if (nr.startsWith("00")) nr = nr.slice(2);
  else if (nr.startsWith("0")) nr = "31" + nr.slice(1);
  return `https://wa.me/${nr}?text=${encodeURIComponent(bericht)}`;
}
