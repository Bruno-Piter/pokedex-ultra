"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, type ReactNode } from "react";
import { ArtworkToggle } from "@/components/layout/artwork-toggle";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { useScrolledPast } from "@/hooks/use-window-scroll";
import { cn } from "@/lib/utils";

type HeaderProps = {
  /** Search field: inline from `sm`, on its own row on phones. */
  search?: ReactNode;
  /** Extra buttons shown before the theme/artwork toggles. */
  actions?: ReactNode;
};

/** Publishes the header height as --header-h for sticky elements below it. */
function useHeaderHeightVar(ref: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const update = () =>
      document.documentElement.style.setProperty(
        "--header-h",
        `${element.getBoundingClientRect().height}px`,
      );
    update();
    const observer = new ResizeObserver(update);
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref]);
}

export function Header({ search, actions }: HeaderProps) {
  const ref = useRef<HTMLElement>(null);
  const pathname = usePathname();
  const scrolled = useScrolledPast(8);
  useHeaderHeightVar(ref);

  return (
    <header
      ref={ref}
      style={{ viewTransitionName: "site-header" }}
      className={cn(
        "sticky top-0 z-40 pt-safe transition-[background-color,box-shadow,border-color] duration-300",
        "border-b bg-background/70 backdrop-blur-xl backdrop-saturate-150",
        scrolled
          ? "border-border/70 shadow-[0_8px_30px_-18px_rgb(0_0_0/0.6)]"
          : "border-transparent",
      )}
    >
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-2 px-safe sm:h-16 sm:gap-4 sm:px-6">
        <Link
          href="/"
          scroll={false}
          onClick={(event) => {
            if (pathname === "/") {
              event.preventDefault();
              window.scrollTo({ top: 0, behavior: "smooth" });
            }
          }}
          className="group flex shrink-0 items-center gap-2.5 rounded-xl pr-1 outline-none focus-visible:ring-3 focus-visible:ring-ring"
          aria-label="Pokédex Ultra — home"
        >
          <span className="relative size-9 overflow-hidden rounded-xl ring-1 ring-border/60 transition-transform duration-500 ease-[var(--ease-spring)] group-hover:rotate-[14deg] group-hover:scale-110 group-active:scale-95 sm:size-10">
            <Image src="/icon.png" alt="" fill sizes="40px" className="object-cover" priority />
          </span>
          <span className="hidden flex-col leading-none min-[380px]:flex">
            <span className="font-heading text-base font-bold tracking-tight sm:text-lg">
              Pokédex <span className="text-gradient-brand">Ultra</span>
            </span>
            <span className="mt-0.5 hidden text-[11px] text-muted-foreground sm:block">
              Every Pokémon, every detail
            </span>
          </span>
        </Link>

        <div className="hidden min-w-0 flex-1 justify-center sm:flex">
          {search ? <div className="w-full max-w-xl">{search}</div> : null}
        </div>
        <div className="flex-1 sm:hidden" />

        <div className="flex shrink-0 items-center gap-1">
          {actions}
          <ArtworkToggle />
          <ThemeToggle />
        </div>
      </div>

      {search ? (
        <div className="mx-auto max-w-7xl px-safe pb-3 sm:hidden">{search}</div>
      ) : null}
    </header>
  );
}
