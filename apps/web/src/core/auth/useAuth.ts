// apps/web/src/core/auth/useAuth.ts

import { useContext } from "react";
import { AuthContext } from "./authContext";
import type { AuthContextValue } from "./tipos";

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth deve ser usado dentro de AuthProvider.");
  }
  return ctx;
}