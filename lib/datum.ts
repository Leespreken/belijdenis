export function vandaag(): string {
  return new Date().toLocaleDateString("sv-SE", { timeZone: "Europe/Amsterdam" });
}
export function plusDagen(dag: string, n: number): string {
  const d = new Date(dag + "T12:00:00Z");
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}
export const INTERVALLEN = [1, 3, 7, 14, 30];
