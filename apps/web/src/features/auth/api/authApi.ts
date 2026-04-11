// web/src/features/auth/api/authApi.ts

import type { LoginInput, LoginResponse, LogoutInput, MeResponse, RefreshInput, RefreshResponse } from "../../../core/auth/tipos";
import { httpClient } from "../../../core/api/httpClient";

export async function login(input: LoginInput): Promise<LoginResponse> {
  return httpClient.post<LoginResponse, LoginInput>("/auth/login", input);
}

export async function me(): Promise<MeResponse> {
  return httpClient.get<MeResponse>("/auth/me", {
    skipAuthRetry: true,
  });
}

export async function refresh(input: RefreshInput): Promise<RefreshResponse> {
  return httpClient.post<RefreshResponse, RefreshInput>(
    "/auth/refresh",
    input,
    {
      headers: {
        Authorization: "",
      },
      skipAuthRetry: true,
    },
  );
}

export async function logout(input: LogoutInput): Promise<void> {
  return httpClient.post<void, LogoutInput>("/auth/logout", input, {
    headers: {
      Authorization: "",
    },
    skipAuthRetry: true,
  });
}
