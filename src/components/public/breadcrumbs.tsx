import Link from "next/link";
import { ChevronRight } from "lucide-react";

type BreadcrumbItem = {
  name: string;
  href?: string;
};

export function PublicBreadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="Breadcrumb" className="overflow-x-auto">
      <ol className="inline-flex min-w-max items-center gap-2 rounded-full border border-stone-200/80 bg-white/75 px-3 py-2 text-sm text-stone-500 shadow-sm">
        {items.map((item, index) => (
          <li className="flex items-center gap-2" key={`${item.name}-${index}`}>
            {index > 0 ? <ChevronRight className="h-4 w-4 text-stone-300" /> : null}
            {item.href ? (
              <Link className="transition hover:text-stone-900" href={item.href}>
                {item.name}
              </Link>
            ) : (
              <span aria-current="page" className="font-medium text-stone-900">
                {item.name}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
