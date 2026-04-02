// frontend/src/core/tenant/__tests__/TenantContext.test.tsx

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import type { PropsWithChildren } from "react";

import { TenantProvider, useTenant } from "../TenantContext";

vi.mock("../../auth/useAuth", () => ({
  useAuth: vi.fn(),
}));

vi.mock("../tenantApi", () => ({
  getTenantBranding: vi.fn(),
}));

import { useAuth } from "../../auth/useAuth";
import { getTenantBranding } from "../tenantApi";

function TenantConsumer(): JSX.Element {
  const { branding, isLoading } = useTenant();

  return (
    <div>
      <span data-testid="loading">{isLoading ? "true" : "false"}</span>
      <span data-testid="tenant-name">{branding?.nomeFantasia ?? ""}</span>
      <span data-testid="tenant-id">{branding?.locatarioId ?? ""}</span>
    </div>
  );
}

function Wrapper({ children }: PropsWithChildren): JSX.Element {
  return <TenantProvider>{children}</TenantProvider>;
}

describe("TenantContext", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deve carregar branding real para usuário tenant", async () => {
    vi.mocked(useAuth).mockReturnValue({
      status: "authenticated",
      isLoading: false,
      isAuthenticated: true,
      user: {
        usuarioId: "u1",
        locatarioId: "l1",
        isSuperAdmin: false,
        permissoes: [],
        papeis: [],
      },
      accessToken: "token",
      login: vi.fn(),
      logout: vi.fn(),
      refreshSession: vi.fn(),
    });

    vi.mocked(getTenantBranding).mockResolvedValue({
      branding: {
        locatarioId: "l1",
        nomeFantasia: "Empresa Alfa",
        corPrimaria: "#0000ff",
      },
    });

    render(<TenantConsumer />, { wrapper: Wrapper });

    await waitFor(() => {
      expect(screen.getByTestId("tenant-id").textContent).toBe("l1");
      expect(screen.getByTestId("tenant-name").textContent).toBe("Empresa Alfa");
    });
  });

  it("deve usar fallback quando branding falhar", async () => {
    vi.mocked(useAuth).mockReturnValue({
      status: "authenticated",
      isLoading: false,
      isAuthenticated: true,
      user: {
        usuarioId: "u1",
        locatarioId: "tenant-12345678",
        isSuperAdmin: false,
        permissoes: [],
        papeis: [],
      },
      accessToken: "token",
      login: vi.fn(),
      logout: vi.fn(),
      refreshSession: vi.fn(),
    });

    vi.mocked(getTenantBranding).mockRejectedValue(
      new Error("Falha ao carregar branding"),
    );

    render(<TenantConsumer />, { wrapper: Wrapper });

    await waitFor(() => {
      expect(screen.getByTestId("tenant-id").textContent).toBe("tenant-12345678");
      expect(screen.getByTestId("tenant-name").textContent).toContain("Locatário");
    });
  });

  it("deve limpar branding para superadmin", async () => {
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

    render(<TenantConsumer />, { wrapper: Wrapper });

    await waitFor(() => {
      expect(screen.getByTestId("tenant-id").textContent).toBe("");
      expect(screen.getByTestId("tenant-name").textContent).toBe("");
    });
  });
});