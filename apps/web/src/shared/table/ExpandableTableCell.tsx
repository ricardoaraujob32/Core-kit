// apps/web/src/shared/table/ExpandableTableCell.tsx

import type { JSX, ReactNode } from "react";

type ExpandableTableCellProps = {
  summary: ReactNode;
  detail: ReactNode;
  className?: string;
  colSpan?: number;
  defaultOpen?: boolean;
  emptyDetailLabel?: string;
};

export function ExpandableTableCell({
  summary,
  detail,
  className = "",
  colSpan,
  defaultOpen = false,
  emptyDetailLabel = "Sem informações adicionais",
}: ExpandableTableCellProps): JSX.Element {
  const hasDetail =
    detail !== null &&
    detail !== undefined &&
    detail !== false &&
    detail !== "";

  return (
    <td className={`ck-expandable-table-cell ${className}`.trim()} colSpan={colSpan}>
      <details className="ck-expandable-native" open={defaultOpen}>
        <summary className="ck-expandable-native__summary">
          <span className="ck-expandable-native__summary-text">{summary}</span>
        </summary>

        <div className="ck-expandable-native__detail">
          {hasDetail ? detail : emptyDetailLabel}
        </div>
      </details>
    </td>
  );
}
