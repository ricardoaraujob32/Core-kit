// apps/web/src/shared/domain-selects/TransacaoSelect.tsx

import type { JSX } from "react";
import { formatTransacaoOptionLabel } from "../formatters";

type TransacaoOption = {
  transacaoId: string;
  tipo?: string | null;
  status?: string | null;
  criadoEm?: string | null;
  data?: string | null;
  clienteNome?: string | null;
  fornecedorNome?: string | null;
  pessoaNome?: string | null;
  valorTotal?: number | string | null;
};

type TransacaoSelectProps<TTransacao extends TransacaoOption = TransacaoOption> = {
  value: string;
  transacoes: TTransacao[];
  disabled?: boolean;
  allowEmpty?: boolean;
  emptyLabel?: string;
  className?: string;
  onChange: (transacaoId: string) => void;
};

export function TransacaoSelect<TTransacao extends TransacaoOption = TransacaoOption>({
  value,
  transacoes,
  disabled = false,
  allowEmpty = true,
  emptyLabel = "Selecione uma transação",
  className = "ck-register-select",
  onChange,
}: TransacaoSelectProps<TTransacao>): JSX.Element {
  return (
    <select
      className={className}
      value={value}
      disabled={disabled}
      onChange={(event) => onChange(event.target.value)}
    >
      {allowEmpty ? <option value="">{emptyLabel}</option> : null}

      {transacoes.map((transacao) => (
        <option key={transacao.transacaoId} value={transacao.transacaoId}>
          {formatTransacaoOptionLabel(transacao)}
        </option>
      ))}
    </select>
  );
}
