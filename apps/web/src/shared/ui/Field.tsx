// apps/web/src/shared/ui/Field.tsx

import type { JSX, PropsWithChildren, ReactNode } from "react";

type FieldProps = PropsWithChildren<{ label: string; hint?: ReactNode; error?: ReactNode }>;

export function Field({ label, hint, error, children }: FieldProps): JSX.Element {
  return <label className="grid gap-1"><span className="text-sm font-medium text-slate-700">{label}</span>{children}{hint ? <span className="text-xs text-slate-500">{hint}</span> : null}{error ? <span className="text-xs text-red-600">{error}</span> : null}</label>;
}
