// apps/web/src/features/tenant-admin/ordens-servico/pages/NovaOrdemServicoPage.tsx

import { Link, useNavigate } from "react-router-dom";
import { mapError } from "../../../../core/errors/mapError";
import { PageSectionHeader } from "../../../../shared/layout/PageSectionHeader";
import { ordensServicoApi } from "../api/ordensServicoApi";
import { OrdemServicoForm } from "../components/OrdemServicoForm";
import type { CriarOrdemServicoInput } from "../tipos";
import "../../cadastros/cadastros.css";
import "../../transacoes/pages/transacoes.css";
import { useState } from "react";

export default function NovaOrdemServicoPage() {
  const navigate = useNavigate();
  const [erro, setErro] = useState<string | null>(null);

  async function criar(input: CriarOrdemServicoInput) {
    setErro(null);

    try {
      const response = await ordensServicoApi.criar(input);
      navigate(`/app/ordens-servico/${response.item.ordemServicoId}`);
    } catch (error) {
      setErro(mapError(error).message);
    }
  }

  return (
    <main className="ck-register-page">
      <PageSectionHeader
        kicker="Ordens de serviço"
        title="Nova OS"
        description="Registre uma ordem de serviço usando cliente, título e descrição. A data e o horário serão usados como referência principal."
        actions={
          <Link
            className="ck-register-action-secondary"
            to="/app/ordens-servico"
          >
            Voltar
          </Link>
        }
      />

      {erro ? <div className="ck-register-alert">{erro}</div> : null}

      <OrdemServicoForm onSubmit={criar} />
    </main>
  );
}
