// frontend/src/core/auth/__tests__/AuthContext.test.tsx

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import type { PropsWithChildren } from "react";

import { AuthProvider, useAuth } from "../AuthContext";

vi.mock("../../../features/auth/api/authApi", () => ({
  login: vi.fn(),
  logout: vi.fn(),
  me: vi.fn(),
  refresh: vi.fn(),
}));

vi.mock("../authStorage", () => ({
  authStorage: {
    getAccessToken: vi.fn(),
    setAccessToken: vi.fn(),
    removeAccessToken: vi.fn(),
    getRefreshToken: vi.fn(),
    setRefreshToken: vi.fn(),
    removeRefreshToken: vi.fn(),
    clear: vi.fn(),
  },
}));

import {
  login as loginRequest,
  me as meRequest,
  refresh as refreshRequest,
} from "../../../features/auth/api/authApi";
import { authStorage } from "../authStorage";
import { HttpError } from "../../api/httpClient";

function TestComponent(): JSX.Element {
  const { status, isAuthenticated, user } = useAuth();

  return (
    <div>
      <span data-testid="status">{status}</span>
      <span data-testid="is-authenticated">
        {isAuthenticated ? "true" : "false"}
      </span>
      <span data-testid="user-id">{user?.usuarioId ?? ""}</span>
    </div>
  );
}

function Wrapper({ children }: PropsWithChildren): JSX.Element {
  return <AuthProvider>{children}</AuthProvider>;
}

describe("AuthContext", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deve iniciar como não autenticado quando não houver token", async () => {
    vi.mocked(authStorage.getAccessToken).mockReturnValue(null);

    render(<TestComponent />, { wrapper: Wrapper });

    await waitFor(() => {
      expect(screen.getByTestId("status").textContent).toBe("unauthenticated");
      expect(screen.getByTestId("is-authenticated").textContent).toBe("false");
    });
  });

  it("deve autenticar sessão quando /auth/me retornar usuário", async () => {
    vi.mocked(authStorage.getAccessToken).mockReturnValue("token-valido");
    vi.mocked(meRequest).mockResolvedValue({
      usuario: {
        usuarioId: "u1",
        locatarioId: "l1",
        isSuperAdmin: false,
        permissoes: ["usuarios.ler"],
        papeis: ["ADMIN"],
        email: "user@example.com",
      },
    });

    render(<TestComponent />, { wrapper: Wrapper });

    await waitFor(() => {
      expect(screen.getByTestId("status").textContent).toBe("authenticated");
      expect(screen.getByTestId("is-authenticated").textContent).toBe("true");
      expect(screen.getByTestId("user-id").textContent).toBe("u1");
    });
  });

  it("deve tentar refresh quando /auth/me retornar 401", async () => {
    vi.mocked(authStorage.getAccessToken).mockReturnValue("expired-token");
    vi.mocked(authStorage.getRefreshToken).mockReturnValue("refresh-token");

    vi.mocked(meRequest)
      .mockRejectedValueOnce(
        new HttpError({
          message: "Não autenticado",
          status: 401,
          code: "NAO_AUTENTICADO",
        }),
      )
      .mockResolvedValueOnce({
        usuario: {
          usuarioId: "u1",
          locatarioId: "l1",
          isSuperAdmin: false,
          permissoes: [],
          papeis: [],
        },
      });

    vi.mocked(refreshRequest).mockResolvedValue({
      accessToken: "new-access-token",
      refreshToken: "new-refresh-token",
    });

    render(<TestComponent />, { wrapper: Wrapper });

    await waitFor(() => {
      expect(refreshRequest).toHaveBeenCalledTimes(1);
      expect(screen.getByTestId("status").textContent).toBe("authenticated");
      expect(screen.getByTestId("user-id").textContent).toBe("u1");
    });
  });

  it("deve limpar sessão quando refresh falhar", async () => {
    vi.mocked(authStorage.getAccessToken).mockReturnValue("expired-token");
    vi.mocked(authStorage.getRefreshToken).mockReturnValue("refresh-token");

    vi.mocked(meRequest).mockRejectedValue(
      new HttpError({
        message: "Não autenticado",
        status: 401,
        code: "NAO_AUTENTICADO",
      }),
    );

    vi.mocked(refreshRequest).mockRejectedValue(
      new Error("refresh falhou"),
    );

    render(<TestComponent />, { wrapper: Wrapper });

    await waitFor(() => {
      expect(authStorage.clear).toHaveBeenCalled();
      expect(screen.getByTestId("status").textContent).toBe("unauthenticated");
    });
  });

  it("login deve armazenar tokens e autenticar usuário", async () => {
    function LoginCaller(): JSX.Element {
      const { login } = useAuth();

      return (
        <button
          onClick={() =>
            void login({
              email: "user@example.com",
              senha: "123456",
            })
          }
        >
          login
        </button>
      );
    }

    vi.mocked(authStorage.getAccessToken).mockReturnValue(null);

    vi.mocked(loginRequest).mockResolvedValue({
      accessToken: "access-token",
      refreshToken: "refresh-token",
      usuario: {
        usuarioId: "u1",
        locatarioId: "l1",
        isSuperAdmin: false,
        permissoes: [],
        papeis: [],
      },
    });

    render(
      <AuthProvider>
        <LoginCaller />
        <TestComponent />
      </AuthProvider>,
    );

    screen.getByRole("button", { name: /login/i }).click();

    await waitFor(() => {
      expect(authStorage.setAccessToken).toHaveBeenCalledWith("access-token");
      expect(authStorage.setRefreshToken).toHaveBeenCalledWith("refresh-token");
      expect(screen.getByTestId("status").textContent).toBe("authenticated");
    });
  });
});