// apps/web/src/shared/pwa/pwaAuthRefresh.ts

import { getPwaAuthSessionState } from "./pwaAuthSession";

export type PwaAuthRefreshResult = {
  ok: boolean;
  reason?: string;
};

export async function refreshPwaAuthSession(): Promise<PwaAuthRefreshResult> {
  const current = getPwaAuthSessionState();

  if (current.isAuthenticated) {
    return { ok: true };
  }

  const refreshToken =
    localStorage.getItem("app.refresh_token") ??
    localStorage.getItem("refreshToken") ??
    localStorage.getItem("refresh_token");

  if (!refreshToken) {
    return {
      ok: false,
      reason: "Refresh token não encontrado.",
    };
  }

  try {
    const response = await fetch("/api/auth/refresh", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      return {
        ok: false,
        reason: `Refresh retornou HTTP ${response.status}.`,
      };
    }

    const data = await response.json();

    const accessToken =
      data.accessToken ??
      data.access_token ??
      data.token ??
      null;

    const nextRefreshToken =
      data.refreshToken ??
      data.refresh_token ??
      null;

    const usuario =
      data.usuario ??
      data.user ??
      null;

    if (accessToken) {
      localStorage.setItem("app.access_token", accessToken);
    }

    if (nextRefreshToken) {
      localStorage.setItem("app.refresh_token", nextRefreshToken);
    }

    if (usuario) {
      localStorage.setItem("app.auth_user", JSON.stringify(usuario));
    }

    window.dispatchEvent(new CustomEvent("corekit:auth-changed"));

    return {
      ok: Boolean(accessToken),
      reason: accessToken ? undefined : "Refresh não retornou accessToken.",
    };
  } catch (error) {
    return {
      ok: false,
      reason:
        error instanceof Error
          ? error.message
          : "Falha desconhecida ao renovar sessão.",
    };
  }
}
