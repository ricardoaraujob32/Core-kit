// apps/web/src/features/tenant-admin/ordens-servico/components/OrdemServicoForm.tsx

import { useMemo, useState, type FormEvent } from "react";
import { mapError } from "../../../../core/errors/mapError";
import { formatClienteLabel, formatMoney } from "../../../../shared/formatters";
import { PwaResourceNotice } from "../../../../shared/pwa/PwaResourceNotice";
import { useClientesCached } from "../../clientes/hooks/useClientesCached";
import { InlineClienteForm } from "../../clientes/components/InlineClienteForm";
import type { Cliente } from "../../clientes/tipos";
import { useServicosCached } from "../../produtos/hooks/useProdutosCached";
import { InlineServicoForm } from "../../produtos/components/InlineServicoForm";
import type { Produto } from "../../produtos/tipos";
import {
  EntityAlert,
  EntityButton,
  EntityCard,
  EntityField,
  EntityForm,
  EntityFormGrid,
} from "../../shared/entity-ui";
import type { CriarOrdemServicoInput } from "../tipos";

type Props = {
  usuarioId: string;
  onSubmit: (input: CriarOrdemServicoInput) => Promise<void>;
  initialValues?: Partial<CriarOrdemServicoInput>;
};

function textoBuscaCliente(cliente: Cliente): string {
  return [cliente.nome, cliente.documento, cliente.email, cliente.telefone]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function textoBuscaServico(servico: Produto): string {
  return [
    servico.nome,
    servico.sku,
    servico.descricao,
    servico.unidade,
    servico.tipo,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function normalizarTextoOpcional(value: string): string | null {
  const texto = value.trim();
  return texto ? texto : null;
}

function formatServicoLabel(servico: Produto): string {
  const preco =
    typeof servico.precoVenda === "number"
      ? ` — ${formatMoney(servico.precoVenda)}`
      : "";

  return `${servico.nome ?? "Serviço sem nome"}${preco}`;
}

function montarDescricaoComServico(
  servico: Produto,
  descricaoAtual: string,
): string {
  const partes = [servico.descricao?.trim(), descricaoAtual.trim()].filter(
    Boolean,
  );

  return Array.from(new Set(partes)).join("\n\n");
}

export function OrdemServicoForm({
  usuarioId,
  onSubmit,
  initialValues,
}: Props) {
  const clientesResource = useClientesCached();
  const servicosResource = useServicosCached();

  const [clientesLocais, setClientesLocais] = useState<Cliente[]>([]);
  const [servicosLocais, setServicosLocais] = useState<Produto[]>([]);

  const [titulo, setTitulo] = useState(initialValues?.titulo ?? "");
  const [clienteId, setClienteId] = useState(initialValues?.clienteId ?? "");
  const [servicoId, setServicoId] = useState(initialValues?.servicoId ?? "");
  const [descricao, setDescricao] = useState(initialValues?.descricao ?? "");

  const [buscaCliente, setBuscaCliente] = useState("");
  const [buscaServico, setBuscaServico] = useState("");
  const [inlineClienteAberto, setInlineClienteAberto] = useState(false);
  const [inlineServicoAberto, setInlineServicoAberto] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);

  const clientes = useMemo(() => {
    const ids = new Set<string>();
    const merged: Cliente[] = [];

    for (const cliente of [...clientesLocais, ...clientesResource.data]) {
      if (!ids.has(cliente.clienteId)) {
        ids.add(cliente.clienteId);
        merged.push(cliente);
      }
    }

    return merged;
  }, [clientesLocais, clientesResource.data]);

  const servicos = useMemo(() => {
    const ids = new Set<string>();
    const merged: Produto[] = [];

    for (const servico of [...servicosLocais, ...servicosResource.data]) {
      if (!ids.has(servico.produtoId)) {
        ids.add(servico.produtoId);
        merged.push(servico);
      }
    }

    return merged;
  }, [servicosLocais, servicosResource.data]);

  const clientesFiltrados = useMemo(() => {
    const termo = buscaCliente.trim().toLowerCase();

    if (!termo) return clientes;

    return clientes.filter((cliente) =>
      textoBuscaCliente(cliente).includes(termo),
    );
  }, [clientes, buscaCliente]);

  const servicosFiltrados = useMemo(() => {
    const termo = buscaServico.trim().toLowerCase();

    if (!termo) return servicos;

    return servicos.filter((servico) =>
      textoBuscaServico(servico).includes(termo),
    );
  }, [servicos, buscaServico]);

  const clienteSelecionado = clientes.find(
    (cliente) => cliente.clienteId === clienteId,
  );

  const servicoSelecionado = servicos.find(
    (servico) => servico.produtoId === servicoId,
  );

  function selecionarClienteCriado(cliente: Cliente) {
    setClientesLocais((current) => [
      cliente,
      ...current.filter((item) => item.clienteId !== cliente.clienteId),
    ]);
    setClienteId(cliente.clienteId);
    setBuscaCliente("");
    setInlineClienteAberto(false);
  }

  function selecionarServicoCriado(servico: Produto) {
    setServicosLocais((current) => [
      servico,
      ...current.filter((item) => item.produtoId !== servico.produtoId),
    ]);
    setServicoId(servico.produtoId);
    setBuscaServico("");
    setInlineServicoAberto(false);

    if (!titulo.trim()) {
      setTitulo(servico.nome ?? "");
    }

    setDescricao((current) => montarDescricaoComServico(servico, current));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!usuarioId.trim()) {
      setErro("Usuário autenticado não identificado.");
      return;
    }

    if (!titulo.trim()) {
      setErro("Informe o título da ordem de serviço.");
      return;
    }

    setErro(null);
    setSalvando(true);

    try {
      await onSubmit({
        usuarioId,
        clienteId: clienteId || null,
        servicoId: servicoId || null,
        titulo: titulo.trim(),
        descricao: normalizarTextoOpcional(descricao),
      });
    } catch (error) {
      setErro(mapError(error).message);
    } finally {
      setSalvando(false);
    }
  }

  return (
    <EntityForm
      kicker="Ordens de serviço"
      title="Nova ordem de serviço"
      description="Cadastre a OS com cliente, serviço e descrição operacional."
      error={erro}
      onSubmit={handleSubmit}
      footer={
        <EntityButton type="submit" variant="primary" disabled={salvando}>
          {salvando ? "Salvando..." : "Salvar OS"}
        </EntityButton>
      }
    >
      <EntityCard
        title="Cliente"
        description="Vincule um cliente existente ou cadastre rapidamente um novo."
      >
        <PwaResourceNotice
          isRefreshing={clientesResource.isRefreshing}
          isFromCache={clientesResource.isFromCache}
          updatedAt={clientesResource.updatedAt}
          error={clientesResource.error}
        />

        <EntityFormGrid>
          <EntityField label="Buscar cliente" wide>
            <input
              value={buscaCliente}
              onChange={(event) => setBuscaCliente(event.target.value)}
              placeholder="Nome, documento, e-mail ou telefone"
              disabled={salvando}
            />
          </EntityField>

          <EntityField label="Cliente" wide>
            <select
              value={clienteId}
              onChange={(event) => setClienteId(event.target.value)}
              disabled={clientesResource.isLoading || salvando}
            >
              <option value="">
                {clientesResource.isLoading
                  ? "Carregando clientes..."
                  : "Cliente não informado"}
              </option>
              {clientesFiltrados.map((cliente) => (
                <option key={cliente.clienteId} value={cliente.clienteId}>
                  {formatClienteLabel(cliente)}
                </option>
              ))}
            </select>
          </EntityField>

          <EntityField label="Ações" wide>
            <div className="ck-entity-actions-row">
              <EntityButton
                type="button"
                disabled={salvando}
                onClick={() => setInlineClienteAberto((current) => !current)}
              >
                {inlineClienteAberto ? "Fechar cadastro" : "+ Novo cliente"}
              </EntityButton>

              <EntityButton
                type="button"
                disabled={clientesResource.isRefreshing || salvando}
                onClick={() => void clientesResource.reload()}
              >
                Atualizar clientes
              </EntityButton>
            </div>
          </EntityField>

          {inlineClienteAberto ? (
            <InlineClienteForm
              onCreated={selecionarClienteCriado}
              onCancel={() => setInlineClienteAberto(false)}
            />
          ) : null}

          {clienteSelecionado ? (
            <EntityCard
              className="ck-entity-field--wide"
              title="Cliente selecionado"
              description={formatClienteLabel(clienteSelecionado)}
            >
              <dl className="ck-entity-detail-list">
                <div>
                  <dt>Telefone</dt>
                  <dd>{clienteSelecionado.telefone ?? "—"}</dd>
                </div>

                <div>
                  <dt>E-mail</dt>
                  <dd>{clienteSelecionado.email ?? "—"}</dd>
                </div>
              </dl>
            </EntityCard>
          ) : null}
        </EntityFormGrid>
      </EntityCard>

      <EntityCard
        title="Serviço"
        description="Vincule um serviço do catálogo ou cadastre um serviço rapidamente."
      >
        <PwaResourceNotice
          isRefreshing={servicosResource.isRefreshing}
          isFromCache={servicosResource.isFromCache}
          updatedAt={servicosResource.updatedAt}
          error={servicosResource.error}
        />

        <EntityFormGrid>
          <EntityField label="Buscar serviço" wide>
            <input
              value={buscaServico}
              onChange={(event) => setBuscaServico(event.target.value)}
              placeholder="Nome, código, descrição ou unidade"
              disabled={salvando}
            />
          </EntityField>

          <EntityField label="Serviço" wide>
            <select
              value={servicoId}
              onChange={(event) => {
                const nextServicoId = event.target.value;
                setServicoId(nextServicoId);

                const servico = servicos.find(
                  (item) => item.produtoId === nextServicoId,
                );

                if (servico && !titulo.trim()) {
                  setTitulo(servico.nome ?? "");
                }

                if (servico) {
                  setDescricao((current) =>
                    montarDescricaoComServico(servico, current),
                  );
                }
              }}
              disabled={servicosResource.isLoading || salvando}
            >
              <option value="">
                {servicosResource.isLoading
                  ? "Carregando serviços..."
                  : "Serviço não informado"}
              </option>
              {servicosFiltrados.map((servico) => (
                <option key={servico.produtoId} value={servico.produtoId}>
                  {formatServicoLabel(servico)}
                </option>
              ))}
            </select>
          </EntityField>

          <EntityField label="Ações" wide>
            <div className="ck-entity-actions-row">
              <EntityButton
                type="button"
                disabled={salvando}
                onClick={() => setInlineServicoAberto((current) => !current)}
              >
                {inlineServicoAberto ? "Fechar cadastro" : "+ Novo serviço"}
              </EntityButton>

              <EntityButton
                type="button"
                disabled={servicosResource.isRefreshing || salvando}
                onClick={() => void servicosResource.reload()}
              >
                Atualizar serviços
              </EntityButton>
            </div>
          </EntityField>

          {inlineServicoAberto ? (
            <InlineServicoForm
              onCreated={selecionarServicoCriado}
              onCancel={() => setInlineServicoAberto(false)}
            />
          ) : null}

          {servicoSelecionado ? (
            <EntityCard
              className="ck-entity-field--wide"
              title="Serviço selecionado"
              description={formatServicoLabel(servicoSelecionado)}
            >
              <p className="ck-entity-description">
                {servicoSelecionado.descricao ??
                  "Serviço sem descrição cadastrada."}
              </p>
            </EntityCard>
          ) : null}
        </EntityFormGrid>
      </EntityCard>

      <EntityCard
        title="Detalhes da OS"
        description="Revise ou complemente o título e a descrição antes de salvar."
      >
        <EntityFormGrid>
          <EntityField label="Título da OS" wide>
            <input
              value={titulo}
              onChange={(event) => setTitulo(event.target.value)}
              placeholder="Ex.: Formatação de notebook"
              disabled={salvando}
            />
          </EntityField>

          <EntityField label="Descrição" wide>
            <textarea
              value={descricao}
              onChange={(event) => setDescricao(event.target.value)}
              placeholder="Descreva o problema, serviço combinado ou observações..."
              rows={6}
              disabled={salvando}
            />
          </EntityField>
        </EntityFormGrid>
      </EntityCard>
    </EntityForm>
  );
}
