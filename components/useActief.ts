"use client";
import { useEffect, useRef } from "react";

/** Telt alleen seconden waarin de pagina zichtbaar is en er recent iets gedaan is; meldt dat per 15 s. */
export function useActief(les: number, tab: string) {
  const sec = useRef(0);
  const touch = useRef(Date.now());
  useEffect(() => {
    const t = () => { touch.current = Date.now(); };
    const evs = ["pointerdown", "keydown", "scroll", "touchstart", "input"];
    evs.forEach((e) => addEventListener(e, t, { passive: true }));
    const stuur = (beacon: boolean) => {
      if (sec.current <= 0) return;
      const body = JSON.stringify({ les, tab, secs: sec.current });
      sec.current = 0;
      if (beacon && navigator.sendBeacon) navigator.sendBeacon("/api/hartslag", new Blob([body], { type: "application/json" }));
      else fetch("/api/hartslag", { method: "POST", headers: { "Content-Type": "application/json" }, body, keepalive: true }).catch(() => {});
    };
    const iv = setInterval(() => {
      if (document.hidden || Date.now() - touch.current > 45000) return;
      sec.current++;
      if (sec.current >= 15) stuur(false);
    }, 1000);
    const vis = () => { if (document.hidden) stuur(true); };
    document.addEventListener("visibilitychange", vis);
    addEventListener("pagehide", vis);
    return () => {
      clearInterval(iv);
      evs.forEach((e) => removeEventListener(e, t));
      document.removeEventListener("visibilitychange", vis);
      removeEventListener("pagehide", vis);
      stuur(true);
    };
  }, [les, tab]);
}
