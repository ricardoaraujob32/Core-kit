// apps/web/src/shared/table/useExpandableTable.ts

import { useCallback, useState } from "react";

export type ExpandableCellId = string | null;

export type UseExpandableTableResult = {
  openCellId: ExpandableCellId;
  toggleCell: (cellId: string) => void;
  closeCell: () => void;
  isOpen: (cellId: string) => boolean;
};

/**
 * Controla a expansão de células em uma tabela.
 *
 * Uso opcional:
 * - sem este hook, cada célula controla sua própria expansão;
 * - com este hook, apenas uma célula fica aberta por vez.
 */
export function useExpandableTable(): UseExpandableTableResult {
  const [openCellId, setOpenCellId] = useState<ExpandableCellId>(null);

  const toggleCell = useCallback((cellId: string) => {
    setOpenCellId((current) => (current === cellId ? null : cellId));
  }, []);

  const closeCell = useCallback(() => {
    setOpenCellId(null);
  }, []);

  const isOpen = useCallback(
    (cellId: string) => openCellId === cellId,
    [openCellId],
  );

  return {
    openCellId,
    toggleCell,
    closeCell,
    isOpen,
  };
}
