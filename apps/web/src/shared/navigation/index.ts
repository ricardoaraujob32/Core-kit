// apps/web/src/shared/navigation/index.ts

export { DomainBreadcrumbs } from "./DomainBreadcrumbs";
export type { DomainBreadcrumbItem } from "./DomainBreadcrumbs";

export { TenantBreadcrumbRail } from "./TenantBreadcrumbRail";
export { getTenantBreadcrumbItems } from "./tenantRouteBreadcrumbs";

export {
  TENANT_NAVIGATION_ICONS,
  TenantNavigationIcon,
  getTenantNavigationIcon,
} from "./tenantNavigationIcons";
export type { TenantNavigationIconKey } from "./tenantNavigationIcons";
