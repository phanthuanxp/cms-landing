import type { Route } from "next";
import Link from "next/link";

import { Button } from "@/components/ui/button";

function createUrl(basePath: string, params: URLSearchParams, page: number) {
  const nextParams = new URLSearchParams(params);
  nextParams.set("page", String(page));
  return `${basePath}?${nextParams.toString()}` as Route;
}

export function PaginationLinks({
  basePath,
  page,
  pageCount,
  params
}: {
  basePath: string;
  page: number;
  pageCount: number;
  params: URLSearchParams;
}) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-stone-200 bg-white px-4 py-3 shadow-sm">
      <span className="text-sm text-stone-500">
        Trang {page} / {pageCount}
      </span>
      <div className="flex gap-2">
        <Button asChild disabled={page <= 1} size="sm" variant="outline">
          <Link href={createUrl(basePath, params, Math.max(1, page - 1))}>Trang truoc</Link>
        </Button>
        <Button asChild disabled={page >= pageCount} size="sm" variant="outline">
          <Link href={createUrl(basePath, params, Math.min(pageCount, page + 1))}>Trang sau</Link>
        </Button>
      </div>
    </div>
  );
}
