// apps/web/src/shared/ui/DescriptionList.tsx

import type { JSX, ReactNode } from "react";

export type DescriptionItem = { label: ReactNode; value: ReactNode };
type DescriptionListProps = { items: DescriptionItem[]; columns?: 1 | 2 | 3 };

function columnsClass(columns: 1 | 2 | 3): string {
  switch (columns) { case 3: return "md:grid-cols-3"; case 2: return "md:grid-cols-2"; case 1: default: return "md:grid-cols-1"; }
}

export function DescriptionList({ items, columns = 2 }: DescriptionListProps): JSX.Element {
  return <dl className={["grid gap-4 text-sm", columnsClass(columns)].join(" ")}>{items.map((item, index) => <div key={index} className="grid gap-1"><dt className="text-xs font-medium uppercase tracking-wide text-slate-500">{item.label}</dt><dd className="text-slate-900">{item.value}</dd></div>)}</dl>;
}
