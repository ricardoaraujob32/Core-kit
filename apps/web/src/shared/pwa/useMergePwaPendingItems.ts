// apps/web/src/shared/pwa/useMergePwaPendingItems.ts

import { useMemo } from "react";

type UseMergePwaPendingItemsParams<TItem> = {
  items: TItem[];
  pendingItems: TItem[];
  getId: (item: TItem) => string;
};

export function useMergePwaPendingItems<TItem>({
  items,
  pendingItems,
  getId,
}: UseMergePwaPendingItemsParams<TItem>): TItem[] {
  return useMemo(() => {
    const ids = new Set<string>();
    const merged: TItem[] = [];

    for (const item of [...pendingItems, ...items]) {
      const id = getId(item);

      if (!ids.has(id)) {
        ids.add(id);
        merged.push(item);
      }
    }

    return merged;
  }, [items, pendingItems, getId]);
}
