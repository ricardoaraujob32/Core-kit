// apps/web/src/shared/domain-selects/FornecedorSelect.tsx

import type { JSX } from "react";
import type { Fornecedor } from "../../features/tenant-admin/fornecedores/tipos";
import { formatFornecedorOptionLabel } from "../formatters";

type FornecedorSelectProps = {
  value: string;
  fornecedores: Fornecedor[];
  disabled?: boolean;
  allowEmpty?: boolean;
  emptyLabel?: string;
  className?: string;
  onChange: (fornecedorId: string) => void;
};

export function FornecedorSelect({
  value,
  fornecedores,
  disabled = false,
  allowEmpty = true,
  emptyLabel = "Selecione um fornecedor",
  className = "ck-register-select",
  onChange,
}: FornecedorSelectProps): JSX.Element {
  return (
    <select
      className={className}
      value={value}
      disabled={disabled}
      onChange={(event) => onChange(event.target.value)}
    >
      {allowEmpty ? <option value="">{emptyLabel}</option> : null}

      {fornecedores.map((fornecedor) => (
        <option key={fornecedor.fornecedorId} value={fornecedor.fornecedorId}>
          {formatFornecedorOptionLabel(fornecedor)}
        </option>
      ))}
    </select>
  );
}
