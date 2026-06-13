// apps/web/src/shared/ui/EmptyState.tsx

import type { JSX, ReactNode } from "react";

type Props = {
  title: string;
  description?: string;
  action?: ReactNode;
};

export function EmptyState({ title, description, action }: Props): JSX.Element {
  return (
    <div className="rounded-2xl border bg-white p-8 text-center">
      <div className="text-base font-semibold text-slate-900">{title}</div>

      {description ? (
        <p className="mx-auto mt-2 max-w-xl text-sm text-slate-600">
          {description}
        </p>
      ) : null}

      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
