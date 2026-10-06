'use client';

import {useEffect, useRef, useState, type ReactNode} from 'react';
import type {Locale} from '@/lib/catalogue';

/** Pointer-driven only: no animation loop, scroll listener or 3D runtime. */
export function PrecisionDepth({children, locale}: {children: ReactNode; locale: Locale}) {
  const scene = useRef<HTMLDivElement>(null);
  const [capable, setCapable] = useState(false);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    const media = matchMedia('(min-width: 900px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)');
    const sync = () => setCapable(media.matches);
    sync();
    media.addEventListener('change', sync);
    return () => media.removeEventListener('change', sync);
  }, []);
  useEffect(() => {
    const art = scene.current;
    const hero = art?.closest('section');
    if (!art || !hero || !capable || paused) return;
    let frame = 0;
    const reset = () => {
      cancelAnimationFrame(frame);
      art.style.removeProperty('--precision-x');
      art.style.removeProperty('--precision-y');
    };
    const move = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return;
      const rect = hero.getBoundingClientRect();
      const x = Math.max(-.5, Math.min(.5, (event.clientX - rect.left) / rect.width - .5));
      const y = Math.max(-.5, Math.min(.5, (event.clientY - rect.top) / rect.height - .5));
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        art.style.setProperty('--precision-x', `${x * 18}px`);
        art.style.setProperty('--precision-y', `${y * 12}px`);
      });
    };
    hero.addEventListener('pointermove', move, {passive: true});
    hero.addEventListener('pointerleave', reset);
    document.addEventListener('visibilitychange', reset);
    return () => {
      reset();
      hero.removeEventListener('pointermove', move);
      hero.removeEventListener('pointerleave', reset);
      document.removeEventListener('visibilitychange', reset);
    };
  }, [capable, paused]);
  const ar = locale === 'ar';
  return <>
    <div ref={scene} className="precision-scene" data-paused={paused} aria-hidden="true">{children}</div>
    {capable && <button type="button" className="precision-motion" aria-pressed={paused}
      onClick={() => setPaused(value => !value)}>
      {paused ? (ar ? 'تشغيل الحركة' : 'Enable motion') : (ar ? 'إيقاف الحركة' : 'Pause motion')}
      <span aria-hidden="true">{paused ? '▷' : 'Ⅱ'}</span>
    </button>}
  </>;
}
