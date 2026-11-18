"use client";

import { animate, motion, useMotionValue, useTransform } from "framer-motion";
import { useEffect } from "react";

type AnimatedNumberProps = {
  value: number;
  /** Starting value on mount (defaults to `value`, i.e. no initial count). */
  from?: number;
  className?: string;
  duration?: number;
};

/** Counts smoothly from the previous value to the new one. */
export function AnimatedNumber({ value, from, className, duration = 0.6 }: AnimatedNumberProps) {
  const motionValue = useMotionValue(from ?? value);
  const display = useTransform(motionValue, (latest) =>
    Math.round(latest).toLocaleString("en-US"),
  );

  useEffect(() => {
    const controls = animate(motionValue, value, { duration, ease: [0.16, 1, 0.3, 1] });
    return () => controls.stop();
  }, [motionValue, value, duration]);

  return <motion.span className={className}>{display}</motion.span>;
}
