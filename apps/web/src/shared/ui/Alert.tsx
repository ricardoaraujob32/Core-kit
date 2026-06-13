// apps/web/src/shared/ui/Alert.tsx

import type { JSX, PropsWithChildren } from "react";

type AlertVariant = "error" | "warning" | "success" | "info";
type AlertProps = PropsWithChildren<{ variant?: AlertVariant }>;

function variantClass(variant: AlertVariant): string {
  switch (variant) {
    case "error": return "border-red-200 bg-red-50 text-red-700";
    case "warning": return "border-yellow-200 bg-yellow-50 text-yellow-800";
    case "success": return "border-green-200 bg-green-50 text-green-700";
    case "info": default: return "border-blue-200 bg-blue-50 text-blue-700";
  }
}

export function Alert({ children, variant = "info" }: AlertProps): JSX.Element {
  return <div className={["rounded-xl border px-4 py-3 text-sm", variantClass(variant)].join(" ")}>{children}</div>;
}
