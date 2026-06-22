// apps/web/src/features/tenant-admin/shared/entity-ui/EntityCard.tsx

import type { JSX, ReactNode } from "react";

type EntityCardProps = {
  children: ReactNode;
  title?: ReactNode;
  description?: ReactNode;
  className?: string;
};

export function EntityCard({
  children,
  title,
  description,
  className = "",
}: EntityCardProps): JSX.Element {
  return (
    <section className={`ck-entity-card ${className}`.trim()}>
      {title || description ? (
        <div className="ck-entity-card__title">
          {title ? <h2>{title}</h2> : null}
          {description ? <p>{description}</p> : null}
        </div>
      ) : null}

      {children}
    </section>
  );
}
