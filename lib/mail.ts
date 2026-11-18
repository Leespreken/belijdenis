export async function stuurEmail(naar: string, onderwerp: string, tekst: string) {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("RESEND_API_KEY ontbreekt (zet deze in de omgevingsvariabelen).");
  const van = process.env.RESEND_FROM || "Belijdeniscatechese <onboarding@resend.dev>";
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: van,
      to: [naar],
      subject: onderwerp,
      text: tekst,
    }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Resend gaf een fout (${res.status}). ${body.slice(0, 200)}`);
  }
}
