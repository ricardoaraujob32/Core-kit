// apps/web/src/features/superadmin/shared/superAdmin-ui/SuperAdminCard.tsx

import type { JSX, ReactNode } from "react";

type Props = {
  children: ReactNode;
  title?: ReactNode;
  description?: ReactNode;
};

export function SuperAdminCard({
  children,
  title,
  description,
}: Props): JSX.Element {
  return (
    <section className="ck-superadmin-card">
      {title || description ? (
        <div className="ck-superadmin-card__title">
          {title ? <h2>{title}</h2> : null}
          {description ? <p>{description}</p> : null}
        </div>
      ) : null}

      {children}
    </section>
  );
}
