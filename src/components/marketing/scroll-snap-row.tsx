"use client";

import { useRef, type ReactNode } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

interface ScrollSnapRowProps {
  children: ReactNode;
  scrollPrevLabel: string;
  scrollNextLabel: string;
}

/**
 * Conteneur carrousel générique (scroll-snap CSS natif, extrait du pattern
 * déjà éprouvé sur `catalogue-showcase.tsx`) — réutilisable partout où un
 * défilement horizontal de cartes est nécessaire (tarifs Studio, futures
 * pages). Chaque enfant direct doit porter `data-scroll-item` +
 * `snap-start shrink-0` pour s'intégrer correctement au défilement.
 */
export function ScrollSnapRow({ children, scrollPrevLabel, scrollNextLabel }: ScrollSnapRowProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);

  const scrollByItems = (direction: 1 | -1) => {
    const el = scrollerRef.current;
    if (!el) return;
    const itemWidth = el.querySelector<HTMLElement>("[data-scroll-item]")?.offsetWidth ?? 280;
    el.scrollBy({ left: direction * (itemWidth + 16), behavior: "smooth" });
  };

  return (
    <div className="relative">
      <div className="pointer-events-none absolute top-[40%] right-0 left-0 z-10 hidden -translate-y-1/2 justify-between sm:flex">
        <button
          type="button"
          onClick={() => scrollByItems(-1)}
          aria-label={scrollPrevLabel}
          className="border-border bg-background/90 shadow-card pointer-events-auto -ml-4 flex size-9 items-center justify-center rounded-full border backdrop-blur transition hover:scale-105"
        >
          <ChevronLeftIcon className="size-4" aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={() => scrollByItems(1)}
          aria-label={scrollNextLabel}
          className="border-border bg-background/90 shadow-card pointer-events-auto -mr-4 flex size-9 items-center justify-center rounded-full border backdrop-blur transition hover:scale-105"
        >
          <ChevronRightIcon className="size-4" aria-hidden="true" />
        </button>
      </div>

      <div
        ref={scrollerRef}
        className="flex snap-x snap-mandatory [scrollbar-width:none] gap-4 overflow-x-auto scroll-smooth pb-4 [&::-webkit-scrollbar]:hidden"
      >
        {children}
      </div>
    </div>
  );
}
