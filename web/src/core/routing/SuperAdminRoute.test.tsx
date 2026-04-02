// frontend/src/core/routing/__tests__/SuperAdminRoute.test.tsx

import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";

import SuperAdminRoute from "../SuperAdminRoute";

vi.mock("../../auth/useAuth", () => ({
  useAuth: vi.fn(),
}));

import { useAuth } from "../../auth/useAuth";

describe("SuperAdminRoute", () => {
  it("deve permitir acesso para superadmin", () => {
    vi.mocked(useAuth).mockReturnValue({
      status: "authenticated",
      isLoading: false,
      isAuthenticated: true,
      user: {
        usuarioId: "u1",
        locatarioId: null,
        isSuperAdmin: true,
        permissoes: [],
        papeis: ["SUPERADMIN"],
      },
      accessToken: "token",
      login: vi.fn(),
      logout: vi.fn(),
      refreshSession: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={["/superadmin"]}>
        <Routes>
          <Route element={<SuperAdminRoute />}>
            <Route path="/superadmin" element={<div>Dashboard SuperAdmin</div>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText("Dashboard SuperAdmin")).toBeInTheDocument();
  });

  it("deve bloquear usuário comum", () => {
    vi.mocked(useAuth).mockReturnValue({
      status: "authenticated",
      isLoading: false,
      isAuthenticated: true,
      user: {
        usuarioId: "u2",
        locatarioId: "l1",
        isSuperAdmin: false,
        permissoes: [],
        papeis: ["ADMIN"],
      },
      accessToken: "token",
      login: vi.fn(),
      logout: vi.fn(),
      refreshSession: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={["/superadmin"]}>
        <Routes>
          <Route path="/acesso-negado" element={<div>Acesso negado</div>} />
          <Route element={<SuperAdminRoute />}>
            <Route path="/superadmin" element={<div>Dashboard SuperAdmin</div>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText("Acesso negado")).toBeInTheDocument();
  });
});