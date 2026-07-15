// apps/web/src/shared/pwa/pwaAuthSession.ts

export type PwaAuthSessionState = {
  isAuthenticated: boolean;
  hasAccessToken: boolean;
  hasUser: boolean;
  reason: string | null;
};

/**
 * Ajuste estas chaves se o seu projeto usa nomes diferentes.
 *
 * Pela conversa, já apareceu:
 *
 * localStorage.getItem("app.auth_user")
 */
const AUTH_USER_KEY = "app.auth_user";
const ACCESS_TOKEN_KEYS = [
  "app.access_token",
  "app.auth_token",
  "accessToken",
  "access_token",
];

function hasAnyAccessToken(): boolean {
  if (typeof localStorage === "undefined") return false;

  return ACCESS_TOKEN_KEYS.some((key) => {
    const value = localStorage.getItem(key);
    return Boolean(value && value.trim());
  });
}

function hasAuthUser(): boolean {
  if (typeof localStorage === "undefined") return false;

  const raw = localStorage.getItem(AUTH_USER_KEY);

  if (!raw) return false;

  try {
    const parsed = JSON.parse(raw);
    return Boolean(parsed?.usuarioId || parsed?.usuario?.usuarioId);
  } catch {
    return false;
  }
}

export function getPwaAuthSessionState(): PwaAuthSessionState {
  const hasAccessToken = hasAnyAccessToken();
  const hasUser = hasAuthUser();

  if (!hasUser) {
    return {
      isAuthenticated: false,
      hasAccessToken,
      hasUser,
      reason: "Usuário não encontrado no armazenamento local.",
    };
  }

  if (!hasAccessToken) {
    return {
      isAuthenticated: false,
      hasAccessToken,
      hasUser,
      reason: "Token de acesso não encontrado.",
    };
  }

  return {
    isAuthenticated: true,
    hasAccessToken,
    hasUser,
    reason: null,
  };
}
