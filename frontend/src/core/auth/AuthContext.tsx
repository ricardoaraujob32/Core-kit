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
  HttpError,
  registerAccessTokenGetter,
  registerUnauthorizedHandler,
} from "../api/httpClient";

import { authStorage } from "./authStorage";
import {
  login as loginRequest,
  logout as logoutRequest,
  me as meRequest,
  refresh as refreshRequest,
  type LoginInput,
  type SessionUser,
} from "../../features/auth/api/authApi";

type AuthStatus = "idle" | "loading" | "authenticated" | "unauthenticated";

type AuthContextValue = {
  status: AuthStatus;
  isLoading: boolean;
  isAuthenticated: boolean;
  user: SessionUser | null;
  accessToken: string | null;
  login: (input: LoginInput) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: PropsWithChildren): JSX.Element {
  const [status, setStatus] = useState<AuthStatus>("idle");
  const [accessToken, setAccessToken] = useState<string | null>(
    authStorage.getAccessToken(),
  );
  const [user, setUser] = useState<SessionUser | null>(null);

  const clearSession = useCallback(() => {
    authStorage.clear();
    setAccessToken(null);
    setUser(null);
    setStatus("unauthenticated");
  }, []);

  const logout = useCallback(async () => {
    try {
      if (authStorage.getAccessToken()) {
        await logoutRequest();
      }
    } catch {
      // mesmo se a chamada falhar, a sessão local deve ser encerrada
    } finally {
      clearSession();
    }
  }, [clearSession]);

  const tryRefreshToken = useCallback(async (): Promise<boolean> => {
    const currentRefreshToken = authStorage.getRefreshToken();

    if (!currentRefreshToken) {
      return false;
    }

    try {
      const response = await refreshRequest(currentRefreshToken);

      authStorage.setAccessToken(response.accessToken);

      if (response.refreshToken) {
        authStorage.setRefreshToken(response.refreshToken);
      }

      setAccessToken(response.accessToken);
      return true;
    } catch {
      return false;
    }
  }, []);

  const refreshSession = useCallback(async () => {
    const storedAccessToken = authStorage.getAccessToken();

    if (!storedAccessToken) {
      clearSession();
      return;
    }

    setStatus("loading");

    try {
      const response = await meRequest();
      setAccessToken(authStorage.getAccessToken());
      setUser(response.usuario);
      setStatus("authenticated");
    } catch (error) {
      if (error instanceof HttpError && error.status === 401) {
        const refreshed = await tryRefreshToken();

        if (!refreshed) {
          clearSession();
          return;
        }

        try {
          const retryResponse = await meRequest();
          setAccessToken(authStorage.getAccessToken());
          setUser(retryResponse.usuario);
          setStatus("authenticated");
          return;
        } catch {
          clearSession();
          return;
        }
      }

      clearSession();
    }
  }, [clearSession, tryRefreshToken]);

  const login = useCallback(async (input: LoginInput): Promise<SessionUser> => {
    setStatus("loading");

    const response = await loginRequest(input);

    authStorage.setAccessToken(response.accessToken);

    if (response.refreshToken) {
      authStorage.setRefreshToken(response.refreshToken);
    }

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