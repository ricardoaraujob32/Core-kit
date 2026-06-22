// apps/web/src/features/tenant-admin/shared/entity-ui/EntityForm.tsx

import type { FormEvent, JSX, ReactNode } from "react";

type EntityFormProps = {
  children: ReactNode;
  kicker: string;
  title: ReactNode;
  description?: ReactNode;
  footer?: ReactNode;
  error?: ReactNode;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void | Promise<void>;
};

export function EntityForm({
  children,
  kicker,
  title,
  description,
  footer,
  error,
  onSubmit,
}: EntityFormProps): JSX.Element {
  return (
    <form className="ck-entity-form" onSubmit={onSubmit}>
      <header className="ck-entity-form__header">
        <div>
          <p className="ck-entity-kicker">{kicker}</p>
          <h1>{title}</h1>
          {description ? <p>{description}</p> : null}
        </div>
      </header>

      {error ? <div className="ck-entity-alert">{error}</div> : null}

      {children}

      {footer ? (
        <footer className="ck-entity-form__footer">{footer}</footer>
      ) : null}
    </form>
  );
}
