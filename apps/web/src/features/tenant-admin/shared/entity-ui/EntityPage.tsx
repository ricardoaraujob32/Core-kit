// apps/web/src/features/tenant-admin/shared/entity-ui/EntityPage.tsx

import type { JSX, ReactNode } from "react";
import "../entityPages.css";

type EntityPageProps = {
  children: ReactNode;
  actions?: ReactNode;
  className?: string;
};

export function EntityPage({
  children,
  actions,
  className = "",
}: EntityPageProps): JSX.Element {
  return (
    <div className={`ck-entity-page ${className}`.trim()}>
      {actions ? (
        <div className="ck-entity-page__actions">{actions}</div>
      ) : null}

      {children}
    </div>
  );
}
