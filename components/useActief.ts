"use client";
import { useEffect, useState } from "react";
import { opslaan } from "@/lib/opslaan";

/** Telt alleen zichtbare, recente activiteit; bewaart onbevestigde seconden voor een nieuwe poging. */
export function useActief(les: number, tab: string) {
  const [fout, setFout] = useState<string | null>(null);
  useEffect(() => {
    let secs = 0;
    let touch = Date.now();
    let bezig = false;
    let opnieuwVanaf = 0;
    let afgesloten = false;
    const t = () => { touch = Date.now(); };
    const evs = ["pointerdown", "keydown", "scroll", "touchstart", "input"];
    evs.forEach((e) => addEventListener(e, t, { passive: true }));
    const stuur = async () => {
      if (bezig || secs <= 0) return;
      bezig = true;
      try {
        // De API accepteert maximaal 30 seconden per bericht, ook na een storing.
        while (secs > 0) {
          const aantal = Math.min(30, secs);
          secs -= aantal;
          try {
            await opslaan("/api/hartslag", { les, tab, secs: aantal }, true);
          } catch {
            secs += aantal;
            throw new Error("Tijdregistratie niet bevestigd");
          }
        }
        opnieuwVanaf = 0;
        if (!afgesloten) setFout(null);
      } catch {
        opnieuwVanaf = Date.now() + 15000;
        if (!afgesloten) setFout("Je tijdregistratie is niet bevestigd als opgeslagen. Houd deze pagina open; we proberen het opnieuw.");
      } finally { bezig = false; }
    };
    const iv = setInterval(() => {
      if (!document.hidden && Date.now() - touch <= 45000) secs++;
      // Ook zonder nieuwe activiteit mogen eerder mislukte berichten opnieuw worden verstuurd.
      if ((secs >= 15 || (secs > 0 && opnieuwVanaf > 0)) && Date.now() >= opnieuwVanaf) void stuur();
    }, 1000);
    const vis = () => { if (document.hidden) void stuur(); };
    const verlaat = () => { void stuur(); };
    document.addEventListener("visibilitychange", vis);
    addEventListener("pagehide", verlaat);
    return () => {
      afgesloten = true;
      clearInterval(iv);
      evs.forEach((e) => removeEventListener(e, t));
      document.removeEventListener("visibilitychange", vis);
      removeEventListener("pagehide", verlaat);
      void stuur();
    };
  }, [les, tab]);
  return fout;
}
