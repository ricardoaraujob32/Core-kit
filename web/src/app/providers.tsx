// web/src/app/providers.tsx

import type { JSX, PropsWithChildren } from "react";
import { AuthProvider } from "../core/auth/authContext";
import { TenantThemeProvider } from "../core/tenant/tenantThemeProvider";
import { TenantProvider } from "../core/tenant/tenantContext";

export function AppProviders({ children }: PropsWithChildren): JSX.Element {
  return (
    <AuthProvider>
      <TenantProvider>
        <TenantThemeProvider>{children}</TenantThemeProvider>
      </TenantProvider>
    </AuthProvider>
  );
}