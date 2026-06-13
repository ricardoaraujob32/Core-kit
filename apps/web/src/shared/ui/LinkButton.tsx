// apps/web/src/shared/ui/LinkButton.tsx

import type { JSX, PropsWithChildren } from "react";
import { Link, type LinkProps } from "react-router-dom";

type LinkButtonVariant = "primary" | "secondary" | "danger" | "ghost";
type LinkButtonProps = PropsWithChildren<LinkProps & { variant?: LinkButtonVariant }>;

function variantClass(variant: LinkButtonVariant): string {
  switch (variant) {
    case "primary": return "border-transparent bg-slate-900 text-white hover:bg-slate-800";
    case "danger": return "border-red-200 bg-red-50 text-red-700 hover:bg-red-100";
    case "ghost": return "border-transparent text-slate-700 hover:bg-slate-100";
    case "secondary": default: return "border-slate-200 bg-white text-slate-700 hover:bg-slate-50";
  }
}

export function LinkButton({ children, className = "", variant = "secondary", ...props }: LinkButtonProps): JSX.Element {
  return <Link {...props} className={["inline-flex items-center justify-center rounded-xl border px-4 py-2 text-sm font-medium transition", variantClass(variant), className].join(" ")}>{children}</Link>;
}
