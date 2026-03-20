// frontend/src/features/auth/api/authApi.ts

import { httpClient } from "../../../core/api/httpClient";

export type SessionUser = {
  usuarioId: string;
  locatarioId?: string | null;
  isSuperAdmin: boolean;
  permissoes: string[];
  papeis: string[];
  nome?: string;
  email?: string;
};

export type LoginInput = {
  email: string;
  senha: string;
};

export type LoginResponse = {
  accessToken: string;
  refreshToken?: string;
  usuario: SessionUser;
};

export type MeResponse = {
  usuario: SessionUser;
};

export type RefreshResponse = {
  accessToken: string;
  refreshToken?: string;
};

export async function login(input: LoginInput): Promise<LoginResponse> {
  return httpClient.post<LoginResponse, LoginInput>("/auth/login", input);
}

export async function me(): Promise<MeResponse> {
  return httpClient.get<MeResponse>("/auth/me");
}

export async function refresh(refreshToken: string): Promise<RefreshResponse> {
  return httpClient.post<RefreshResponse, { refreshToken: string }>(
    "/auth/refresh",
    { refreshToken },
    {
      headers: {
        Authorization: "",
      },
    },
  );
}

export async function logout(): Promise<void> {
  await httpClient.post<void, Record<string, never>>("/auth/logout", {});
}