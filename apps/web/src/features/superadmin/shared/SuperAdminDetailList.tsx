// apps/web/src/features/superadmin/shared/superAdmin-ui/SuperAdminDetailList.tsx

import type { JSX, ReactNode } from "react";

type Item = {
  label: ReactNode;
  value: ReactNode;
  technical?: boolean;
};

type Props = {
  items: Item[];
};

export function SuperAdminDetailList({ items }: Props): JSX.Element {
  return (
    <dl className="ck-superadmin-detail-list">
      {items.map((item, index) => (
        <div key={index}>
          <dt>{item.label}</dt>
          <dd className={item.technical ? "ck-superadmin-technical" : undefined}>
            {item.value ?? "—"}
          </dd>
        </div>
      ))}
    </dl>
  );
}
