// frontend/src/features/auth/api/authApi.ts

import { LoginInput, LoginResponse, RefreshInput, RefreshResponse } from "frontend/src/core/auth/types";
import { httpClient } from "../../../core/api/httpClient";


export async function login(input: LoginInput): Promise<LoginResponse> {
  return httpClient.post<LoginResponse, LoginInput>("/auth/login", input);
}

// export async function login(data: {
//   email: string;
//   senha: string;
//   locatarioId?: string | null;
// }) {
//   return httpRequest("/auth/login", {
//     method: "POST",
//     body: JSON.stringify(data),
//   });
// }

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
  // O backend enviado não expõe logout dedicado.
  return Promise.resolve();
}
