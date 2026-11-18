"use client";
import { useState } from "react";
import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

function Toolbar({ editor }: { editor: Editor | null }) {
  if (!editor) return null;
  const knop = (actief: boolean, label: string, onClick: () => void, titel?: string) => (
    <button type="button" className="klein" aria-pressed={actief} onClick={onClick} title={titel}>{label}</button>
  );
  return (
    <div className="row" style={{ marginTop: 0, marginBottom: 8 }}>
      {knop(editor.isActive("heading", { level: 2 }), "Kopje", () => editor.chain().focus().toggleHeading({ level: 2 }).run(), "Kopje (h2)")}
      {knop(editor.isActive("paragraph"), "Tekst", () => editor.chain().focus().setParagraph().run(), "Gewone alinea")}
      {knop(editor.isActive("bold"), "Vet", () => editor.chain().focus().toggleBold().run())}
      {knop(editor.isActive("italic"), "Cursief", () => editor.chain().focus().toggleItalic().run())}
      {knop(editor.isActive("bulletList"), "Lijst", () => editor.chain().focus().toggleBulletList().run())}
      {knop(editor.isActive("orderedList"), "Genummerd", () => editor.chain().focus().toggleOrderedList().run())}
      {knop(editor.isActive("blockquote"), "Citaatkader", () => editor.chain().focus().toggleBlockquote().run())}
    </div>
  );
}

function RijkeTekst({ waarde, onChange }: { waarde: string; onChange: (html: string) => void }) {
  const editor = useEditor({
    extensions: [StarterKit.configure({ heading: { levels: [2] } })],
    content: waarde,
    immediatelyRender: false,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });
  return (
    <div>
      <Toolbar editor={editor} />
      <div className="card lesson" style={{ margin: 0 }}>
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}

export default function LesEditor({ lesNr, initieleHtml, initieleBijlezenTitel, initieleBijlezenHtml }: {
  lesNr: number; initieleHtml: string; initieleBijlezenTitel: string; initieleBijlezenHtml: string;
}) {
  const [html, setHtml] = useState(initieleHtml);
  const [bijlezenAan, setBijlezenAan] = useState(!!initieleBijlezenHtml);
  const [bijlezenTitel, setBijlezenTitel] = useState(initieleBijlezenTitel);
  const [bijlezenHtml, setBijlezenHtml] = useState(initieleBijlezenHtml);
  const [bezig, setBezig] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  async function opslaan() {
    setBezig(true); setStatus(null);
    try {
      const res = await fetch("/api/beheer/lesinhoud", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          les: lesNr, html,
          bijlezenTitel: bijlezenAan ? bijlezenTitel : null,
          bijlezenHtml: bijlezenAan ? bijlezenHtml : null,
        }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || data?.ok !== true) throw new Error("mislukt");
      setStatus("Opgeslagen.");
    } catch {
      setStatus("Opslaan is niet gelukt. Probeer het nog eens.");
    } finally { setBezig(false); }
  }

  return (
    <div>
      <h3>Lestekst</h3>
      <RijkeTekst waarde={html} onChange={setHtml} />

      <div className="row" style={{ marginTop: 18 }}>
        <label style={{ marginBottom: 0 }}>
          <input type="checkbox" checked={bijlezenAan} onChange={(e) => setBijlezenAan(e.target.checked)} style={{ width: "auto", marginRight: 8 }} />
          Extra leesstof (inklapbaar onderaan de les)
        </label>
      </div>
      {bijlezenAan && (
        <div style={{ marginTop: 10 }}>
          <label htmlFor="bijlezen-titel">Titel van de leesstof</label>
          <input id="bijlezen-titel" type="text" value={bijlezenTitel} onChange={(e) => setBijlezenTitel(e.target.value)} />
          <div style={{ marginTop: 10 }}>
            <h3>Tekst van de leesstof</h3>
            <RijkeTekst waarde={bijlezenHtml} onChange={setBijlezenHtml} />
          </div>
        </div>
      )}

      <div className="row" style={{ marginTop: 18 }}>
        <button className="primary" disabled={bezig} onClick={opslaan}>Opslaan</button>
        {status && <span className="note">{status}</span>}
      </div>
    </div>
  );
}
