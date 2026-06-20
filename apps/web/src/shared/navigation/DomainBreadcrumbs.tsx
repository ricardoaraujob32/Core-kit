// apps/web/src/shared/navigation/DomainBreadcrumbs.tsx

import type { JSX } from "react";
import { Link } from "react-router-dom";
import {
  TenantNavigationIcon,
  type TenantNavigationIconKey,
} from "./tenantNavigationIcons";

export type DomainBreadcrumbItem = {
  label: string;
  to?: string;
  iconKey?: TenantNavigationIconKey;
};

type DomainBreadcrumbsProps = {
  items: DomainBreadcrumbItem[];
  ariaLabel?: string;
  mode?: "full" | "icons";
};

function BreadcrumbContent({
  item,
  mode,
}: {
  item: DomainBreadcrumbItem;
  mode: "full" | "icons";
}): JSX.Element | string {
  if (mode === "icons") {
    return <TenantNavigationIcon iconKey={item.iconKey} label={item.label} />;
  }

  return item.label;
}

export function DomainBreadcrumbs({
  items,
  ariaLabel = "Navegação estrutural",
  mode = "full",
}: DomainBreadcrumbsProps): JSX.Element {
  return (
    <nav aria-label={ariaLabel} className={`ck-breadcrumbs ck-breadcrumbs--${mode}`}>
      <ol>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          const content = <BreadcrumbContent item={item} mode={mode} />;

          return (
            <li key={`${item.label}-${index}`}>
              {item.to && !isLast ? (
                <Link to={item.to} title={item.label} aria-label={item.label}>
                  {content}
                </Link>
              ) : (
                <span aria-current={isLast ? "page" : undefined} title={item.label}>
                  {content}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
