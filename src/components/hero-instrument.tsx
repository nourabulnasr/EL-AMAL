"use client";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { Instrument } from "./instrument";
import type { Locale } from "@/lib/catalogue";

function StillInstrument() {
  return (
    <div className="instrument-parallax">
      <div className="instrument-tilt">
        <Instrument />
      </div>
    </div>
  );
}
// Phones and reduced-motion visitors retain the server-rendered instrument without downloading Motion.
const InteractiveInstrument = dynamic(
  () => import("./interactive-instrument"),
  { ssr: false, loading: StillInstrument },
);
export function HeroInstrument({ locale }: { locale: Locale }) {
  const [interactive, setInteractive] = useState(false),
    [paused, setPaused] = useState(false);
  useEffect(() => {
    const media = window.matchMedia(
      "(hover:hover) and (pointer:fine) and (min-width:768px) and (prefers-reduced-motion:no-preference)",
    );
    const update = () => setInteractive(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  const ar = locale === "ar";
  return (
    <div className="hero-art instrument-stage">
      <div className="stage-light" aria-hidden="true" />
      <div className="engineering-circle circle-one" />
      <div className="engineering-circle circle-two" />
      <span className="stage-coordinate" aria-hidden="true">
        P / T
      </span>
      {interactive && !paused ? <InteractiveInstrument /> : <StillInstrument />}
      <div className="stage-caption">
        <span className="caption-line" />
        <p>
          {ar ? "دراسة في الدقة" : "A study in precision"}
          <small>
            {ar
              ? "رسم توضيحي، وليس صورة منتج"
              : "Illustrative study, not product photography"}
          </small>
        </p>
      </div>
      {interactive && (
        <button
          className="motion-control"
          aria-pressed={paused}
          onClick={() => setPaused(!paused)}
        >
          {paused
            ? ar
              ? "تشغيل الحركة"
              : "Enable motion"
            : ar
              ? "إيقاف الحركة"
              : "Pause motion"}
          <span aria-hidden="true">{paused ? "▷" : "Ⅱ"}</span>
        </button>
      )}
    </div>
  );
}
