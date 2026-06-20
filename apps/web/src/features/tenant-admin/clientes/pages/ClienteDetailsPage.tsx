// apps/web/src/features/tenant-admin/clientes/pages/ClienteDetailsPage.tsx

import { Link, useParams } from "react-router-dom";
import { formatDateTime } from "../../../../shared/formatters";
import { useClienteDetails } from "../hooks/useClienteDetails";
import "../../shared/entityPages.css";

export default function ClienteDetailsPage() {
  const params = useParams<{ clienteId: string }>();
  const clienteId = params.clienteId?.trim();

  const { cliente, isLoading, erro } = useClienteDetails(clienteId);

  if (isLoading) {
    return (
      <div className="ck-entity-page">
        <div className="ck-entity-card">Carregando cliente...</div>
      </div>
    );
  }

  if (erro) {
    return (
      <div className="ck-entity-page">
        <div className="ck-entity-alert">{erro}</div>
      </div>
    );
  }

  if (!cliente) {
    return (
      <div className="ck-entity-page">
        <div className="ck-entity-alert">Cliente não encontrado.</div>
      </div>
    );
  }

  return (
    <div className="ck-entity-page">
      <section className="ck-entity-hero">
        <div>
          <p className="ck-entity-kicker">Cliente</p>
          <h1>{cliente.nome}</h1>
          <p>{cliente.documento ?? "Documento não informado"}</p>
        </div>

        <div className="ck-entity-page__actions">
          <Link
            className="ck-entity-button ck-entity-button--primary"
            to={`/app/clientes/${cliente.clienteId}/editar`}
          >
            Editar
          </Link>

          <Link className="ck-entity-button" to="/app/clientes">
            Lista de clientes
          </Link>
        </div>
      </section>

      <section className="ck-entity-detail-grid">
        <article className="ck-entity-card">
          <div className="ck-entity-card__title">
            <h2>Identificação</h2>
            <p>Dados principais do cliente.</p>
          </div>

          <dl className="ck-entity-detail-list">
            <div>
              <dt>Nome</dt>
              <dd>{cliente.nome}</dd>
            </div>

            <div>
              <dt>Documento</dt>
              <dd>{cliente.documento ?? "—"}</dd>
            </div>
          </dl>
        </article>

        <article className="ck-entity-card">
          <div className="ck-entity-card__title">
            <h2>Contato</h2>
            <p>Canais de comunicação.</p>
          </div>

          <dl className="ck-entity-detail-list">
            <div>
              <dt>E-mail</dt>
              <dd>{cliente.email ?? "—"}</dd>
            </div>

            <div>
              <dt>Telefone</dt>
              <dd>{cliente.telefone ?? "—"}</dd>
            </div>
          </dl>
        </article>
      </section>

      <section className="ck-entity-card">
        <div className="ck-entity-card__title">
          <h2>Registro</h2>
        </div>

        <dl className="ck-entity-detail-list">
          <div>
            <dt>Criado em</dt>
            <dd>{formatDateTime(cliente.criadoEm)}</dd>
          </div>

          <div>
            <dt>Atualizado em</dt>
            <dd>{formatDateTime(cliente.atualizadoEm)}</dd>
          </div>
        </dl>
      </section>
    </div>
  );
}
