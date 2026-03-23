// frontend/src/core/auth/AuthContext.tsx

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";

import {
  registerAccessTokenGetter,
  registerUnauthorizedHandler,
} from "../api/httpClient";

import { authStorage } from "./authStorage";
import {
  login as loginRequest,
  logout as logoutRequest,
  refresh as refreshRequest,
} from "../../features/auth/api/authApi";

import type {
  AuthContextValue,
  LoginInput,
  SessionUser,
} from "./types";

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

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

  const logout = useCallback(async () => {
    try {
      await logoutRequest();
    } catch {
      // noop
    } finally {
      clearSession();
    }
  }, [clearSession]);

  const refreshSession = useCallback(async () => {
    const storedRefreshToken = authStorage.getRefreshToken();
    const storedUser = authStorage.getUser();

    if (!storedRefreshToken || !storedUser) {
      clearSession();
      return;
    }

    setStatus("loading");

    try {
      const response = await refreshRequest({
        refreshToken: storedRefreshToken,
      });

      authStorage.setAccessToken(response.accessToken);
      authStorage.setRefreshToken(response.refreshToken);

      setAccessToken(response.accessToken);
      setUser(storedUser);
      setStatus("authenticated");
    } catch {
      clearSession();
    }
  }, [clearSession]);

  const login = useCallback(async (input: LoginInput): Promise<SessionUser> => {
    setStatus("loading");

    const response = await loginRequest(input);

    authStorage.setAccessToken(response.accessToken);
    authStorage.setRefreshToken(response.refreshToken);
    authStorage.setUser(response.usuario);

    setAccessToken(response.accessToken);
    setUser(response.usuario);
    setStatus("authenticated");

    return response.usuario;
  }, []);

  useEffect(() => {
    registerAccessTokenGetter(() => authStorage.getAccessToken());
    registerUnauthorizedHandler(() => {
      void logout();
    });

    return () => {
      registerUnauthorizedHandler(null);
    };
  }, [logout]);

  useEffect(() => {
    const token = authStorage.getAccessToken();
    const refreshToken = authStorage.getRefreshToken();
    const storedUser = authStorage.getUser();

    if (!token || !refreshToken || !storedUser) {
      clearSession();
      return;
    }

    setAccessToken(token);
    setUser(storedUser);
    setStatus("authenticated");
  }, [clearSession]);

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