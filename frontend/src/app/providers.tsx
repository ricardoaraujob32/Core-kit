// frontend/src/app/providers.tsx

import type { PropsWithChildren } from "react";
import { AuthProvider } from "../core/auth/AuthContext";
import { TenantProvider } from "../core/tenant/TenantContext";
import { TenantThemeProvider } from "../core/tenant/TenantThemeProvider";

export function AppProviders({ children }: PropsWithChildren): JSX.Element {
  return (
    <AuthProvider>
      <TenantProvider>
        <TenantThemeProvider>{children}</TenantThemeProvider>
      </TenantProvider>
    </AuthProvider>
  );
}