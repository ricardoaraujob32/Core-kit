// apps/web/src/features/tenant-admin/shared/entity-ui/EntityAlert.tsx

import type { JSX, ReactNode } from "react";

type EntityAlertProps = {
  children: ReactNode;
};

export function EntityAlert({ children }: EntityAlertProps): JSX.Element {
  return <div className="ck-entity-alert">{children}</div>;
}
