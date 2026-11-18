"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { flushSync } from "react-dom";
import { Button } from "@/components/ui/button";
import { useMounted } from "@/hooks/use-mounted";

type ViewTransitionDocument = Document & {
  startViewTransition?: (callback: () => void) => { finished: Promise<void> };
};

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useMounted();
  const isDark = !mounted || resolvedTheme !== "light";

  const toggle = (event: React.MouseEvent<HTMLButtonElement>) => {
    const next = isDark ? "light" : "dark";
    const doc = document as ViewTransitionDocument;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!doc.startViewTransition || reduceMotion) {
      setTheme(next);
      return;
    }

    // Circular reveal from the button (see theme-reveal in globals.css).
    const root = document.documentElement;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    root.style.setProperty("--reveal-x", `${x}px`);
    root.style.setProperty("--reveal-y", `${y}px`);
    root.style.setProperty("--reveal-r", `${radius}px`);
    root.dataset.themeTransition = "";

    const transition = doc.startViewTransition(() => {
      flushSync(() => setTheme(next));
      root.classList.toggle("dark", next === "dark");
      root.classList.toggle("light", next === "light");
      root.style.colorScheme = next;
    });
    transition.finished.finally(() => {
      delete root.dataset.themeTransition;
    });
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      className="relative size-10 overflow-hidden rounded-xl sm:size-11"
      onClick={toggle}
      disabled={!mounted}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      title={isDark ? "Light theme" : "Dark theme"}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={isDark ? "sun" : "moon"}
          initial={{ rotate: -90, scale: 0.4, opacity: 0 }}
          animate={{ rotate: 0, scale: 1, opacity: 1 }}
          exit={{ rotate: 90, scale: 0.4, opacity: 0 }}
          transition={{ type: "spring", stiffness: 420, damping: 24 }}
          className="flex"
        >
          {isDark ? <Sun className="size-[18px]" /> : <Moon className="size-[18px]" />}
        </motion.span>
      </AnimatePresence>
    </Button>
  );
}
