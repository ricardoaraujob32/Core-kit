// apps/web/src/shared/layout/AppShell.tsx

import type { JSX, ReactNode } from "react";

type AppShellProps = {
  children: ReactNode;
  sidebar?: ReactNode;
  header?: ReactNode;
  className?: string;
};

/**
 * Shell genérico preservado por compatibilidade.
 *
 * Usado por áreas como superadmin.
 * Não deve conter regras específicas do tenant.
 */
export function AppShell({
  children,
  sidebar,
  header,
  className = "",
}: AppShellProps): JSX.Element {
  return (
    <div className={`ck-app-shell ${className}`.trim()}>
      {sidebar ? (
        <aside className="ck-app-shell__sidebar">
          {sidebar}
        </aside>
      ) : null}

      <div className="ck-app-shell__body">
        {header ? (
          <header className="ck-app-shell__header">
            {header}
          </header>
        ) : null}

        <main className="ck-app-shell__main">
          {children}
        </main>
      </div>
    </div>
  );
}
