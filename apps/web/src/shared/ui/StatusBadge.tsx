// apps/web/src/shared/ui/StatusBadge.tsx

import type { JSX } from "react";

type Props = {
  value: string;
};

function statusClass(value: string): string {
  const normalized = value.trim().toUpperCase();

  if (normalized === "CONCLUIDA" || normalized === "ATIVO") {
    return "border-green-200 bg-green-50 text-green-700";
  }

  if (normalized === "CANCELADA" || normalized === "ENCERRADO") {
    return "border-red-200 bg-red-50 text-red-700";
  }

  if (
    normalized === "ABERTA" ||
    normalized === "RASCUNHO" ||
    normalized === "EM_PROCESSAMENTO" ||
    normalized === "AGUARDANDO_PAGAMENTO"
  ) {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }

  return "border-slate-200 bg-slate-50 text-slate-700";
}

export function StatusBadge({ value }: Props): JSX.Element {
  return (
    <span
      className={[
        "inline-flex rounded-full border px-2 py-1 text-xs font-medium",
        statusClass(value),
      ].join(" ")}
    >
      {value}
    </span>
  );
}
