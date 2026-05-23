"use client";

import { motion, useReducedMotion } from "framer-motion";

type TypeCardGlowProps = {
  colors: [string, string];
  size?: "sm" | "lg";
};

const BLOB_SIZES = {
  sm: { primary: "size-32", secondary: "size-36" },
  lg: { primary: "size-56", secondary: "size-64" },
};

export function TypeCardGlow({ colors, size = "sm" }: TypeCardGlowProps) {
  const [primary, secondary] = colors;
  const reduceMotion = useReducedMotion();
  const isDualType = primary !== secondary;
  const blobs = BLOB_SIZES[size];

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]">
      <motion.div
        className={`absolute ${blobs.primary} rounded-full opacity-50 mix-blend-screen blur-3xl transition-opacity duration-300 group-hover:opacity-70`}
        style={{ backgroundColor: primary, top: "-10%", left: "-10%" }}
        animate={
          reduceMotion
            ? { x: "10%", y: "10%" }
            : { x: ["-15%", "25%", "-15%"], y: ["-10%", "20%", "-10%"] }
        }
        transition={
          reduceMotion
            ? { duration: 0 }
            : {
                duration: 5,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut",
              }
        }
      />
      <motion.div
        className={`absolute ${blobs.secondary} rounded-full opacity-45 mix-blend-screen blur-3xl transition-opacity duration-300 group-hover:opacity-65`}
        style={{
          backgroundColor: secondary,
          bottom: "-10%",
          right: "-10%",
        }}
        animate={
          reduceMotion
            ? { x: "-10%", y: "-10%" }
            : {
                x: ["20%", "-20%", "20%"],
                y: isDualType
                  ? ["15%", "-15%", "15%"]
                  : ["-15%", "15%", "-15%"],
              }
        }
        transition={
          reduceMotion
            ? { duration: 0 }
            : {
                duration: isDualType ? 6 : 7,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut",
              }
        }
      />
    </div>
  );
}
