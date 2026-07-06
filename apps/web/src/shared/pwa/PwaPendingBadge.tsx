// apps/web/src/shared/pwa/PwaPendingBadge.tsx

import { getPwaPendingLabel, isPwaPendingId } from "./pwaPendingHelpers";

type PwaPendingBadgeProps = {
  id?: string | null;
  label?: string;
};

export function PwaPendingBadge({ id, label }: PwaPendingBadgeProps) {
  if (!isPwaPendingId(id)) return null;

  return (
    <span
      className="ck-pwa-badge ck-pwa-badge--pending"
      title="Este registro foi criado offline e ainda não foi sincronizado."
    >
      {label ?? getPwaPendingLabel(id)}
    </span>
  );
}
