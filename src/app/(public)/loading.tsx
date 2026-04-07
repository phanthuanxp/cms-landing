import { Skeleton } from "@/components/ui/skeleton";

export default function PublicLoading() {
  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-10 sm:px-6 sm:py-14">
      <Skeleton className="h-5 w-32" />
      <Skeleton className="h-20 w-full rounded-[2rem]" />
      <div className="grid gap-6 lg:grid-cols-[0.8fr,2fr]">
        <Skeleton className="h-80 rounded-[2rem]" />
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-72 rounded-[2rem]" />
          <Skeleton className="h-72 rounded-[2rem]" />
          <Skeleton className="h-72 rounded-[2rem]" />
          <Skeleton className="h-72 rounded-[2rem]" />
        </div>
      </div>
    </div>
  );
}
