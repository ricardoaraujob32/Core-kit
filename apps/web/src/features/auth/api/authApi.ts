// apps/web/src/features/auth/api/authApi.ts

import { httpClient } from "../../../core/api/httpClient";
import {
  LoginInput,
  LoginPlataformaInput,
  LoginPlataformaResponse,
  LoginResponse,
  LogoutInput,
  MeResponse,
  RefreshInput,
  RefreshResponse,
} from "../../../core/auth/tipos";

export async function login(input: LoginInput): Promise<LoginResponse> {
  return httpClient.post<LoginResponse, LoginInput>("/auth/login", input);
}

export async function loginPlataforma(
  input: LoginPlataformaInput,
): Promise<LoginPlataformaResponse> {
  return httpClient.post<LoginPlataformaResponse, LoginPlataformaInput>(
    "/auth/plataforma/login",
    input,
    { skipAuthRetry: true },
  );
}

export async function me(): Promise<MeResponse> {
  return httpClient.get<MeResponse>("/auth/me", { skipAuthRetry: true });
}

export async function refresh(input: RefreshInput): Promise<RefreshResponse> {
  return httpClient.post<RefreshResponse, RefreshInput>(
    "/auth/refresh",
    input,
    {
      headers: { Authorization: "" },
      skipAuthRetry: true,
    },
  );
}

export async function refreshPlataforma(input: {
  refreshToken: string;
}): Promise<RefreshResponse> {
  return httpClient.post<RefreshResponse, { refreshToken: string }>(
    "/auth/plataforma/refresh",
    input,
    {
      headers: { Authorization: "" },
      skipAuthRetry: true,
    },
  );
}

export async function logout(input: LogoutInput): Promise<void> {
  return httpClient.post<void, LogoutInput>("/auth/logout", input, {
    headers: { Authorization: "" },
    skipAuthRetry: true,
  });
}

export async function logoutPlataforma(input: {
  refreshToken: string;
}): Promise<void> {
  return httpClient.post<void, { refreshToken: string }>(
    "/auth/plataforma/logout",
    input,
    {
      headers: { Authorization: "" },
      skipAuthRetry: true,
    },
  );
}
