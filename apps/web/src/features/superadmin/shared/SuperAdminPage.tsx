// apps/web/src/features/superadmin/shared/SuperAdminPage.tsx

import type { JSX, ReactNode } from "react";
import "./superAdminPages.css";

type Props = {
  children: ReactNode;
  kicker: string;
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
};

export function SuperAdminPage({
  children,
  kicker,
  title,
  description,
  actions,
}: Props): JSX.Element {
  return (
    <div className="ck-superadmin-page">
      <header className="ck-superadmin-page__header">
        <div>
          <p className="ck-superadmin-page__kicker">{kicker}</p>
          <h1>{title}</h1>
          {description ? <p>{description}</p> : null}
        </div>

        {actions ? (
          <div className="ck-superadmin-page__actions">{actions}</div>
        ) : null}
      </header>

      {children}
    </div>
  );
}
