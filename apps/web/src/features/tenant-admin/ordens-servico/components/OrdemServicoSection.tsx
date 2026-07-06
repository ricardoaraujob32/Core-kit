// apps/web/src/features/tenant-admin/ordens-servico/components/OrdemServicoSection.tsx

import {
  EntityAlert,
  EntityCard,
} from "../../shared/entity-ui";
import type { CriarOrdemServicoInput } from "../tipos";
import { OrdemServicoForm } from "./OrdemServicoForm";

type OrdemServicoSectionProps = {
  initialValues?: Partial<CriarOrdemServicoInput>;
  erro?: string | null;
  onSubmit: (input: CriarOrdemServicoInput) => Promise<void>;
};

/**
 * Wrapper de seção para padronizar a composição da OS.
 *
 * A tela decide rota/API.
 * O form cuida da entrada controlada.
 */
export function OrdemServicoSection({
  initialValues,
  erro,
  onSubmit,
}: OrdemServicoSectionProps) {
  return (
    <EntityCard
      title="Ordem de serviço"
      description="Cadastro estruturado para uso online e futura operação offline."
    >
      {erro ? <EntityAlert>{erro}</EntityAlert> : null}

      <OrdemServicoForm
        initialValues={initialValues}
        onSubmit={onSubmit}
      />
    </EntityCard>
  );
}
