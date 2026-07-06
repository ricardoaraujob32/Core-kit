// apps/web/src/shared/pwa/PwaSyncBadge.tsx

import { getPwaQueueStatusLabel } from "./pwaPendingHelpers";
import type { PwaQueueItem } from "./pwaSyncTypes";

type PwaSyncBadgeProps = {
  status: PwaQueueItem["status"];
};

export function PwaSyncBadge({ status }: PwaSyncBadgeProps) {
  return (
    <span
      className={`ck-pwa-badge ck-pwa-badge--${status}`}
      title={`Status de sincronização: ${getPwaQueueStatusLabel(status)}`}
    >
      {getPwaQueueStatusLabel(status)}
    </span>
  );
}
