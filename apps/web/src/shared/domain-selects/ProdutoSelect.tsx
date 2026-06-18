// apps/web/src/shared/domain-selects/ProdutoSelect.tsx

import type { JSX } from "react";
import type { Produto } from "../../features/tenant-admin/produtos/tipos";
import { formatProdutoOptionLabel } from "../formatters";

type ProdutoSelectProps = {
  value: string;
  produtos: Produto[];
  disabled?: boolean;
  allowEmpty?: boolean;
  emptyLabel?: string;
  className?: string;
  onChange: (produtoId: string) => void;
};

export function ProdutoSelect({
  value,
  produtos,
  disabled = false,
  allowEmpty = true,
  emptyLabel = "Selecione um produto",
  className = "ck-register-select",
  onChange,
}: ProdutoSelectProps): JSX.Element {
  return (
    <select
      className={className}
      value={value}
      disabled={disabled}
      onChange={(event) => onChange(event.target.value)}
    >
      {allowEmpty ? <option value="">{emptyLabel}</option> : null}

      {produtos.map((produto) => (
        <option key={produto.produtoId} value={produto.produtoId}>
          {formatProdutoOptionLabel(produto)}
        </option>
      ))}
    </select>
  );
}
