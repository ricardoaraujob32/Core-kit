// apps/web/src/features/tenant-admin/transacoes/pages/TransacoesListPage.tsx

import { useEffect, useMemo, useState } from "react";
import { Alert, Button, Card, EmptyState, Input, LinkButton, PageHeader, Select, SummaryCard } from "../../../../shared/ui";
import { mapError } from "../../../../core/errors/mapError";
import { clientesApi } from "../../clientes/api/clientesApi";
import type { Cliente } from "../../clientes/tipos";
import { fornecedoresApi } from "../../fornecedores/api/fornecedoresApi";
import type { Fornecedor } from "../../fornecedores/tipos";
import { TransacoesTable } from "../components/TransacoesTable";
import { useTransacoes } from "../hooks/useTransacoes";
import type { Transacao } from "../tipos";

type FiltroTipo = "TODOS" | "VENDA" | "COMPRA";

function formatarMoeda(valor: number): string { return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }); }
function codigoCurto(id: string): string { return id.slice(0, 8).toLowerCase(); }
function normalizar(value: string | null | undefined): string { return (value ?? "").trim().toLowerCase(); }
function totalPorStatus(itens: Transacao[], status: string): number { return itens.filter((item) => item.status === status).length; }
function somaTotal(itens: Transacao[]): number { return itens.reduce((acc, item) => acc + Number(item.valorTotal ?? 0), 0); }

function labelPessoaBusca(transacao: Transacao, clientesPorId: Map<string, Cliente>, fornecedoresPorId: Map<string, Fornecedor>): string {
  if (transacao.tipo === "COMPRA" && transacao.fornecedorId) {
    const fornecedor = fornecedoresPorId.get(transacao.fornecedorId);
    return [fornecedor?.nome, fornecedor?.documento, fornecedor?.email, fornecedor?.telefone, transacao.fornecedorId].filter(Boolean).join(" ");
  }
  if (transacao.clienteId) {
    const cliente = clientesPorId.get(transacao.clienteId);
    return [cliente?.nome, cliente?.documento, cliente?.email, cliente?.telefone, transacao.clienteId].filter(Boolean).join(" ");
  }
  return "";
}

export default function TransacoesListPage() {
  const { transacoes, busca, setBusca, tipo, setTipo, isLoading, erro, recarregar } = useTransacoes();
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
  const [erroApoio, setErroApoio] = useState<string | null>(null);

  useEffect(() => {
    let ativo = true;
    async function carregarApoio() {
      setErroApoio(null);
      try {
        const [clientesResponse, fornecedoresResponse] = await Promise.all([clientesApi.listar(), fornecedoresApi.listar()]);
        if (!ativo) return;
        setClientes(clientesResponse.itens);
        setFornecedores(fornecedoresResponse.itens);
      } catch (error) { if (ativo) setErroApoio(mapError(error).message); }
    }
    void carregarApoio();
    return () => { ativo = false; };
  }, []);

  const clientesPorId = useMemo(() => new Map(clientes.map((cliente) => [cliente.clienteId, cliente])), [clientes]);
  const fornecedoresPorId = useMemo(() => new Map(fornecedores.map((fornecedor) => [fornecedor.fornecedorId, fornecedor])), [fornecedores]);

  const transacoesFiltradas = useMemo(() => {
    const termo = normalizar(busca);
    return transacoes.filter((transacao) => {
      const atendeTipo = tipo === "TODOS" || transacao.tipo === tipo;
      if (!termo) return atendeTipo;
      const textoBusca = [transacao.transacaoId, codigoCurto(transacao.transacaoId), transacao.tipo, transacao.status, transacao.observacao, labelPessoaBusca(transacao, clientesPorId, fornecedoresPorId)].filter(Boolean).join(" ").toLowerCase();
      return atendeTipo && textoBusca.includes(termo);
    });
  }, [transacoes, busca, tipo, clientesPorId, fornecedoresPorId]);

  const vendas = transacoes.filter((item) => item.tipo === "VENDA");
  const compras = transacoes.filter((item) => item.tipo === "COMPRA");
  const abertas = transacoes.filter((item) => item.status === "ABERTA" || item.status === "RASCUNHO");

  return <div className="grid gap-6">
    <PageHeader title="Transações" description="Acompanhe compras e vendas por status, pessoa vinculada e valor." actions={<><LinkButton to="/app/vendas/nova" variant="primary">Nova venda</LinkButton><LinkButton to="/app/compras/nova">Nova compra</LinkButton></>} />
    <div className="grid gap-3 md:grid-cols-4"><SummaryCard label="Vendas" value={formatarMoeda(somaTotal(vendas))} hint={`${vendas.length} transação(ões)`} /><SummaryCard label="Compras" value={formatarMoeda(somaTotal(compras))} hint={`${compras.length} transação(ões)`} /><SummaryCard label="Abertas" value={abertas.length} hint="Aguardando conclusão" /><SummaryCard label="Concluídas" value={totalPorStatus(transacoes, "CONCLUIDA")} hint="Histórico finalizado" /></div>
    <Card><div className="grid gap-3 md:grid-cols-[1fr_180px_auto]"><Input placeholder="Buscar por cliente, fornecedor, documento, status ou código" value={busca} onChange={(event) => setBusca(event.target.value)} /><Select value={tipo} onChange={(event) => setTipo(event.target.value as FiltroTipo)}><option value="TODOS">Todos</option><option value="VENDA">Vendas</option><option value="COMPRA">Compras</option></Select><Button onClick={() => void recarregar()}>Recarregar</Button></div></Card>
    {erro ? <Alert variant="error">{erro}</Alert> : null}
    {erroApoio ? <Alert variant="warning">Não foi possível carregar nomes de clientes/fornecedores. Detalhe: {erroApoio}</Alert> : null}
    {isLoading ? <Card>Carregando transações...</Card> : transacoesFiltradas.length === 0 ? <EmptyState title="Nenhuma transação encontrada" description="Crie uma venda ou compra para começar a movimentar o sistema." action={<div className="flex justify-center gap-2"><LinkButton to="/app/vendas/nova" variant="primary">Nova venda</LinkButton><LinkButton to="/app/compras/nova">Nova compra</LinkButton></div>} /> : <TransacoesTable clientes={clientes} fornecedores={fornecedores} itens={transacoesFiltradas} />}
  </div>;
}
