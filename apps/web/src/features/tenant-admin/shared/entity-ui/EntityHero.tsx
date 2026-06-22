// apps/web/src/features/tenant-admin/shared/entity-ui/EntityHero.tsx

import type { JSX, ReactNode } from "react";

type EntityHeroProps = {
  kicker: string;
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
};

export function EntityHero({
  kicker,
  title,
  description,
  actions,
}: EntityHeroProps): JSX.Element {
  return (
    <section className="ck-entity-hero">
      <div>
        <p className="ck-entity-kicker">{kicker}</p>
        <h1>{title}</h1>
        {description ? <p>{description}</p> : null}
      </div>

      {actions ? (
        <div className="ck-entity-page__actions">{actions}</div>
      ) : null}
    </section>
  );
}
