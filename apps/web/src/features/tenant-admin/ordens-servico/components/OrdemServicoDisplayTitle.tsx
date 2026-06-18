// apps/web/src/features/tenant-admin/ordens-servico/components/OrdemServicoDisplayTitle.tsx

import type { JSX } from "react";
import {
  formatOrdemServicoTitulo,
  shortCode,
} from "../../../../shared/formatters";
import type { OrdemServico } from "../tipos";

type Props = {
  ordemServico: Pick<OrdemServico, "ordemServicoId" | "criadoEm" | "abertaEm">;
  showReference?: boolean;
};

export function OrdemServicoDisplayTitle({
  ordemServico,
  showReference = false,
}: Props): JSX.Element {
  const dataReferencia = ordemServico.abertaEm ?? ordemServico.criadoEm;

  return (
    <div>
      <div className="ck-register-main">
        {formatOrdemServicoTitulo({
          criadoEm: dataReferencia,
          fallbackId: ordemServico.ordemServicoId,
        })}
      </div>

      {showReference ? (
        <div className="ck-register-sub">
          Ref. {shortCode(ordemServico.ordemServicoId)}
        </div>
      ) : null}
    </div>
  );
}
