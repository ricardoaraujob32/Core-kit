// apps/web/src/shared/navigation/TenantBreadcrumbRail.tsx

import { useState, type JSX } from "react";
import { useLocation } from "react-router-dom";
import { DomainBreadcrumbs } from "./DomainBreadcrumbs";
import { getTenantBreadcrumbItems } from "./tenantRouteBreadcrumbs";

export function TenantBreadcrumbRail(): JSX.Element {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const items = getTenantBreadcrumbItems(pathname);

  return (
    <section
      className={`ck-tenant-breadcrumb-rail ${
        open ? "ck-tenant-breadcrumb-rail--open" : "ck-tenant-breadcrumb-rail--collapsed"
      }`.trim()}
    >
      <button
        type="button"
        className="ck-tenant-breadcrumb-rail__toggle"
        aria-label="Alternar breadcrumb"
        aria-expanded={open}
        title="Alternar breadcrumb"
        onClick={() => setOpen((current) => !current)}
      >
        <span aria-hidden="true">☰</span>
      </button>

      {open ? (
        <div className="ck-tenant-breadcrumb-rail__full">
          <DomainBreadcrumbs items={items} mode="full" />
        </div>
      ) : (
        <div className="ck-tenant-breadcrumb-rail__collapsed">
          <div className="ck-tenant-breadcrumb-rail__icons">
            <DomainBreadcrumbs items={items} mode="icons" />
          </div>

          <div className="ck-tenant-breadcrumb-rail__hover-full">
            <DomainBreadcrumbs items={items} mode="full" />
          </div>
        </div>
      )}
    </section>
  );
}
