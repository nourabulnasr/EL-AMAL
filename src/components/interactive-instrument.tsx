"use client";
import { useRef } from "react";
import {
  LazyMotion,
  m,
  useMotionValue,
  useSpring,
  useScroll,
  useTransform,
} from "motion/react";
import { Instrument } from "./instrument";
const features = () => import("./motion-features").then((mod) => mod.default);
const spring = { stiffness: 95, damping: 22, mass: 0.7 };
/** Loaded only for a fine hover pointer, a wide viewport and normal motion preference. */
export default function InteractiveInstrument() {
  const ref = useRef<HTMLDivElement>(null),
    x = useMotionValue(0),
    y = useMotionValue(0);
  const rotateX = useSpring(y, spring),
    rotateY = useSpring(x, spring);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const progress = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });
  const scale = useTransform(progress, [0, 1], [1, 0.88]),
    drift = useTransform(progress, [0, 1], [0, 45]);
  return (
    <LazyMotion features={features} strict>
      <div
        ref={ref}
        className="instrument-interaction"
        onPointerMove={(event) => {
          const r = event.currentTarget.getBoundingClientRect();
          x.set(((event.clientX - r.left) / r.width - 0.5) * 18);
          y.set(-((event.clientY - r.top) / r.height - 0.5) * 14);
        }}
        onPointerLeave={() => {
          x.set(0);
          y.set(0);
        }}
      >
        <m.div className="instrument-parallax" style={{ scale, y: drift }}>
          <m.div
            className="instrument-tilt"
            style={{ rotateX, rotateY, transformPerspective: 1000 }}
          >
            <Instrument />
          </m.div>
        </m.div>
      </div>
    </LazyMotion>
  );
}
