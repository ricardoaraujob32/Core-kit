// apps/web/src/core/auth/authContext.tsx

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type PropsWithChildren, type JSX } from "react";
import { HttpError, registerAccessTokenGetter, registerRefreshSessionHandler, registerUnauthorizedHandler } from "../api/httpClient";
import { authStorage } from "./authStorage";
import { login as loginRequest, logout as logoutRequest, me as meRequest, refresh as refreshRequest } from "../../features/auth/api/authApi";
import type { AuthContextValue, LoginInput, SessionUser } from "./tipos";

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function normalizeUser(user: SessionUser): SessionUser {
  return {
    ...user,
    locatarioId: user.locatarioId ?? null,
    papeis: Array.isArray(user.papeis) ? user.papeis : [],
    permissoes: Array.isArray(user.permissoes) ? user.permissoes : [],
    modulosHabilitados: Array.isArray(user.modulosHabilitados)
      ? user.modulosHabilitados
      : [],
    isSuperAdmin: user.isSuperAdmin === true,
  };
}

export function AuthProvider({ children }: PropsWithChildren): JSX.Element {
  const [status, setStatus] = useState<AuthContextValue["status"]>("idle");
  const [accessToken, setAccessToken] = useState<string | null>(
    authStorage.getAccessToken(),
  );
  const [user, setUser] = useState<SessionUser | null>(authStorage.getUser());

  const clearSession = useCallback(() => {
    authStorage.clear();
    setAccessToken(null);
    setUser(null);
    setStatus("unauthenticated");
  }, []);

  const carregarUsuarioAutenticado = useCallback(async (): Promise<SessionUser> => {
    const meResponse = await meRequest();
    const normalizedUser = normalizeUser(meResponse.usuario);

    authStorage.setUser(normalizedUser);
    authStorage.setLocatarioId(normalizedUser.locatarioId ?? null);
    setUser(normalizedUser);

    return normalizedUser;
  }, []);

  const refreshTokens = useCallback(async (): Promise<boolean> => {
    const refreshToken = authStorage.getRefreshToken();

    const locatarioId = authStorage.getLocatarioId() ?? authStorage.getUser()?.locatarioId ?? null;

    if (!refreshToken) {
      return false;
    }

    try {
      const response = await refreshRequest({
        refreshToken,
        locatarioId,
      });

      authStorage.setAccessToken(response.accessToken);

      if (response.refreshToken) {
        authStorage.setRefreshToken(response.refreshToken);
      }

      if (locatarioId) {
        authStorage.setLocatarioId(locatarioId);
      }

      setAccessToken(response.accessToken);
      return true;
    } catch {
      return false;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      const refreshToken = authStorage.getRefreshToken();
      const locatarioId = user?.locatarioId ?? authStorage.getLocatarioId() ?? authStorage.getUser()?.locatarioId ?? null;

      if (refreshToken) {
        await logoutRequest({
          locatarioId,
          refreshToken,
        });
      }
    } catch {
      // noop
    } finally {
      clearSession();
    }
  }, [clearSession, user]);

  const refreshSession = useCallback(async () => {
    const storedAccessToken = authStorage.getAccessToken();

    if (!storedAccessToken) {
      clearSession();
      return;
    }

    setStatus("loading");

    try {
      await carregarUsuarioAutenticado();
      setAccessToken(authStorage.getAccessToken());
      setStatus("authenticated");
    } catch (error: unknown) {
      if (error instanceof HttpError && error.status === 401) {
        const refreshed = await refreshTokens();

        if (!refreshed) {
          clearSession();
          return;
        }

        try {
          await carregarUsuarioAutenticado();
          setAccessToken(authStorage.getAccessToken());
          setStatus("authenticated");
          return;
        } catch {
          clearSession();
          return;
        }
      }

      clearSession();
    }
  }, [carregarUsuarioAutenticado, clearSession, refreshTokens]);

  const login = useCallback(async (input: LoginInput): Promise<SessionUser> => {
    setStatus("loading");

    try {
      const response = await loginRequest(input);

      authStorage.setAccessToken(response.accessToken);

      if (response.refreshToken) {
        authStorage.setRefreshToken(response.refreshToken);
      } else {
        authStorage.removeRefreshToken();
      }

      setAccessToken(response.accessToken);

      const authenticatedUser = await carregarUsuarioAutenticado();
      setStatus("authenticated");

      return authenticatedUser;
    } catch (error) {
      clearSession();
      throw error;
    }
  }, [carregarUsuarioAutenticado, clearSession]);

  useEffect(() => {
    registerAccessTokenGetter(() => authStorage.getAccessToken());
    registerRefreshSessionHandler(() => refreshTokens());
    registerUnauthorizedHandler(() => {
      void logout();
    });

    return () => {
      registerRefreshSessionHandler(null);
      registerUnauthorizedHandler(null);
    };
  }, [logout, refreshTokens]);

  useEffect(() => {
    void refreshSession();
  }, [refreshSession]);

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      isLoading: status === "idle" || status === "loading",
      isAuthenticated: status === "authenticated",
      user,
      accessToken,
      login,
      logout,
      refreshSession,
    }),
    [status, user, accessToken, login, logout, refreshSession],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth deve ser usado dentro de AuthProvider");
  }

  return context;
}
