// apps/web/src/features/tenant-admin/shared/data-table/DataTableStatus.tsx

import type { JSX, ReactNode } from "react";

type DataTableStatusTone = "default" | "success" | "warning" | "danger";

type DataTableStatusProps = {
  children: ReactNode;
  tone?: DataTableStatusTone;
};

function toneClass(tone: DataTableStatusTone): string {
  switch (tone) {
    case "success":
      return "ck-status-success";
    case "warning":
      return "ck-status-warning";
    case "danger":
      return "ck-status-danger";
    case "default":
    default:
      return "";
  }
}

export function DataTableStatus({
  children,
  tone = "default",
}: DataTableStatusProps): JSX.Element {
  return (
    <span className={`ck-status ${toneClass(tone)}`.trim()}>
      {children}
    </span>
  );
}
