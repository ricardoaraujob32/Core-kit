// apps/web/src/shared/navigation/DomainPageHeader.tsx

import type { JSX, ReactNode } from "react";
import type { DomainBreadcrumbItem } from "./DomainBreadcrumbs";
import { CollapsibleBreadcrumbs } from "./CollapsibleBreadcrumbs";

type DomainPageHeaderProps = {
  title: string;
  subtitle?: string;
  meta?: string;
  status?: string;
  breadcrumbs?: DomainBreadcrumbItem[];
  actions?: ReactNode;
};

export function DomainPageHeader({
  title,
  subtitle,
  meta,
  status,
  breadcrumbs,
  actions,
}: DomainPageHeaderProps): JSX.Element {
  return (
    <header className="ck-page-header">
      {breadcrumbs?.length ? (
        <CollapsibleBreadcrumbs items={breadcrumbs} />
      ) : null}

      <div className="ck-page-header__content">
        <div>
          <h1>{title}</h1>

          {subtitle ? (
            <p className="ck-page-header__subtitle">{subtitle}</p>
          ) : null}

          {meta ? <p className="ck-page-header__meta">{meta}</p> : null}

          {status ? (
            <p className="ck-page-header__status">Status: {status}</p>
          ) : null}
        </div>

        {actions ? (
          <div className="ck-page-header__actions">{actions}</div>
        ) : null}
      </div>
    </header>
  );
}
