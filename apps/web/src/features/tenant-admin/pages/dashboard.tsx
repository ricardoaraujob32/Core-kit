// apps/web/src/features/tenant-admin/pages/dashboard.tsx

import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { mapError } from "../../../core/errors/mapError";
import { useTenant } from "../../../core/tenant/useTenant";
import { clientesApi } from "../clientes/api/clientesApi";
import type { Cliente } from "../clientes/tipos";
import { fornecedoresApi } from "../fornecedores/api/fornecedoresApi";
import type { Fornecedor } from "../fornecedores/tipos";
import { produtosApi } from "../produtos/api/produtosApi";
import type { Produto } from "../produtos/tipos";
import { transacoesApi } from "../transacoes/api/transacoesApi";
import type { Transacao } from "../transacoes/tipos";
import "./dashboard.css";

type DashboardData = {
  clientes: Cliente[];
  fornecedores: Fornecedor[];
  produtos: Produto[];
  transacoes: Transacao[];
};

function formatarMoeda(valor: number): string {
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function formatarData(value?: string | null): string {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("pt-BR");
}

function codigoCurto(id: string): string {
  return id.slice(0, 8).toUpperCase();
}

function somaTransacoes(itens: Transacao[], tipo: "VENDA" | "COMPRA"): number {
  return itens
    .filter((item) => item.tipo === tipo && item.status === "CONCLUIDA")
    .reduce((acc, item) => acc + Number(item.valorTotal ?? 0), 0);
}

function contarAbertas(itens: Transacao[]): number {
  return itens.filter(
    (item) => item.status === "ABERTA" || item.status === "RASCUNHO",
  ).length;
}

function contarConcluidas(itens: Transacao[]): number {
  return itens.filter((item) => item.status === "CONCLUIDA").length;
}

function produtoSemPreco(produto: Produto): boolean {
  return Number(produto.precoVenda ?? 0) <= 0;
}

function transacaoLabel(transacao: Transacao): string {
  return `${transacao.tipo} #${codigoCurto(transacao.transacaoId)}`;
}

function transacaoDescricao(transacao: Transacao): string {
  return `${transacao.status} • ${formatarMoeda(Number(transacao.valorTotal ?? 0))}`;
}

export default function TenantAdminDashboard() {
  const { branding } = useTenant();

  const [data, setData] = useState<DashboardData>({
    clientes: [],
    fornecedores: [],
    produtos: [],
    transacoes: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    let ativo = true;

    async function carregarDashboard() {
      setIsLoading(true);
      setErro(null);

      try {
        const [clientesResponse, fornecedoresResponse, produtosResponse, transacoesResponse] =
          await Promise.all([
            clientesApi.listar(),
            fornecedoresApi.listar(),
            produtosApi.listar(),
            transacoesApi.listar(),
          ]);

        if (!ativo) return;

        setData({
          clientes: clientesResponse.itens,
          fornecedores: fornecedoresResponse.itens,
          produtos: produtosResponse.itens,
          transacoes: transacoesResponse.itens,
        });
      } catch (error) {
        if (ativo) setErro(mapError(error).message);
      } finally {
        if (ativo) setIsLoading(false);
      }
    }

    void carregarDashboard();

    return () => {
      ativo = false;
    };
  }, []);

  const resumo = useMemo(() => {
    const vendasConcluidas = somaTransacoes(data.transacoes, "VENDA");
    const comprasConcluidas = somaTransacoes(data.transacoes, "COMPRA");
    const abertas = contarAbertas(data.transacoes);
    const concluidas = contarConcluidas(data.transacoes);
    const produtosSemPreco = data.produtos.filter(produtoSemPreco).length;

    return {
      vendasConcluidas,
      comprasConcluidas,
      abertas,
      concluidas,
      produtosSemPreco,
    };
  }, [data]);

  const ultimasTransacoes = [...data.transacoes]
    .sort((a, b) => {
      const dataA = new Date(a.criadoEm ?? "").getTime();
      const dataB = new Date(b.criadoEm ?? "").getTime();

      return dataB - dataA;
    })
    .slice(0, 5);

  const nomeLocatario = branding?.nomeFantasia?.trim() || "seu negócio";

  if (isLoading) {
    return (
      <div className="ck-dashboard">
        <div className="ck-skeleton" />
        <div className="ck-metrics-grid">
          <div className="ck-skeleton" />
          <div className="ck-skeleton" />
          <div className="ck-skeleton" />
          <div className="ck-skeleton" />
        </div>
      </div>
    );
  }

  if (erro) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
        {erro}
      </div>
    );
  }

  return (
    <div className="ck-dashboard">
      <section className="ck-dashboard-hero">
        <div className="ck-dashboard-hero-content">
          <span className="ck-dashboard-kicker">Painel do locatário</span>

          <div>
            <h1 className="ck-dashboard-title">
              Visão rápida de {nomeLocatario}
            </h1>

            <p className="ck-dashboard-subtitle">
              Acompanhe vendas, compras, produtos e cadastros em um só lugar.
              Esta tela é o ponto de partida operacional da beta.
            </p>
          </div>

          <div className="ck-dashboard-actions">
            <Link className="ck-dashboard-action-primary" to="/app/vendas/nova">
              Criar venda
            </Link>

            <Link className="ck-dashboard-action-secondary" to="/app/compras/nova">
              Registrar compra
            </Link>

            <Link className="ck-dashboard-action-secondary" to="/app/transacoes">
              Ver transações
            </Link>
          </div>
        </div>
      </section>

      <section className="ck-metrics-grid">
        <article className="ck-metric-card" style={{ "--metric-color": "#16a34a" } as React.CSSProperties}>
          <div className="ck-metric-top">
            <div>
              <div className="ck-metric-label">Vendas concluídas</div>
              <div className="ck-metric-value">
                {formatarMoeda(resumo.vendasConcluidas)}
              </div>
              <div className="ck-metric-hint">{data.transacoes.filter((item) => item.tipo === "VENDA").length} venda(s) no histórico</div>
            </div>
            <div className="ck-metric-icon">💰</div>
          </div>
        </article>

        <article className="ck-metric-card" style={{ "--metric-color": "#2563eb" } as React.CSSProperties}>
          <div className="ck-metric-top">
            <div>
              <div className="ck-metric-label">Compras concluídas</div>
              <div className="ck-metric-value">
                {formatarMoeda(resumo.comprasConcluidas)}
              </div>
              <div className="ck-metric-hint">{data.transacoes.filter((item) => item.tipo === "COMPRA").length} compra(s) no histórico</div>
            </div>
            <div className="ck-metric-icon">🛒</div>
          </div>
        </article>

        <article className="ck-metric-card" style={{ "--metric-color": "#7c3aed" } as React.CSSProperties}>
          <div className="ck-metric-top">
            <div>
              <div className="ck-metric-label">Clientes</div>
              <div className="ck-metric-value">{data.clientes.length}</div>
              <div className="ck-metric-hint">{data.fornecedores.length} fornecedor(es) cadastrados</div>
            </div>
            <div className="ck-metric-icon">👥</div>
          </div>
        </article>

        <article className="ck-metric-card" style={{ "--metric-color": "#f97316" } as React.CSSProperties}>
          <div className="ck-metric-top">
            <div>
              <div className="ck-metric-label">Produtos</div>
              <div className="ck-metric-value">{data.produtos.length}</div>
              <div className="ck-metric-hint">{resumo.produtosSemPreco} produto(s) sem preço de venda</div>
            </div>
            <div className="ck-metric-icon">📦</div>
          </div>
        </article>
      </section>

      <section className="ck-dashboard-grid">
        <div className="ck-panel">
          <div className="ck-panel-header">
            <div>
              <div className="ck-panel-title">Próximas ações</div>
              <p className="ck-panel-desc">
                Pontos que merecem atenção para manter a operação organizada.
              </p>
            </div>
          </div>

          <div className="ck-panel-body">
            <div className="ck-alert-list">
              <Link className="ck-alert-item" to="/app/transacoes">
                <span className="ck-alert-icon">⚠️</span>
                <span>
                  <span className="ck-alert-title">{resumo.abertas} transação(ões) abertas</span>
                  <span className="ck-alert-desc">
                    Confirme ou cancele vendas/compras em rascunho.
                  </span>
                </span>
              </Link>

              <Link className="ck-alert-item" to="/app/produtos">
                <span className="ck-alert-icon">🏷️</span>
                <span>
                  <span className="ck-alert-title">{resumo.produtosSemPreco} produto(s) sem preço</span>
                  <span className="ck-alert-desc">
                    Produtos sem preço dificultam vendas rápidas.
                  </span>
                </span>
              </Link>

              <Link className="ck-alert-item" to="/app/clientes/novo">
                <span className="ck-alert-icon">✨</span>
                <span>
                  <span className="ck-alert-title">Cadastre clientes recorrentes</span>
                  <span className="ck-alert-desc">
                    Melhora o histórico e reduz digitação em novas vendas.
                  </span>
                </span>
              </Link>
            </div>
          </div>
        </div>

        <div className="ck-panel">
          <div className="ck-panel-header">
            <div>
              <div className="ck-panel-title">Atalhos rápidos</div>
              <p className="ck-panel-desc">
                Ações comuns para operação diária.
              </p>
            </div>
          </div>

          <div className="ck-panel-body">
            <div className="ck-quick-list">
              <Link className="ck-quick-item" to="/app/clientes/novo">
                <span className="ck-quick-icon">👤</span>
                <span>
                  <span className="ck-quick-title">Novo cliente</span>
                  <span className="ck-quick-desc">Cadastrar pessoa ou empresa.</span>
                </span>
              </Link>

              <Link className="ck-quick-item" to="/app/produtos/novo">
                <span className="ck-quick-icon">📦</span>
                <span>
                  <span className="ck-quick-title">Novo produto</span>
                  <span className="ck-quick-desc">Adicionar item vendável.</span>
                </span>
              </Link>

              <Link className="ck-quick-item" to="/app/fornecedores/novo">
                <span className="ck-quick-icon">🏢</span>
                <span>
                  <span className="ck-quick-title">Novo fornecedor</span>
                  <span className="ck-quick-desc">Organizar origem das compras.</span>
                </span>
              </Link>
            </div>
          </div>
        </div>

        <div className="ck-panel">
          <div className="ck-panel-header">
            <div>
              <div className="ck-panel-title">Últimas transações</div>
              <p className="ck-panel-desc">
                Histórico recente de compras e vendas.
              </p>
            </div>

            <Link className="text-sm font-semibold text-blue-700 hover:underline" to="/app/transacoes">
              Ver todas
            </Link>
          </div>

          <div className="ck-panel-body">
            {ultimasTransacoes.length === 0 ? (
              <div className="ck-empty-panel">
                Nenhuma transação criada ainda.
              </div>
            ) : (
              <div className="ck-activity-list">
                {ultimasTransacoes.map((transacao) => (
                  <Link
                    className="ck-activity-item"
                    key={transacao.transacaoId}
                    to={`/app/transacoes/${transacao.transacaoId}`}
                  >
                    <span className="ck-activity-icon">
                      {transacao.tipo === "VENDA" ? "💰" : "🛒"}
                    </span>

                    <span>
                      <span className="ck-activity-title">
                        {transacaoLabel(transacao)}
                      </span>
                      <span className="ck-activity-desc">
                        {transacaoDescricao(transacao)}
                      </span>
                    </span>

                    <span className="ck-activity-meta">
                      {formatarData(transacao.criadoEm)}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="ck-panel">
          <div className="ck-panel-header">
            <div>
              <div className="ck-panel-title">Resumo operacional</div>
              <p className="ck-panel-desc">
                Cadastros básicos disponíveis.
              </p>
            </div>
          </div>

          <div className="ck-panel-body">
            <div className="ck-alert-list">
              <div className="ck-alert-item">
                <span className="ck-alert-icon">✅</span>
                <span>
                  <span className="ck-alert-title">{resumo.concluidas} transação(ões) concluídas</span>
                  <span className="ck-alert-desc">Histórico operacional finalizado.</span>
                </span>
              </div>

              <div className="ck-alert-item">
                <span className="ck-alert-icon">📇</span>
                <span>
                  <span className="ck-alert-title">{data.clientes.length + data.fornecedores.length} contato(s)</span>
                  <span className="ck-alert-desc">Clientes e fornecedores cadastrados.</span>
                </span>
              </div>

              <div className="ck-alert-item">
                <span className="ck-alert-icon">🧪</span>
                <span>
                  <span className="ck-alert-title">Beta publicada</span>
                  <span className="ck-alert-desc">Base pronta para evoluir PWA e relatórios.</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
