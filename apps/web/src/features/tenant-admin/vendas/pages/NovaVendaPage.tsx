// apps/web/src/features/tenant-admin/vendas/pages/NovaVendaPage.tsx

import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Alert, Button, Card, DescriptionList, Field, Input, LinkButton, PageHeader, Select, Textarea } from "../../../../shared/ui";
import { mapError } from "../../../../core/errors/mapError";
import { clientesApi } from "../../clientes/api/clientesApi";
import type { Cliente } from "../../clientes/tipos";
import { vendasApi } from "../api/vendasApi";

function labelCliente(cliente: Cliente): string { return cliente.documento ? `${cliente.nome} — ${cliente.documento}` : cliente.nome; }
function textoBuscaCliente(cliente: Cliente): string { return [cliente.nome, cliente.documento, cliente.email, cliente.telefone].filter(Boolean).join(" ").toLowerCase(); }

export default function NovaVendaPage() {
  const navigate = useNavigate();
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [clienteId, setClienteId] = useState("");
  const [buscaCliente, setBuscaCliente] = useState("");
  const [observacao, setObservacao] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [erroClientes, setErroClientes] = useState<string | null>(null);
  const [isLoadingClientes, setIsLoadingClientes] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => { let ativo = true; async function carregarClientes() { setIsLoadingClientes(true); setErroClientes(null); try { const response = await clientesApi.listar(); if (ativo) setClientes(response.itens); } catch (error) { if (ativo) setErroClientes(mapError(error).message); } finally { if (ativo) setIsLoadingClientes(false); } } void carregarClientes(); return () => { ativo = false; }; }, []);
  const clientesFiltrados = useMemo(() => { const termo = buscaCliente.trim().toLowerCase(); if (!termo) return clientes; return clientes.filter((cliente) => textoBuscaCliente(cliente).includes(termo)); }, [clientes, buscaCliente]);
  const clienteSelecionado = clientes.find((cliente) => cliente.clienteId === clienteId);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) { event.preventDefault(); setErro(null); setIsSaving(true); try { const response = await vendasApi.criar({ clienteId: clienteId.trim() || null, observacao: observacao.trim() || null }); navigate(`/app/transacoes/${response.item.transacaoId}`); } catch (error) { setErro(mapError(error).message); } finally { setIsSaving(false); } }

  return <form className="grid gap-6" onSubmit={handleSubmit}>
    <PageHeader title="Nova venda" description="Crie a venda e depois adicione os produtos na tela de detalhes." actions={<LinkButton to="/app/transacoes">Voltar</LinkButton>} />
    {erro ? <Alert variant="error">{erro}</Alert> : null}
    {erroClientes ? <Alert variant="warning">Não foi possível carregar clientes: {erroClientes}</Alert> : null}
    <Card title="Cliente" description="Busque por nome, documento, e-mail ou telefone."><div className="grid gap-4"><Field label="Buscar cliente"><Input placeholder="Ex.: Maria, CPF/CNPJ, e-mail..." value={buscaCliente} onChange={(event) => setBuscaCliente(event.target.value)} /></Field><Field label="Cliente selecionado"><Select value={clienteId} onChange={(event) => setClienteId(event.target.value)} disabled={isLoadingClientes}><option value="">{isLoadingClientes ? "Carregando clientes..." : "Venda sem cliente"}</option>{clientesFiltrados.map((cliente) => <option key={cliente.clienteId} value={cliente.clienteId}>{labelCliente(cliente)}</option>)}</Select></Field>{clienteSelecionado ? <div className="rounded-xl border bg-slate-50 p-4"><DescriptionList columns={2} items={[{ label: "Nome", value: clienteSelecionado.nome }, { label: "Documento", value: clienteSelecionado.documento ?? "—" }, { label: "E-mail", value: clienteSelecionado.email ?? "—" }, { label: "Telefone", value: clienteSelecionado.telefone ?? "—" }]} /></div> : null}</div></Card>
    <Card title="Observação"><Field label="Observação da venda"><Textarea value={observacao} onChange={(event) => setObservacao(event.target.value)} placeholder="Ex.: venda balcão, pedido especial, condições combinadas..." rows={3} /></Field></Card>
    <div className="flex justify-end"><Button disabled={isSaving} type="submit" variant="primary">{isSaving ? "Criando..." : "Criar venda e adicionar itens"}</Button></div>
  </form>;
}
