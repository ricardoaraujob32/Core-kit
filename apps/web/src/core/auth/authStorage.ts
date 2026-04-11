// web/src/core/auth/authStorage.ts

import type { SessionUser } from "./tipos";

const ACCESS_TOKEN_KEY = "app.access_token";
const REFRESH_TOKEN_KEY = "app.refresh_token";
const LOCATARIO_ID_KEY = "app.locatario_id";
const USER_KEY = "app.auth_user";

function safeGet(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSet(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    // storage não deve quebrar a aplicação
  }
}

function safeRemove(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch {
    // noop
  }
}

export const authStorage = {
  getAccessToken(): string | null {
    return safeGet(ACCESS_TOKEN_KEY);
  },

  setAccessToken(token: string): void {
    safeSet(ACCESS_TOKEN_KEY, token);
  },

  removeAccessToken(): void {
    safeRemove(ACCESS_TOKEN_KEY);
  },

  getRefreshToken(): string | null {
    return safeGet(REFRESH_TOKEN_KEY);
  },

  setRefreshToken(token: string): void {
    safeSet(REFRESH_TOKEN_KEY, token);
  },

  removeRefreshToken(): void {
    safeRemove(REFRESH_TOKEN_KEY);
  },

  getLocatarioId(): string | null {
    return safeGet(LOCATARIO_ID_KEY);
  },

  setLocatarioId(locatarioId: string | null): void {
    if (!locatarioId) {
      safeRemove(LOCATARIO_ID_KEY);
      return;
    }

    safeSet(LOCATARIO_ID_KEY, locatarioId);
  },

  removeLocatarioId(): void {
    safeRemove(LOCATARIO_ID_KEY);
  },

  getUser(): SessionUser | null {
    const raw = safeGet(USER_KEY);

    if (!raw) {
      return null;
    }

    try {
      return JSON.parse(raw) as SessionUser;
    } catch {
      return null;
    }
  },

  setUser(user: SessionUser): void {
    safeSet(USER_KEY, JSON.stringify(user));
  },

  removeUser(): void {
    safeRemove(USER_KEY);
  },

  clear(): void {
    safeRemove(ACCESS_TOKEN_KEY);
    safeRemove(REFRESH_TOKEN_KEY);
    safeRemove(USER_KEY);
  },
};