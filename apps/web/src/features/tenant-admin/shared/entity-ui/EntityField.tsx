// apps/web/src/features/tenant-admin/shared/entity-ui/EntityField.tsx

import type { JSX, ReactNode } from "react";

type EntityFieldProps = {
  children: ReactNode;
  label: ReactNode;
  wide?: boolean;
  className?: string;
};

export function EntityField({
  children,
  label,
  wide = false,
  className = "",
}: EntityFieldProps): JSX.Element {
  return (
    <label
      className={`ck-entity-field ${
        wide ? "ck-entity-field--wide" : ""
      } ${className}`.trim()}
    >
      <span>{label}</span>
      {children}
    </label>
  );
}

type EntityFormGridProps = {
  children: ReactNode;
  className?: string;
};

export function EntityFormGrid({
  children,
  className = "",
}: EntityFormGridProps): JSX.Element {
  return (
    <div className={`ck-entity-form-grid ${className}`.trim()}>
      {children}
    </div>
  );
}
