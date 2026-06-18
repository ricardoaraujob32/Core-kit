// apps/web/src/shared/domain-selects/ClienteSelect.tsx

import type { JSX } from "react";
import type { Cliente } from "../../features/tenant-admin/clientes/tipos";
import { formatClienteOptionLabel } from "../formatters";

type ClienteSelectProps = {
  value: string;
  clientes: Cliente[];
  disabled?: boolean;
  allowEmpty?: boolean;
  emptyLabel?: string;
  className?: string;
  onChange: (clienteId: string) => void;
};

export function ClienteSelect({
  value,
  clientes,
  disabled = false,
  allowEmpty = true,
  emptyLabel = "Selecione um cliente",
  className = "ck-register-select",
  onChange,
}: ClienteSelectProps): JSX.Element {
  return (
    <select
      className={className}
      value={value}
      disabled={disabled}
      onChange={(event) => onChange(event.target.value)}
    >
      {allowEmpty ? <option value="">{emptyLabel}</option> : null}

      {clientes.map((cliente) => (
        <option key={cliente.clienteId} value={cliente.clienteId}>
          {formatClienteOptionLabel(cliente)}
        </option>
      ))}
    </select>
  );
}
