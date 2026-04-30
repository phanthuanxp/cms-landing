import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

type StatusOption = {
  value: string;
  label: string;
};

export function DataTableToolbar({
  q,
  status,
  tenantId,
  statusOptions,
  children,
  searchPlaceholder = "Tim kiem...",
  allStatusLabel = "Tat ca trang thai",
  applyLabel = "Ap dung"
}: {
  q?: string;
  status?: string;
  tenantId?: string;
  statusOptions?: StatusOption[];
  children?: ReactNode;
  searchPlaceholder?: string;
  allStatusLabel?: string;
  applyLabel?: string;
}) {
  return (
    <form className="grid gap-3 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm lg:grid-cols-[minmax(0,1fr),180px,auto]">
      <Input defaultValue={q} name="q" placeholder={searchPlaceholder} />
      {statusOptions ? (
        <Select defaultValue={status} name="status">
          <option value="">{allStatusLabel}</option>
          {statusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      ) : (
        <div />
      )}
      <div className="flex flex-wrap items-center gap-2">
        {tenantId ? <input name="tenantId" type="hidden" value={tenantId} /> : null}
        <Button size="sm" type="submit" variant="outline">
          {applyLabel}
        </Button>
        {children}
      </div>
    </form>
  );
}
