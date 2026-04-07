import Link from "next/link";
import { ArrowRight, ArrowUpRight, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MobileNav } from "@/components/public/mobile-nav";

type MenuItem = {
  id: string;
  label: string;
  href: string;
  target?: string | null;
};

type SiteShellProps = {
  tenant: {
    siteName: string;
    businessDescription?: string | null;
    businessPhone?: string | null;
    businessEmail?: string | null;
  };
  currentHost?: string;
  primaryMenu?: {
    items: MenuItem[];
  } | null;
  footerMenu?: {
    items: MenuItem[];
  } | null;
  children: React.ReactNode;
};

export function SiteShell({ tenant, currentHost, primaryMenu, footerMenu, children }: SiteShellProps) {
  const navItems = primaryMenu?.items ?? [];
  const footerItems = footerMenu?.items ?? [];

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(15,118,110,0.1),transparent_24%),radial-gradient(circle_at_top_right,rgba(217,119,6,0.08),transparent_20%),linear-gradient(180deg,#f7f4ef_0%,#f2eee8_100%)] text-stone-950">
      <header className="sticky top-0 z-40 border-b border-stone-200/70 bg-[rgba(247,244,239,0.82)] backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-stone-950 text-stone-50 shadow-lg shadow-stone-950/10">
              <Sparkles className="mr-1 h-3.5 w-3.5" />
            </div>
            <div className="min-w-0 space-y-1">
              <Badge className="w-fit rounded-full border border-teal-200/70 bg-teal-50/80 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.24em] text-teal-800">
                Premium CMS
              </Badge>
              <Link className="block truncate text-lg font-semibold tracking-[-0.03em] text-stone-950 sm:text-xl" href="/">
                {tenant.siteName}
              </Link>
            </div>
          </div>
          <nav aria-label="Primary navigation" className="hidden items-center gap-1 rounded-full border border-stone-200/80 bg-white/75 p-1.5 text-sm font-medium text-stone-600 shadow-sm md:flex">
            {navItems.map((item) => (
              <Link
                className="rounded-full px-4 py-2.5 transition hover:bg-stone-100 hover:text-stone-950"
                href={item.href}
                key={item.id}
                rel={item.target === "_blank" ? "noopener noreferrer" : undefined}
                target={item.target ?? undefined}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <Button asChild className="hidden rounded-full px-5 shadow-sm sm:inline-flex">
              <Link href="#contact">
                Nhan tu van
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </Button>
            <MobileNav items={navItems} siteName={tenant.siteName} />
          </div>
        </div>
      </header>
      <main className="pb-10">{children}</main>
      <footer className="border-t border-stone-200/70 bg-[#191613] text-stone-200">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.35fr,0.8fr,0.9fr]">
          <div className="space-y-5">
            <Badge className="w-fit rounded-full border border-stone-700 bg-stone-900 px-3 py-1 text-[11px] uppercase tracking-[0.24em] text-stone-300">
              Conversion-first experience
            </Badge>
            <div className="space-y-3">
              <h2 className="text-2xl font-semibold tracking-[-0.03em] text-white">{tenant.siteName}</h2>
              <p className="max-w-2xl text-sm leading-7 text-stone-400">
                {tenant.businessDescription ?? "Landing pages va blog duoc toi uu cho readability, mobile va lead generation."}
              </p>
            </div>
            <div className="grid gap-2 text-sm text-stone-400 sm:grid-cols-2">
              <p>{tenant.businessPhone ?? "Hotline dang cap nhat"}</p>
              <p>{tenant.businessEmail ?? "Email dang cap nhat"}</p>
              {currentHost ? <p>Domain hien tai: {currentHost}</p> : null}
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-[0.24em] text-stone-500">Dieu huong</h3>
            <div className="grid gap-2 text-sm">
              {footerItems.map((item) => (
                <Link
                  className="inline-flex items-center justify-between rounded-2xl border border-stone-800 bg-stone-900/60 px-4 py-3 transition hover:border-stone-700 hover:text-white"
                  href={item.href}
                  key={item.id}
                  rel={item.target === "_blank" ? "noopener noreferrer" : undefined}
                  target={item.target ?? undefined}
                >
                  {item.label}
                  <ArrowRight className="h-4 w-4 text-stone-500" />
                </Link>
              ))}
              <Link className="inline-flex items-center justify-between rounded-2xl border border-stone-800 bg-stone-900/60 px-4 py-3 transition hover:border-stone-700 hover:text-white" href="/blog">
                Blog
                <ArrowRight className="h-4 w-4 text-stone-500" />
              </Link>
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-[0.24em] text-stone-500">Bat dau nhanh</h3>
            <div className="rounded-[1.75rem] border border-stone-800 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] p-5 shadow-xl shadow-black/10">
              <p className="text-xs uppercase tracking-[0.24em] text-teal-300">Ready for conversion</p>
              <h4 className="mt-3 text-xl font-semibold text-white">Mo contact section va thu lead ngay</h4>
              <p className="mt-3 text-sm leading-7 text-stone-300">
                CTA duoc giu ro rang, semantic va toi uu mobile de giup nguoi dung hanh dong nhanh hon.
              </p>
              <Button asChild className="mt-5 w-full rounded-xl" size="sm" variant="secondary">
                <Link href="/#contact">Mo contact form</Link>
              </Button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
