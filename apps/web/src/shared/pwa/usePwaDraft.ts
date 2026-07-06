// apps/web/src/shared/pwa/usePwaDraft.ts

import { useMemo, useState } from "react";
import type { DraftState } from "./pwaTypes";

function serialize(value: unknown): string {
  return JSON.stringify(value);
}

export function usePwaDraft<TDraft extends Record<string, unknown>>(
  initialValue: TDraft,
): DraftState<TDraft> {
  const [value, setValue] = useState<TDraft>(initialValue);

  const initialSerialized = useMemo(() => serialize(initialValue), [initialValue]);
  const currentSerialized = useMemo(() => serialize(value), [value]);

  function patch(patchValue: Partial<TDraft>) {
    setValue((current) => ({
      ...current,
      ...patchValue,
    }));
  }

  function reset() {
    setValue(initialValue);
  }

  return {
    value,
    setValue,
    patch,
    reset,
    isDirty: currentSerialized !== initialSerialized,
  };
}
