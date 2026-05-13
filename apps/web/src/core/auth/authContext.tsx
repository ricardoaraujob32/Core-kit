// apps/web/src/core/auth/authContext.tsx

import { createContext, useCallback, useEffect, useMemo, useState, type PropsWithChildren, type JSX } from "react";
import { registerAccessTokenGetter, registerRefreshSessionHandler, registerUnauthorizedHandler } from "../api/httpClient";
import { authStorage } from "./authStorage";
import { login as loginRequest, loginPlataforma as loginPlataformaRequest, logout as logoutRequest, me as meRequest, 
  refresh as refreshRequest } from "../../features/auth/api/authApi";
import type { AuthContextValue, LoginInput, LoginPlataformaInput, SessionUser } from "./tipos";

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function normalizeUser(user: SessionUser): SessionUser {
  return {
    usuarioId: user.usuarioId,
    locatarioId: user.locatarioId ?? null,
    perfil: user.perfil,
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

  const applySession = useCallback((params: {
    accessToken: string;
    refreshToken?: string;
    usuario: SessionUser;
  }): SessionUser => {
    const normalizedUser = normalizeUser(params.usuario);

    authStorage.setAccessToken(params.accessToken);
    authStorage.setUser(normalizedUser);
    authStorage.setLocatarioId(normalizedUser.locatarioId);

    if (params.refreshToken) {
      authStorage.setRefreshToken(params.refreshToken);
    } else {
      authStorage.removeRefreshToken();
    }

    setAccessToken(params.accessToken);
    setUser(normalizedUser);
    setStatus("authenticated");

    return normalizedUser;
  }, []);

  const carregarUsuarioAutenticado = useCallback(async (): Promise<SessionUser> => {
    const meResponse = await meRequest();
    const normalizedUser = normalizeUser(meResponse.usuario);

    authStorage.setUser(normalizedUser);
    authStorage.setLocatarioId(normalizedUser.locatarioId);
    setUser(normalizedUser);

    return normalizedUser;
  }, []);

  const refreshTokens = useCallback(async (): Promise<boolean> => {
    const currentUser = authStorage.getUser();

    if (currentUser?.perfil === "PLATAFORMA") {
      return false;
    }

    const refreshToken = authStorage.getRefreshToken();
    const locatarioId =
      authStorage.getLocatarioId() ?? currentUser?.locatarioId ?? null;

    if (!refreshToken) {
      return false;
    }

    try {
      const response = await refreshRequest({
        refreshToken,
        locatarioId,
      });

      authStorage.setAccessToken(response.accessToken);
      setAccessToken(response.accessToken);

      if (response.refreshToken) {
        authStorage.setRefreshToken(response.refreshToken);
      }

      return true;
    } catch {
      clearSession();
      return false;
    }
  }, [clearSession]);

  const login = useCallback(
    async (input: LoginInput): Promise<SessionUser> => {
      setStatus("loading");

      try {
        const response = await loginRequest(input);

        return applySession({
          accessToken: response.accessToken,
          refreshToken: response.refreshToken,
          usuario: response.usuario,
        });
      } catch (error) {
        clearSession();
        throw error;
      }
    },
    [applySession, clearSession],
  );

  const loginPlataforma = useCallback(
    async (input: LoginPlataformaInput): Promise<SessionUser> => {
      setStatus("loading");

      try {
        const response = await loginPlataformaRequest(input);

        return applySession({
          accessToken: response.accessToken,
          usuario: response.usuario,
        });
      } catch (error) {
        clearSession();
        throw error;
      }
    },
    [applySession, clearSession],
  );

  const logout = useCallback(async (): Promise<void> => {
    const refreshToken = authStorage.getRefreshToken();
    const locatarioId = authStorage.getLocatarioId();

    try {
      if (refreshToken && user?.perfil === "TENANT") {
        await logoutRequest({
          refreshToken,
          locatarioId,
        });
      }
    } finally {
      clearSession();
    }
  }, [clearSession, user]);

  useEffect(() => {
    registerAccessTokenGetter(() => authStorage.getAccessToken());
    registerRefreshSessionHandler(refreshTokens);
    registerUnauthorizedHandler(clearSession);

    return () => {
      registerAccessTokenGetter(() => null);
      registerRefreshSessionHandler(null);
      registerUnauthorizedHandler(null);
    };
  }, [clearSession, refreshTokens]);

  useEffect(() => {
    let ativo = true;

    async function bootstrap() {
      const token = authStorage.getAccessToken();

      if (!token) {
        if (ativo) {
          setStatus("unauthenticated");
        }
        return;
      }

      setStatus("loading");

      try {
        await carregarUsuarioAutenticado();

        if (ativo) {
          setStatus("authenticated");
        }
      } catch {
        if (ativo) {
          clearSession();
        }
      }
    }

    void bootstrap();

    return () => {
      ativo = false;
    };
  }, [carregarUsuarioAutenticado, clearSession]);

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      user,
      accessToken,
      isLoading: status === "idle" || status === "loading",
      isAuthenticated: status === "authenticated" && Boolean(user),
      login,
      loginPlataforma,
      logout,
      refreshTokens,
    }),
    [status, user, accessToken, login, loginPlataforma, logout, refreshTokens],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}