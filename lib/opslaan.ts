/** Pas een geslaagde HTTP-respons mét bevestiging geldt als opgeslagen. */
export async function opslaan(url: string, gegevens: unknown, keepalive = false): Promise<void> {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(gegevens),
    keepalive,
  });
  const resultaat = await response.json();
  if (!response.ok || resultaat?.ok !== true) throw new Error("Opslaan is niet gelukt.");
}
