// frontend/src/core/tenant/TenantThemeProvider.tsx

import { useEffect, type PropsWithChildren } from "react";
import { useTenant } from "./TenantContext";

const DEFAULT_THEME = {
  primary: "#2563eb",
  secondary: "#1d4ed8",
  background: "#f8fafc",
  text: "#111827",
};

export function TenantThemeProvider({
  children,
}: PropsWithChildren): JSX.Element {
  const { branding } = useTenant();

  useEffect(() => {
    const root = document.documentElement;

    const primary = branding?.corPrimaria ?? DEFAULT_THEME.primary;
    const secondary = branding?.corSecundaria ?? DEFAULT_THEME.secondary;
    const background = branding?.corFundo ?? DEFAULT_THEME.background;
    const text = branding?.corTexto ?? DEFAULT_THEME.text;

    root.style.setProperty("--tenant-color-primary", primary);
    root.style.setProperty("--tenant-color-secondary", secondary);
    root.style.setProperty("--tenant-color-background", background);
    root.style.setProperty("--tenant-color-text", text);

    return () => {
      root.style.setProperty("--tenant-color-primary", DEFAULT_THEME.primary);
      root.style.setProperty("--tenant-color-secondary", DEFAULT_THEME.secondary);
      root.style.setProperty("--tenant-color-background", DEFAULT_THEME.background);
      root.style.setProperty("--tenant-color-text", DEFAULT_THEME.text);
    };
  }, [branding]);

  return <>{children}</>;
}