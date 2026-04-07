import { Badge } from "@/components/ui/badge";

export function SectionIntro({
  eyebrow,
  title,
  description,
  centered = false
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  centered?: boolean;
}) {
  return (
    <div className={centered ? "mx-auto max-w-3xl space-y-4 text-center" : "space-y-4"}>
      {eyebrow ? (
        <Badge className="w-fit rounded-full border border-teal-200/70 bg-teal-50/80 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.24em] text-teal-800">
          {eyebrow}
        </Badge>
      ) : null}
      <div className="space-y-3">
        <h2 className="text-balance text-3xl font-semibold tracking-[-0.04em] text-stone-950 sm:text-4xl lg:text-[2.65rem]">
          {title}
        </h2>
        {description ? <p className="max-w-3xl text-pretty text-[15px] leading-8 text-stone-600 sm:text-base">{description}</p> : null}
      </div>
    </div>
  );
}
