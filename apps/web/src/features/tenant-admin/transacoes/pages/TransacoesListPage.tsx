// apps/web/src/features/tenant-admin/transacoes/pages/TransacoesListPage.tsx

import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  TRANSACOES_MODULE,
  TRANSACOES_PERMISSIONS,
} from "../../../../core/api/permissions";
import { mapError } from "../../../../core/errors/mapError";
import { PageGuard } from "../../../../core/routing/pageGuard";
import { useAuthorization } from "../../../../core/auth/useAuthorization";
import { clientesApi } from "../../clientes/api/clientesApi";
import type { Cliente } from "../../clientes/tipos";
import { fornecedoresApi } from "../../fornecedores/api/fornecedoresApi";
import type { Fornecedor } from "../../fornecedores/tipos";
import { TransacoesTable } from "../components/TransacoesTable";
import { useTransacoesPermissions } from "../hooks/useTransacoesPermissions";
import { useTransacoes } from "../hooks/useTransacoes";
import type { Transacao } from "../tipos";
import "./transacoes.css";

type FiltroTipo = "TODOS" | "VENDA" | "COMPRA";

function formatarMoeda(valor: number): string {
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function codigoCurto(id: string): string {
  return id.slice(0, 8).toLowerCase();
}

function normalizar(value: string | null | undefined): string {
  return (value ?? "").trim().toLowerCase();
}

function totalPorStatus(itens: Transacao[], status: string): number {
  return itens.filter((item) => item.status === status).length;
}

function somaTotal(itens: Transacao[]): number {
  return itens.reduce((acc, item) => acc + Number(item.valorTotal ?? 0), 0);
}

function labelPessoaBusca(
  transacao: Transacao,
  clientesPorId: Map<string, Cliente>,
  fornecedoresPorId: Map<string, Fornecedor>,
): string {
  if (transacao.tipo === "COMPRA" && transacao.fornecedorId) {
    const fornecedor = fornecedoresPorId.get(transacao.fornecedorId);

    return [
      fornecedor?.nome,
      fornecedor?.documento,
      fornecedor?.email,
      fornecedor?.telefone,
      transacao.fornecedorId,
    ]
      .filter(Boolean)
      .join(" ");
  }

  if (transacao.clienteId) {
    const cliente = clientesPorId.get(transacao.clienteId);

    return [
      cliente?.nome,
      cliente?.documento,
      cliente?.email,
      cliente?.telefone,
      transacao.clienteId,
    ]
      .filter(Boolean)
      .join(" ");
  }

  return "";
}

export default function TransacoesListPage() {
  const authorization = useAuthorization();
  const permissions = useTransacoesPermissions();
  const {
    transacoes,
    busca,
    setBusca,
    tipo,
    setTipo,
    isLoading,
    erro,
    recarregar,
  } = useTransacoes(permissions.canList);

  const canLoadClientes = authorization.canAccessClientesModule();
  const canLoadFornecedores = authorization.canAccessFornecedoresModule();

  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
  const [erroApoio, setErroApoio] = useState<string | null>(null);

  useEffect(() => {
    let ativo = true;

    async function carregarApoio() {
      if (!permissions.canList) {
        setClientes([]);
        setFornecedores([]);
        setErroApoio(null);
        return;
      }

      setErroApoio(null);

      try {
        const [clientesResponse, fornecedoresResponse] = await Promise.all([
          canLoadClientes
            ? clientesApi.listar()
            : Promise.resolve({ itens: [] as Cliente[] }),
          canLoadFornecedores
            ? fornecedoresApi.listar()
            : Promise.resolve({ itens: [] as Fornecedor[] }),
        ]);

        if (!ativo) return;

        setClientes(clientesResponse.itens);
        setFornecedores(fornecedoresResponse.itens);
      } catch (error) {
        if (ativo) setErroApoio(mapError(error).message);
      }
    }

    void carregarApoio();

    return () => {
      ativo = false;
    };
  }, [canLoadClientes, canLoadFornecedores, permissions.canList]);

  const clientesPorId = useMemo(
    () => new Map(clientes.map((cliente) => [cliente.clienteId, cliente])),
    [clientes],
  );

  const fornecedoresPorId = useMemo(
    () =>
      new Map(
        fornecedores.map((fornecedor) => [
          fornecedor.fornecedorId,
          fornecedor,
        ]),
      ),
    [fornecedores],
  );

  const transacoesFiltradas = useMemo(() => {
    const termo = normalizar(busca);

    return transacoes.filter((transacao) => {
      const atendeTipo = tipo === "TODOS" || transacao.tipo === tipo;

      if (!termo) return atendeTipo;

      const textoBusca = [
        transacao.transacaoId,
        codigoCurto(transacao.transacaoId),
        transacao.tipo,
        transacao.status,
        transacao.observacao,
        labelPessoaBusca(transacao, clientesPorId, fornecedoresPorId),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return atendeTipo && textoBusca.includes(termo);
    });
  }, [transacoes, busca, tipo, clientesPorId, fornecedoresPorId]);

  const vendas = transacoes.filter((item) => item.tipo === "VENDA");
  const compras = transacoes.filter((item) => item.tipo === "COMPRA");
  const abertas = transacoes.filter(
    (item) => item.status === "ABERTA" || item.status === "RASCUNHO",
  );

  return (
    <div className="ck-page">
      <section className="ck-page-hero">
        <div className="ck-page-hero-inner">
          <div>
            <div className="ck-page-kicker">Operação</div>
            <h1 className="ck-page-title">Transações</h1>
            <p className="ck-page-description">
              Acompanhe compras e vendas com filtros, totais e status de cada
              operação.
            </p>
          </div>

          <div className="ck-page-actions">
            <PageGuard
              requiredModule={TRANSACOES_MODULE}
              requiredPermissions={[TRANSACOES_PERMISSIONS.CRIAR]}
            >
              <Link className="ck-action-primary" to="/app/vendas/nova">
                Nova venda
              </Link>

              <Link className="ck-action-secondary" to="/app/compras/nova">
                Nova compra
              </Link>
            </PageGuard>
          </div>
        </div>
      </section>

      {!permissions.canList ? (
        <div className="ck-alert">
          Você não possui permissão para acessar transações.
        </div>
      ) : null}

      <section className="ck-stats-grid">
        <article className="ck-stat-card" style={{ "--stat-color": "#16a34a" } as React.CSSProperties}>
          <div className="ck-stat-row">
            <div>
              <div className="ck-stat-label">Vendas</div>
              <div className="ck-stat-value">{formatarMoeda(somaTotal(vendas))}</div>
              <div className="ck-stat-hint">{vendas.length} transação(ões)</div>
            </div>
            <div className="ck-stat-icon">💰</div>
          </div>
        </article>

        <article className="ck-stat-card" style={{ "--stat-color": "#2563eb" } as React.CSSProperties}>
          <div className="ck-stat-row">
            <div>
              <div className="ck-stat-label">Compras</div>
              <div className="ck-stat-value">{formatarMoeda(somaTotal(compras))}</div>
              <div className="ck-stat-hint">{compras.length} transação(ões)</div>
            </div>
            <div className="ck-stat-icon">🛒</div>
          </div>
        </article>

        <article className="ck-stat-card" style={{ "--stat-color": "#f59e0b" } as React.CSSProperties}>
          <div className="ck-stat-row">
            <div>
              <div className="ck-stat-label">Abertas</div>
              <div className="ck-stat-value">{abertas.length}</div>
              <div className="ck-stat-hint">Aguardando conclusão</div>
            </div>
            <div className="ck-stat-icon">⚠️</div>
          </div>
        </article>

        <article className="ck-stat-card" style={{ "--stat-color": "#7c3aed" } as React.CSSProperties}>
          <div className="ck-stat-row">
            <div>
              <div className="ck-stat-label">Concluídas</div>
              <div className="ck-stat-value">{totalPorStatus(transacoes, "CONCLUIDA")}</div>
              <div className="ck-stat-hint">Histórico finalizado</div>
            </div>
            <div className="ck-stat-icon">✅</div>
          </div>
        </article>
      </section>

      <section className="ck-filter-panel">
        <div className="ck-filter-grid">
          <input
            className="ck-input"
            placeholder="Buscar por cliente, fornecedor, documento, status ou código"
            value={busca}
            onChange={(event) => setBusca(event.target.value)}
          />

          <select
            className="ck-select"
            value={tipo}
            onChange={(event) => setTipo(event.target.value as FiltroTipo)}
          >
            <option value="TODOS">Todos</option>
            <option value="VENDA">Vendas</option>
            <option value="COMPRA">Compras</option>
          </select>

          <button
            className="ck-button"
            type="button"
            onClick={() => void recarregar()}
          >
            Recarregar
          </button>
        </div>
      </section>

      {erro ? <div className="ck-alert">{erro}</div> : null}

      {erroApoio ? (
        <div className="ck-alert ck-alert-warning">
          Não foi possível carregar nomes de clientes/fornecedores. Detalhe:{" "}
          {erroApoio}
        </div>
      ) : null}

      {permissions.canList && isLoading ? (
        <div className="ck-filter-panel">Carregando transações...</div>
      ) : permissions.canList && transacoesFiltradas.length === 0 ? (
        <div className="ck-empty">
          <div className="ck-empty-title">Nenhuma transação encontrada</div>
          <p className="ck-empty-desc">
            Crie uma venda ou compra para começar a movimentar o sistema.
          </p>
        </div>
      ) : permissions.canList ? (
        <TransacoesTable
          clientes={clientes}
          fornecedores={fornecedores}
          itens={transacoesFiltradas}
        />
      ) : null}
    </div>
  );
}
