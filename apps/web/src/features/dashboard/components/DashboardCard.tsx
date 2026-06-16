// apps/web/src/features/dashboard/components/DashboardCard.tsx

import type { JSX, ReactNode } from "react";
import "./dashboardCard.css";

type DashboardCardVariant =
  | "default"
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "purple";

type DashboardCardProps = {
  title: string;
  value: ReactNode;
  icon?: ReactNode;
  description?: ReactNode;
  footer?: ReactNode;
  variant?: DashboardCardVariant;
  isLoading?: boolean;
};

function variantColor(variant: DashboardCardVariant): string {
  switch (variant) {
    case "success":
      return "#16a34a";
    case "warning":
      return "#f59e0b";
    case "danger":
      return "#dc2626";
    case "info":
      return "#2563eb";
    case "purple":
      return "#7c3aed";
    case "default":
    default:
      return "var(--ck-primary, #2563eb)";
  }
}

export function DashboardCard({
  title,
  value,
  icon,
  description,
  footer,
  variant = "default",
  isLoading = false,
}: DashboardCardProps): JSX.Element {
  const color = variantColor(variant);

  if (isLoading) {
    return (
      <article className="ck-dashboard-card ck-dashboard-card-loading">
        <div className="ck-dashboard-card-skeleton" />
      </article>
    );
  }

  return (
    <article
      className="ck-dashboard-card"
      style={{ "--dashboard-card-color": color } as React.CSSProperties}
    >
      <div className="ck-dashboard-card-top">
        <div>
          <div className="ck-dashboard-card-title">{title}</div>
          <div className="ck-dashboard-card-value">{value}</div>

          {description ? (
            <div className="ck-dashboard-card-description">{description}</div>
          ) : null}
        </div>

        {icon ? <div className="ck-dashboard-card-icon">{icon}</div> : null}
      </div>

      {footer ? <div className="ck-dashboard-card-footer">{footer}</div> : null}
    </article>
  );
}
