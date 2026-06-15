// apps/web/src/core/tenant/tenantContext.tsx

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";

import { HttpError } from "../api/httpClient";
import { useAuth } from "../auth/useAuth";
import { isSuperAdmin } from "../auth/tipos";
import { getTenantConfiguracaoAtiva } from "./tenantApi";
import {
  buildFallbackTenantBranding,
  mapConfiguracaoAtivaToTenantBranding,
  normalizeTenantBranding,
} from "./tenantBranding";
import type { TenantBranding, TenantContextValue } from "./tipos";

const TenantContext = createContext<TenantContextValue | undefined>(undefined);

export function TenantProvider({ children }: PropsWithChildren) {
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();

  const [branding, setBranding] = useState<TenantBranding | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const refreshBranding = useCallback(async () => {
    if (
      !isAuthenticated ||
      !user ||
      isSuperAdmin(user) ||
      !user.locatarioId
    ) {
      setBranding(null);
      return;
    }

    setIsLoading(true);

    try {
      const response = await getTenantConfiguracaoAtiva();

      setBranding(
        normalizeTenantBranding(
          mapConfiguracaoAtivaToTenantBranding(response.item),
        ),
      );
    } catch (error) {
      if (error instanceof HttpError) {
        setBranding(buildFallbackTenantBranding(user.locatarioId));
        return;
      }

      setBranding(buildFallbackTenantBranding(user.locatarioId));
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    if (isAuthLoading) return;

    void refreshBranding();
  }, [isAuthLoading, refreshBranding]);

  const value = useMemo<TenantContextValue>(
    () => ({
      branding,
      isLoading,
      refreshBranding,
    }),
    [branding, isLoading, refreshBranding],
  );

  return (
    <TenantContext.Provider value={value}>
      {children}
    </TenantContext.Provider>
  );
}

export function useTenant(): TenantContextValue {
  const context = useContext(TenantContext);

  if (!context) {
    throw new Error("useTenant deve ser usado dentro de TenantProvider");
  }

  return context;
}
