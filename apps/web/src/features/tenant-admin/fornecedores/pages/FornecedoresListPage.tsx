// apps/web/src/features/tenant-admin/fornecedores/pages/FornecedoresListPage.tsx

import { Link } from "react-router-dom";
import {
  FORNECEDORES_MODULE,
  FORNECEDORES_PERMISSIONS,
} from "../../../../core/api/permissions";
import { PageGuard } from "../../../../core/routing/pageGuard";
import { FornecedoresTable } from "../components/FornecedoresTable";
import { useFornecedores } from "../hooks/useFornecedores";
import { useFornecedoresPermissions } from "../hooks/useFornecedoresPermissions";
import "../../cadastros/cadastros.css";

function contarComEmail<T extends { email?: string | null }>(itens: T[]): number {
  return itens.filter((item) => Boolean(item.email?.trim())).length;
}

function contarComDocumento<T extends { documento?: string | null }>(itens: T[]): number {
  return itens.filter((item) => Boolean(item.documento?.trim())).length;
}

export default function FornecedoresListPage() {
  const {
    fornecedores,
    busca,
    setBusca,
    isLoading,
    erro,
    recarregar,
  } = useFornecedores();
  const permissions = useFornecedoresPermissions();

  return (
    <div className="ck-register-page">
      <section className="ck-register-hero">
        <div className="ck-register-hero-inner">
          <div>
            <div className="ck-register-kicker">Cadastros</div>
            <h1 className="ck-register-title">Fornecedores</h1>
            <p className="ck-register-description">
              Organize fornecedores para compras, reposições e histórico de
              relacionamento comercial.
            </p>
          </div>

          <div className="ck-register-actions">
            <PageGuard
              requiredModule={FORNECEDORES_MODULE}
              requiredPermissions={[FORNECEDORES_PERMISSIONS.CRIAR]}
            >
              <Link className="ck-register-action-primary" to="/app/fornecedores/novo">
                Novo fornecedor
              </Link>
            </PageGuard>
          </div>
        </div>
      </section>

      {!permissions.canList ? (
        <div className="ck-register-alert">
          Você não possui permissão para acessar fornecedores.
        </div>
      ) : null}

      <section className="ck-register-stats">
        <article className="ck-register-stat" style={{ "--stat-color": "#2563eb" } as React.CSSProperties}>
          <div className="ck-register-stat-row">
            <div>
              <div className="ck-register-stat-label">Fornecedores</div>
              <div className="ck-register-stat-value">{fornecedores.length}</div>
              <div className="ck-register-stat-hint">Total cadastrado</div>
            </div>
            <div className="ck-register-stat-icon">🏢</div>
          </div>
        </article>

        <article className="ck-register-stat" style={{ "--stat-color": "#7c3aed" } as React.CSSProperties}>
          <div className="ck-register-stat-row">
            <div>
              <div className="ck-register-stat-label">Com documento</div>
              <div className="ck-register-stat-value">{contarComDocumento(fornecedores)}</div>
              <div className="ck-register-stat-hint">CPF/CNPJ informado</div>
            </div>
            <div className="ck-register-stat-icon">🪪</div>
          </div>
        </article>

        <article className="ck-register-stat" style={{ "--stat-color": "#16a34a" } as React.CSSProperties}>
          <div className="ck-register-stat-row">
            <div>
              <div className="ck-register-stat-label">Com e-mail</div>
              <div className="ck-register-stat-value">{contarComEmail(fornecedores)}</div>
              <div className="ck-register-stat-hint">Contato digital</div>
            </div>
            <div className="ck-register-stat-icon">✉️</div>
          </div>
        </article>
      </section>

      <section className="ck-register-filter">
        <div className="ck-register-filter-grid">
          <input
            className="ck-register-input"
            placeholder="Buscar por nome, documento, e-mail ou telefone"
            value={busca}
            onChange={(event) => setBusca(event.target.value)}
          />

          <button
            className="ck-register-button"
            type="button"
            onClick={() => void recarregar()}
          >
            Recarregar
          </button>
        </div>
      </section>

      {erro ? <div className="ck-register-alert">{erro}</div> : null}

      {permissions.canList && isLoading ? (
        <div className="ck-register-filter">Carregando fornecedores...</div>
      ) : permissions.canList ? (
        <FornecedoresTable itens={fornecedores} />
      ) : null}
    </div>
  );
}
