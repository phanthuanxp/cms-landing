import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";

export function CtaBanner({
  title,
  description,
  primaryLabel = "Nhan tu van",
  primaryHref = "/#contact"
}: {
  title: string;
  description: string;
  primaryLabel?: string;
  primaryHref?: string;
}) {
  return (
    <section className="overflow-hidden rounded-[2rem] border border-stone-200/80 bg-[linear-gradient(135deg,#181512_0%,#29221d_58%,#0f3d39_100%)] px-6 py-8 text-white shadow-[0_24px_60px_rgba(28,25,23,0.18)] sm:px-10 sm:py-10">
      <div className="absolute" />
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="max-w-2xl space-y-3">
          <p className="text-xs uppercase tracking-[0.24em] text-teal-200">Next step</p>
          <h2 className="text-balance text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">{title}</h2>
          <p className="text-sm leading-7 text-stone-300 sm:text-base">{description}</p>
        </div>
        <Button asChild className="rounded-full px-6 shadow-md" size="lg" variant="secondary">
          <Link href={primaryHref}>
            {primaryLabel}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </section>
  );
}
