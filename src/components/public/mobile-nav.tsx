"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Menu, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type MenuItem = {
  id: string;
  label: string;
  href: string;
  target?: string | null;
};

export function MobileNav({
  items,
  siteName
}: {
  items: MenuItem[];
  siteName: string;
}) {
  const [open, setOpen] = useState(false);
  const panelId = "mobile-navigation-panel";

  return (
    <div className="relative md:hidden">
      <Button
        aria-controls={panelId}
        aria-expanded={open}
        aria-label={open ? "Dong menu" : "Mo menu"}
        className="h-11 w-11 rounded-full border-stone-300 bg-white/80 shadow-sm"
        onClick={() => setOpen((value) => !value)}
        size="sm"
        type="button"
        variant="outline"
      >
        {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
      </Button>
      <div
        id={panelId}
        aria-hidden={!open}
        className={cn(
          "absolute right-0 top-[calc(100%+0.75rem)] z-50 w-[min(24rem,calc(100vw-2rem))] origin-top-right rounded-[2rem] border border-stone-200/90 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(250,248,244,0.96))] p-4 shadow-[0_24px_60px_rgba(28,25,23,0.14)] transition duration-200",
          open ? "pointer-events-auto scale-100 opacity-100" : "pointer-events-none scale-95 opacity-0"
        )}
      >
        <div className="mb-4 rounded-[1.5rem] border border-stone-200/90 bg-white/80 p-4">
          <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-stone-500">Menu dieu huong</p>
          <p className="mt-2 text-lg font-semibold tracking-[-0.03em] text-stone-950">{siteName}</p>
        </div>
        <nav aria-label="Mobile navigation" className="flex flex-col gap-2">
          {items.map((item) => (
            <Link
              className="flex items-center justify-between rounded-[1.35rem] border border-transparent bg-white/80 px-4 py-3.5 text-sm font-medium text-stone-700 transition hover:border-stone-200 hover:bg-stone-50 hover:text-stone-950"
              href={item.href}
              key={item.id}
              onClick={() => setOpen(false)}
              rel={item.target === "_blank" ? "noopener noreferrer" : undefined}
              target={item.target ?? undefined}
            >
              {item.label}
              <ArrowRight className="h-4 w-4 text-stone-400" />
            </Link>
          ))}
          <Button asChild className="mt-3 rounded-[1.35rem]" onClick={() => setOpen(false)}>
            <Link href="#contact">Nhan tu van</Link>
          </Button>
        </nav>
      </div>
    </div>
  );
}
