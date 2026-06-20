// apps/web/src/shared/layout/index.ts

/**
 * Barrel de layout compartilhado.
 *
 * Importante:
 * não remover exports antigos, pois áreas como superadmin podem depender deles.
 */

export { AppShell } from "./AppShell";

export { TenantSidebar } from "./TenantSidebar";
export { useTenantMenuCollapsed } from "./useTenantMenuCollapsed";
