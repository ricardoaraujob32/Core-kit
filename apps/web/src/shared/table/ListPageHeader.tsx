// apps/web/src/shared/table/ListPageHeader.tsx

import type { JSX, ReactNode } from "react";

type ListPageHeaderProps = {
  title: string;
  filters?: ReactNode;
  actions?: ReactNode;
};

export function ListPageHeader({
  title,
  filters,
  actions,
}: ListPageHeaderProps): JSX.Element {
  return (
    <header className="ck-list-page-header">
      <div className="ck-list-page-header__top">
        <h1>{title}</h1>

        {actions ? (
          <div className="ck-list-page-header__actions">{actions}</div>
        ) : null}
      </div>

      {filters ? (
        <div className="ck-list-page-header__filters">{filters}</div>
      ) : null}
    </header>
  );
}
