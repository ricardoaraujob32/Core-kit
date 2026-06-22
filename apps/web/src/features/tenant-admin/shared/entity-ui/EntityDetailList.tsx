// apps/web/src/features/tenant-admin/shared/entity-ui/EntityDetailList.tsx

import type { JSX, ReactNode } from "react";

export type EntityDetailItem = {
  label: ReactNode;
  value: ReactNode;
};

type EntityDetailListProps = {
  items: EntityDetailItem[];
  emptyValue?: ReactNode;
};

export function EntityDetailList({
  items,
  emptyValue = "—",
}: EntityDetailListProps): JSX.Element {
  return (
    <dl className="ck-entity-detail-list">
      {items.map((item, index) => (
        <div key={index}>
          <dt>{item.label}</dt>
          <dd>{item.value ?? emptyValue}</dd>
        </div>
      ))}
    </dl>
  );
}

type EntityDetailGridProps = {
  children: ReactNode;
  columns?: 2 | 3;
};

export function EntityDetailGrid({
  children,
  columns = 2,
}: EntityDetailGridProps): JSX.Element {
  return (
    <section
      className={`ck-entity-detail-grid ${
        columns === 3 ? "ck-entity-detail-grid--three" : ""
      }`.trim()}
    >
      {children}
    </section>
  );
}
