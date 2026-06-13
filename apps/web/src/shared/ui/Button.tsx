// apps/web/src/shared/ui/Button.tsx

import type { ButtonHTMLAttributes, JSX, PropsWithChildren } from "react";

type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";

type ButtonProps = PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant }>;

function variantClass(variant: ButtonVariant): string {
  switch (variant) {
    case "primary": return "border-transparent bg-slate-900 text-white hover:bg-slate-800";
    case "danger": return "border-red-200 bg-red-50 text-red-700 hover:bg-red-100";
    case "ghost": return "border-transparent text-slate-700 hover:bg-slate-100";
    case "secondary": default: return "border-slate-200 bg-white text-slate-700 hover:bg-slate-50";
  }
}

export function Button({ children, className = "", disabled, type = "button", variant = "secondary", ...props }: ButtonProps): JSX.Element {
  return <button {...props} className={["inline-flex items-center justify-center rounded-xl border px-4 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50", variantClass(variant), className].join(" ")} disabled={disabled} type={type}>{children}</button>;
}
