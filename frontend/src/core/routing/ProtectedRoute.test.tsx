// frontend/src/core/routing/__tests__/ProtectedRoute.test.tsx

import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";

import ProtectedRoute from "../ProtectedRoute";

vi.mock("../../auth/useAuth", () => ({
  useAuth: vi.fn(),
}));

import { useAuth } from "../../auth/useAuth";

describe("ProtectedRoute", () => {
  it("deve renderizar conteúdo quando autenticado", () => {
    vi.mocked(useAuth).mockReturnValue({
      status: "authenticated",
      isLoading: false,
      isAuthenticated: true,
      user: {
        usuarioId: "u1",
        isSuperAdmin: false,
        locatarioId: "l1",
        permissoes: [],
        papeis: [],
      },
      accessToken: "token",
      login: vi.fn(),
      logout: vi.fn(),
      refreshSession: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={["/app"]}>
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route path="/app" element={<div>Área protegida</div>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText("Área protegida")).toBeInTheDocument();
  });

  it("deve redirecionar para login quando não autenticado", () => {
    vi.mocked(useAuth).mockReturnValue({
      status: "unauthenticated",
      isLoading: false,
      isAuthenticated: false,
      user: null,
      accessToken: null,
      login: vi.fn(),
      logout: vi.fn(),
      refreshSession: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={["/app"]}>
        <Routes>
          <Route path="/login" element={<div>Login</div>} />
          <Route element={<ProtectedRoute />}>
            <Route path="/app" element={<div>Área protegida</div>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText("Login")).toBeInTheDocument();
  });
});