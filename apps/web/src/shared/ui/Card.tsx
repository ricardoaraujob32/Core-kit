// apps/web/src/shared/ui/Card.tsx

import type { JSX, PropsWithChildren, ReactNode } from "react";

type CardProps = PropsWithChildren<{ title?: ReactNode; description?: ReactNode; actions?: ReactNode; className?: string; bodyClassName?: string }>;

export function Card({ title, description, actions, children, className = "", bodyClassName = "" }: CardProps): JSX.Element {
  const hasHeader = title || description || actions;
  return <section className={["rounded-2xl border bg-white shadow-sm", className].join(" ")}>{hasHeader ? <div className="flex flex-wrap items-start justify-between gap-4 border-b bg-slate-50 px-5 py-4"><div>{title ? <h2 className="text-lg font-semibold text-slate-900">{title}</h2> : null}{description ? <p className="mt-1 text-sm text-slate-600">{description}</p> : null}</div>{actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}</div> : null}<div className={["p-5", bodyClassName].join(" ")}>{children}</div></section>;
}
