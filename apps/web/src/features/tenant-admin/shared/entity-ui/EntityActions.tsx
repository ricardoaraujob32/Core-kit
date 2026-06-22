// apps/web/src/features/tenant-admin/shared/entity-ui/EntityActions.tsx

import type { JSX, ReactNode } from "react";

type EntityActionsProps = {
  children: ReactNode;
  className?: string;
};

export function EntityActions({
  children,
  className = "",
}: EntityActionsProps): JSX.Element {
  return (
    <div className={`ck-entity-actions-row ${className}`.trim()}>
      {children}
    </div>
  );
}
