// apps/web/src/features/tenant-admin/compras/pages/NovaCompraPage.tsx

import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Alert, Button, Card, DescriptionList, Field, Input, LinkButton, PageHeader, Select, Textarea } from "../../../../shared/ui";
import { mapError } from "../../../../core/errors/mapError";
import { fornecedoresApi } from "../../fornecedores/api/fornecedoresApi";
import type { Fornecedor } from "../../fornecedores/tipos";
import { comprasApi } from "../api/comprasApi";

function labelFornecedor(fornecedor: Fornecedor): string { return fornecedor.documento ? `${fornecedor.nome} — ${fornecedor.documento}` : fornecedor.nome; }
function textoBuscaFornecedor(fornecedor: Fornecedor): string { return [fornecedor.nome, fornecedor.documento, fornecedor.email, fornecedor.telefone].filter(Boolean).join(" ").toLowerCase(); }

export default function NovaCompraPage() {
  const navigate = useNavigate();
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
  const [fornecedorId, setFornecedorId] = useState("");
  const [buscaFornecedor, setBuscaFornecedor] = useState("");
  const [observacao, setObservacao] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [erroFornecedores, setErroFornecedores] = useState<string | null>(null);
  const [isLoadingFornecedores, setIsLoadingFornecedores] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => { let ativo = true; async function carregarFornecedores() { setIsLoadingFornecedores(true); setErroFornecedores(null); try { const response = await fornecedoresApi.listar(); if (ativo) setFornecedores(response.itens); } catch (error) { if (ativo) setErroFornecedores(mapError(error).message); } finally { if (ativo) setIsLoadingFornecedores(false); } } void carregarFornecedores(); return () => { ativo = false; }; }, []);
  const fornecedoresFiltrados = useMemo(() => { const termo = buscaFornecedor.trim().toLowerCase(); if (!termo) return fornecedores; return fornecedores.filter((fornecedor) => textoBuscaFornecedor(fornecedor).includes(termo)); }, [fornecedores, buscaFornecedor]);
  const fornecedorSelecionado = fornecedores.find((fornecedor) => fornecedor.fornecedorId === fornecedorId);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) { event.preventDefault(); setErro(null); setIsSaving(true); try { const response = await comprasApi.criar({ fornecedorId: fornecedorId.trim() || null, observacao: observacao.trim() || null }); navigate(`/app/transacoes/${response.item.transacaoId}`); } catch (error) { setErro(mapError(error).message); } finally { setIsSaving(false); } }

  return <form className="grid gap-6" onSubmit={handleSubmit}>
    <PageHeader title="Nova compra" description="Crie a compra e depois adicione os produtos na tela de detalhes." actions={<LinkButton to="/app/transacoes">Voltar</LinkButton>} />
    {erro ? <Alert variant="error">{erro}</Alert> : null}
    {erroFornecedores ? <Alert variant="warning">Não foi possível carregar fornecedores: {erroFornecedores}</Alert> : null}
    <Card title="Fornecedor" description="Busque por nome, documento, e-mail ou telefone."><div className="grid gap-4"><Field label="Buscar fornecedor"><Input placeholder="Ex.: Distribuidora, CNPJ, e-mail..." value={buscaFornecedor} onChange={(event) => setBuscaFornecedor(event.target.value)} /></Field><Field label="Fornecedor selecionado"><Select value={fornecedorId} onChange={(event) => setFornecedorId(event.target.value)} disabled={isLoadingFornecedores}><option value="">{isLoadingFornecedores ? "Carregando fornecedores..." : "Compra sem fornecedor"}</option>{fornecedoresFiltrados.map((fornecedor) => <option key={fornecedor.fornecedorId} value={fornecedor.fornecedorId}>{labelFornecedor(fornecedor)}</option>)}</Select></Field>{fornecedorSelecionado ? <div className="rounded-xl border bg-slate-50 p-4"><DescriptionList columns={2} items={[{ label: "Nome", value: fornecedorSelecionado.nome }, { label: "Documento", value: fornecedorSelecionado.documento ?? "—" }, { label: "E-mail", value: fornecedorSelecionado.email ?? "—" }, { label: "Telefone", value: fornecedorSelecionado.telefone ?? "—" }]} /></div> : null}</div></Card>
    <Card title="Observação"><Field label="Observação da compra"><Textarea value={observacao} onChange={(event) => setObservacao(event.target.value)} placeholder="Ex.: reposição de estoque, compra de fornecedor, lote especial..." rows={3} /></Field></Card>
    <div className="flex justify-end"><Button disabled={isSaving} type="submit" variant="primary">{isSaving ? "Criando..." : "Criar compra e adicionar itens"}</Button></div>
  </form>;
}
