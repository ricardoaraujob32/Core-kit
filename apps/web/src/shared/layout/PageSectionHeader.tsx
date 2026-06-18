// apps/web/src/shared/layout/PageSectionHeader.tsx

import type { JSX, ReactNode } from "react";
import "./pageSectionHeader.css";

type PageSectionHeaderProps = {
  kicker?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
};

export function PageSectionHeader({
  kicker,
  title,
  description,
  actions,
}: PageSectionHeaderProps): JSX.Element {
  return (
    <section className="ck-page-section-header">
      <div className="ck-page-section-header-inner">
        <div>
          {kicker ? <div className="ck-page-section-kicker">{kicker}</div> : null}
          <h1 className="ck-page-section-title">{title}</h1>
          {description ? (
            <p className="ck-page-section-description">{description}</p>
          ) : null}
        </div>

        {actions ? <div className="ck-page-section-actions">{actions}</div> : null}
      </div>
    </section>
  );
}
