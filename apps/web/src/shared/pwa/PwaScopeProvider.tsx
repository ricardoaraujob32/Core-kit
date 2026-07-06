// apps/web/src/shared/pwa/PwaScopeProvider.tsx

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  type ReactNode,
} from "react";
import { offlineStorage } from "./offlineStorage";
import {
  PWA_ANON_SCOPE,
  serializePwaScope,
  type PwaScope,
} from "./pwaScope";

const PWA_SCOPE_STORAGE_KEY = "corekit:pwa:scope";

type PwaScopeContextValue = {
  scope: PwaScope;
  scopeKey: string;
};

const PwaScopeContext = createContext<PwaScopeContextValue>({
  scope: PWA_ANON_SCOPE,
  scopeKey: serializePwaScope(PWA_ANON_SCOPE),
});

type PwaScopeProviderProps = {
  scope: PwaScope;
  children: ReactNode;
  clearResourceCacheOnScopeChange?: boolean;
};

export function PwaScopeProvider({
  scope,
  children,
  clearResourceCacheOnScopeChange = true,
}: PwaScopeProviderProps) {
  const scopeKey = useMemo(() => serializePwaScope(scope), [scope]);

  useEffect(() => {
    if (typeof localStorage === "undefined") return;

    const previousScopeKey = localStorage.getItem(PWA_SCOPE_STORAGE_KEY);

    if (
      clearResourceCacheOnScopeChange &&
      previousScopeKey &&
      previousScopeKey !== scopeKey
    ) {
      offlineStorage.clearCache();
    }

    localStorage.setItem(PWA_SCOPE_STORAGE_KEY, scopeKey);
  }, [clearResourceCacheOnScopeChange, scopeKey]);

  const value = useMemo(
    () => ({
      scope,
      scopeKey,
    }),
    [scope, scopeKey],
  );

  return (
    <PwaScopeContext.Provider value={value}>
      {children}
    </PwaScopeContext.Provider>
  );
}

export function usePwaScope() {
  return useContext(PwaScopeContext);
}
