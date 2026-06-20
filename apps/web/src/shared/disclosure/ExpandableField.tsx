// apps/web/src/shared/disclosure/ExpandableField.tsx

import { useId, useState, type JSX, type KeyboardEvent, type ReactNode } from "react";

type ExpandableFieldProps = {
  summary: ReactNode;
  detail: ReactNode;
  defaultOpen?: boolean;
  className?: string;
  emptyDetailLabel?: string;
};

export function ExpandableField({
  summary,
  detail,
  defaultOpen = false,
  className = "",
  emptyDetailLabel = "Sem informações adicionais",
}: ExpandableFieldProps): JSX.Element {
  const [open, setOpen] = useState(defaultOpen);
  const detailId = useId();

  const hasDetail =
    detail !== null &&
    detail !== undefined &&
    detail !== false &&
    detail !== "";

  function toggle(): void {
    setOpen((current) => !current);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>): void {
    if (event.key !== "Enter" && event.key !== " ") {
      return;
    }

    event.preventDefault();
    toggle();
  }

  return (
    <div
      className={`ck-expandable-field ${
        open ? "ck-expandable-field--open" : ""
      } ${className}`.trim()}
      role="button"
      tabIndex={0}
      aria-expanded={open}
      aria-controls={detailId}
      onClick={toggle}
      onKeyDown={handleKeyDown}
    >
      <div className="ck-expandable-field__summary">
        <span className="ck-expandable-field__summary-text">{summary}</span>
      </div>

      {open ? (
        <div id={detailId} className="ck-expandable-field__detail">
          {hasDetail ? detail : emptyDetailLabel}
        </div>
      ) : null}
    </div>
  );
}
