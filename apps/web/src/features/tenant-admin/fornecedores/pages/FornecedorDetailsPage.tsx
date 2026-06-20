// apps/web/src/features/tenant-admin/fornecedores/pages/FornecedorDetailsPage.tsx

import { Link, useParams } from "react-router-dom";
import { formatDateTime } from "../../../../shared/formatters";
import { useFornecedorDetails } from "../hooks/useFornecedorDetails";
import "../../shared/entityPages.css";

export default function FornecedorDetailsPage() {
  const params = useParams<{ fornecedorId: string }>();
  const fornecedorId = params.fornecedorId?.trim();

  const { fornecedor, isLoading, erro } = useFornecedorDetails(fornecedorId);

  if (isLoading) {
    return (
      <div className="ck-entity-page">
        <div className="ck-entity-card">Carregando fornecedor...</div>
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

  if (!fornecedor) {
    return (
      <div className="ck-entity-page">
        <div className="ck-entity-alert">Fornecedor não encontrado.</div>
      </div>
    );
  }

  return (
    <div className="ck-entity-page">
      <section className="ck-entity-hero">
        <div>
          <p className="ck-entity-kicker">Fornecedor</p>
          <h1>{fornecedor.nome}</h1>
          <p>{fornecedor.documento ?? "Documento não informado"}</p>
        </div>

        <div className="ck-entity-page__actions">
          <Link
            className="ck-entity-button ck-entity-button--primary"
            to={`/app/fornecedores/${fornecedor.fornecedorId}/editar`}
          >
            Editar
          </Link>

          <Link className="ck-entity-button" to="/app/fornecedores">
            Lista de fornecedores
          </Link>
        </div>
      </section>

      <section className="ck-entity-detail-grid">
        <article className="ck-entity-card">
          <div className="ck-entity-card__title">
            <h2>Identificação</h2>
            <p>Dados principais do fornecedor.</p>
          </div>

          <dl className="ck-entity-detail-list">
            <div>
              <dt>Nome</dt>
              <dd>{fornecedor.nome}</dd>
            </div>

            <div>
              <dt>Documento</dt>
              <dd>{fornecedor.documento ?? "—"}</dd>
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
              <dd>{fornecedor.email ?? "—"}</dd>
            </div>

            <div>
              <dt>Telefone</dt>
              <dd>{fornecedor.telefone ?? "—"}</dd>
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
            <dd>{formatDateTime(fornecedor.criadoEm)}</dd>
          </div>

          <div>
            <dt>Atualizado em</dt>
            <dd>{formatDateTime(fornecedor.atualizadoEm)}</dd>
          </div>
        </dl>
      </section>
    </div>
  );
}
