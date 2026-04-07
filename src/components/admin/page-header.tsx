import type { ReactNode } from "react";

export function AdminPageHeader({
  eyebrow,
  title,
  description,
  actions
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div className="space-y-2">
        {eyebrow ? <p className="text-xs uppercase tracking-[0.24em] text-stone-400">{eyebrow}</p> : null}
        <h1 className="text-3xl font-semibold tracking-tight text-stone-950">{title}</h1>
        {description ? <p className="max-w-3xl text-sm leading-7 text-stone-600">{description}</p> : null}
      </div>
      {actions}
    </div>
  );
}
