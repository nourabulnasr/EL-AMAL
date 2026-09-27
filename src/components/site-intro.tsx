"use client";

import {useEffect, useState} from 'react';
import type {Locale} from '@/lib/catalogue';

const replayEvent = 'el-amal:replay-intro';

/** A short brand entrance, not a simulated network progress indicator. */
export function SiteIntro({locale}: {locale: Locale}) {
  const [run, setRun] = useState(1);
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const replay = () => { setRun(value => value + 1); setVisible(true); };
    window.addEventListener(replayEvent, replay);
    return () => window.removeEventListener(replayEvent, replay);
  }, []);
  useEffect(() => {
    if (!visible) return;
    const dismiss = () => setVisible(false);
    // Keyboard/focus/scroll always takes priority over the decorative entrance.
    document.addEventListener('keydown', dismiss);
    document.addEventListener('focusin', dismiss);
    window.addEventListener('wheel', dismiss, {passive: true});
    window.addEventListener('touchmove', dismiss, {passive: true});
    const timer = window.setTimeout(dismiss, 2200);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('keydown', dismiss);
      document.removeEventListener('focusin', dismiss);
      window.removeEventListener('wheel', dismiss);
      window.removeEventListener('touchmove', dismiss);
    };
  }, [visible, run]);
  return <>
    <noscript><style>{'.site-intro,.intro-replay{display:none!important}'}</style></noscript>
    {visible ? <div key={run} className="site-intro" onPointerDown={() => setVisible(false)}
      onAnimationEnd={event => { if (event.animationName === 'intro-release') setVisible(false); }}>
      <div className="intro-panel intro-panel-top" aria-hidden="true" />
      <div className="intro-panel intro-panel-bottom" aria-hidden="true" />
      <div className="intro-composition" aria-hidden="true">
        <div className="intro-dial"><span className="intro-needle" /><span className="intro-pivot" /></div>
        <div className="intro-wordmark" dir="ltr"><span>EL</span><span>AMAL</span></div>
        <p className="intro-caption">{locale === 'ar' ? 'الدقة في كل اتصال.' : 'Precision at every connection.'}</p>
      </div>
      <button type="button" className="intro-skip" onClick={() => setVisible(false)}>{locale === 'ar' ? 'تخطي المقدمة' : 'Skip introduction'} <span aria-hidden="true">↗</span></button>
    </div> : null}
  </>;
}

export function IntroReplay({locale}: {locale: Locale}) {
  return <button type="button" className="intro-replay" onClick={() => window.dispatchEvent(new Event(replayEvent))}>
    {locale === 'ar' ? 'إعادة عرض المقدمة' : 'Replay introduction'}
  </button>;
}
