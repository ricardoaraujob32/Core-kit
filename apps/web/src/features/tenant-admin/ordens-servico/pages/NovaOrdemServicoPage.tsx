// apps/web/src/features/tenant-admin/ordens-servico/pages/NovaOrdemServicoPage.tsx

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { mapError } from "../../../../core/errors/mapError";
import { ordensServicoApi } from "../api/ordensServicoApi";
import { OrdemServicoForm } from "../components/OrdemServicoForm";
import type { CriarOrdemServicoInput } from "../tipos";
import "../../shared/entityPages.css";

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
    <div className="ck-entity-page">
      <div className="ck-entity-page__actions">
        <Link className="ck-entity-button" to="/app/ordens-servico">
          Voltar para ordens
        </Link>
      </div>

      <section className="ck-entity-hero">
        <div>
          <p className="ck-entity-kicker">Ordens de serviço</p>
          <h1>Nova OS</h1>
          <p>
            Registre uma ordem de serviço usando cliente, título e descrição.
          </p>
        </div>
      </section>

      {erro ? <div className="ck-entity-alert">{erro}</div> : null}

      <section className="ck-entity-card">
        <div className="ck-entity-card__title">
          <h2>Dados da ordem</h2>
          <p>Informe o contexto inicial para acompanhar a execução.</p>
        </div>

        <OrdemServicoForm onSubmit={criar} />
      </section>
    </div>
  );
}
