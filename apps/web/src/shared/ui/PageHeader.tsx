// apps/web/src/shared/ui/PageHeader.tsx

import type { JSX, ReactNode } from "react";

type PageHeaderProps = { title: ReactNode; description?: ReactNode; actions?: ReactNode };

export function PageHeader({ title, description, actions }: PageHeaderProps): JSX.Element {
  return <div className="flex flex-wrap items-start justify-between gap-4"><div><h1 className="text-2xl font-semibold text-slate-900">{title}</h1>{description ? <p className="mt-1 text-sm text-slate-600">{description}</p> : null}</div>{actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}</div>;
}
