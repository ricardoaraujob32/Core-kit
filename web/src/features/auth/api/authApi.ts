// web/src/features/auth/api/authApi.ts

import type {
  LoginInput,
  LoginResponse,
  MeResponse,
  RefreshInput,
  RefreshResponse,
} from "../../../core/auth/types";
import { httpClient } from "../../../core/api/httpClient";

export async function login(input: LoginInput): Promise<LoginResponse> {
  return httpClient.post<LoginResponse, LoginInput>("/auth/login", input);
}

export async function me(): Promise<MeResponse> {
  return httpClient.get<MeResponse>("/auth/me");
}

export async function refresh(input: RefreshInput): Promise<RefreshResponse> {
  return httpClient.post<RefreshResponse, RefreshInput>(
    "/auth/refresh",
    input,
    {
      headers: {
        Authorization: "",
      },
    },
  );
}

export async function logout(): Promise<void> {
  return Promise.resolve();
}
