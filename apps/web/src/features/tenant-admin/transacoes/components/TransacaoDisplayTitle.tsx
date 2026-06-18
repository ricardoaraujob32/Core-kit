// apps/web/src/features/tenant-admin/transacoes/components/TransacaoDisplayTitle.tsx

import type { JSX } from "react";
import {
  formatTransacaoTitulo,
  shortCode,
} from "../../../../shared/formatters";
import type { Transacao } from "../tipos";

type TransacaoDisplayTitleProps = {
  transacao: Pick<Transacao, "tipo" | "criadoEm" | "transacaoId">;
  showReference?: boolean;
};

export function TransacaoDisplayTitle({
  transacao,
  showReference = false,
}: TransacaoDisplayTitleProps): JSX.Element {
  return (
    <div>
      <div className="ck-register-main">
        {formatTransacaoTitulo({
          tipo: transacao.tipo,
          criadoEm: transacao.criadoEm,
          fallbackId: transacao.transacaoId,
        })}
      </div>

      {showReference ? (
        <div className="ck-register-sub">
          Ref. {shortCode(transacao.transacaoId)}
        </div>
      ) : null}
    </div>
  );
}
