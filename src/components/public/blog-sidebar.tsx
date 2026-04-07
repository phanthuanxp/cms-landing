import Link from "next/link";
import { ArrowRight, Search } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Category = {
  id: string;
  name: string;
  slug: string;
};

export function BlogSidebar({
  categories,
  query
}: {
  categories: Category[];
  query?: string;
}) {
  return (
    <aside className="space-y-6 rounded-[2rem] border border-stone-200/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.95),rgba(251,249,245,0.92))] p-5 shadow-[0_18px_40px_rgba(28,25,23,0.06)] sm:p-6">
      <form className="space-y-3">
        <label className="block text-[11px] font-medium uppercase tracking-[0.24em] text-stone-500" htmlFor="blog-query">
          Tim bai viet
        </label>
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
          <Input className="h-12 rounded-2xl border-stone-200 bg-white pl-10" defaultValue={query} id="blog-query" name="q" placeholder="SEO, landing page, CRM..." />
        </div>
        <Button className="w-full rounded-xl" type="submit" variant="secondary">
          Tim kiem
        </Button>
      </form>
      <div className="space-y-3">
        <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-stone-500">Chuyen muc</p>
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <Badge className="rounded-full border border-stone-200 bg-white px-3 py-1.5 text-stone-700 shadow-sm" key={category.id}>
              <Link href={`/blog/${category.slug}`}>{category.name}</Link>
            </Badge>
          ))}
        </div>
      </div>
      <div className="rounded-[1.75rem] border border-stone-200/80 bg-stone-950 p-5 text-stone-200 shadow-lg">
        <p className="text-xs uppercase tracking-[0.24em] text-teal-200">CTA</p>
        <h3 className="mt-2 text-lg font-semibold text-white">Can team tu van nhanh?</h3>
        <p className="mt-2 text-sm leading-7 text-stone-300">De lai thong tin de nhan giai phap landing page va blog chuan SEO.</p>
        <Button asChild className="mt-4 rounded-xl" size="sm" variant="secondary">
          <Link href="/#contact">
            Nhan tu van
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </aside>
  );
}
