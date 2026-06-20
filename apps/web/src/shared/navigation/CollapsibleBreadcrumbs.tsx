// apps/web/src/shared/navigation/CollapsibleBreadcrumbs.tsx

import { useState, type JSX } from "react";
import {
  DomainBreadcrumbs,
  type DomainBreadcrumbItem,
} from "./DomainBreadcrumbs";

type CollapsibleBreadcrumbsProps = {
  items: DomainBreadcrumbItem[];
  defaultOpen?: boolean;
  label?: string;
};

/**
 * Breadcrumb retrátil.
 *
 * Estado fechado:
 * - mostra botão de 3 traços;
 * - mostra apenas os ícones do caminho;
 * - no hover/focus, revela linha completa.
 *
 * Estado aberto:
 * - mostra o breadcrumb completo.
 */
export function CollapsibleBreadcrumbs({
  items,
  defaultOpen = false,
  label = "Alternar navegação",
}: CollapsibleBreadcrumbsProps): JSX.Element {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section
      className={`ck-collapsible-breadcrumbs ${
        open ? "ck-collapsible-breadcrumbs--open" : "ck-collapsible-breadcrumbs--collapsed"
      }`.trim()}
    >
      <button
        type="button"
        className="ck-collapsible-breadcrumbs__toggle"
        aria-expanded={open}
        aria-label={label}
        title={label}
        onClick={() => setOpen((current) => !current)}
      >
        <span aria-hidden="true" className="ck-hamburger-icon">
          ☰
        </span>
      </button>

      {open ? (
        <div className="ck-collapsible-breadcrumbs__content ck-collapsible-breadcrumbs__content--full">
          <DomainBreadcrumbs items={items} mode="full" />
        </div>
      ) : (
        <div className="ck-collapsible-breadcrumbs__content ck-collapsible-breadcrumbs__content--collapsed">
          <div className="ck-collapsible-breadcrumbs__icons">
            <DomainBreadcrumbs items={items} mode="icons" />
          </div>

          <div className="ck-collapsible-breadcrumbs__hover-full">
            <DomainBreadcrumbs items={items} mode="full" />
          </div>
        </div>
      )}
    </section>
  );
}
