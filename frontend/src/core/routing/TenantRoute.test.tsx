// frontend/src/core/routing/__tests__/TenantRoute.test.tsx

import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";

import TenantRoute from "../TenantRoute";

vi.mock("../../auth/useAuth", () => ({
  useAuth: vi.fn(),
}));

import { useAuth } from "../../auth/useAuth";

describe("TenantRoute", () => {
  it("deve permitir acesso para usuário tenant com permissão", () => {
    vi.mocked(useAuth).mockReturnValue({
      status: "authenticated",
      isLoading: false,
      isAuthenticated: true,
      user: {
        usuarioId: "u1",
        locatarioId: "l1",
        isSuperAdmin: false,
        permissoes: ["usuarios.ler"],
        papeis: ["ADMIN"],
      },
      accessToken: "token",
      login: vi.fn(),
      logout: vi.fn(),
      refreshSession: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={["/app"]}>
        <Routes>
          <Route
            element={
              <TenantRoute requiredPermissions={["usuarios.ler"]} />
            }
          >
            <Route path="/app" element={<div>Dashboard Tenant</div>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText("Dashboard Tenant")).toBeInTheDocument();
  });

  it("deve bloquear superadmin em rota tenant", () => {
    vi.mocked(useAuth).mockReturnValue({
      status: "authenticated",
      isLoading: false,
      isAuthenticated: true,
      user: {
        usuarioId: "u1",
        locatarioId: null,
        isSuperAdmin: true,
        permissoes: ["*"],
        papeis: ["SUPERADMIN"],
      },
      accessToken: "token",
      login: vi.fn(),
      logout: vi.fn(),
      refreshSession: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={["/app"]}>
        <Routes>
          <Route path="/acesso-negado" element={<div>Acesso negado</div>} />
          <Route element={<TenantRoute />}>
            <Route path="/app" element={<div>Dashboard Tenant</div>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText("Acesso negado")).toBeInTheDocument();
  });

  it("deve bloquear tenant sem locatarioId", () => {
    vi.mocked(useAuth).mockReturnValue({
      status: "authenticated",
      isLoading: false,
      isAuthenticated: true,
      user: {
        usuarioId: "u1",
        locatarioId: null,
        isSuperAdmin: false,
        permissoes: ["usuarios.ler"],
        papeis: ["ADMIN"],
      },
      accessToken: "token",
      login: vi.fn(),
      logout: vi.fn(),
      refreshSession: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={["/app"]}>
        <Routes>
          <Route path="/acesso-negado" element={<div>Acesso negado</div>} />
          <Route element={<TenantRoute />}>
            <Route path="/app" element={<div>Dashboard Tenant</div>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText("Acesso negado")).toBeInTheDocument();
  });

  it("deve bloquear quando faltar permissão", () => {
    vi.mocked(useAuth).mockReturnValue({
      status: "authenticated",
      isLoading: false,
      isAuthenticated: true,
      user: {
        usuarioId: "u1",
        locatarioId: "l1",
        isSuperAdmin: false,
        permissoes: ["clientes.ler"],
        papeis: ["ADMIN"],
      },
      accessToken: "token",
      login: vi.fn(),
      logout: vi.fn(),
      refreshSession: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={["/app"]}>
        <Routes>
          <Route path="/acesso-negado" element={<div>Acesso negado</div>} />
          <Route
            element={
              <TenantRoute requiredPermissions={["usuarios.ler"]} />
            }
          >
            <Route path="/app" element={<div>Dashboard Tenant</div>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText("Acesso negado")).toBeInTheDocument();
  });
});