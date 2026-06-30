// apps/web/src/features/tenant-admin/vendas/pages/NovaVendaPage.tsx

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import {
  TRANSACOES_MODULE,
  TRANSACOES_PERMISSIONS,
} from "../../../../core/api/permissions";
import { mapError } from "../../../../core/errors/mapError";
import { PageGuard } from "../../../../core/routing/pageGuard";
import { formatClienteLabel } from "../../../../shared/formatters";
import { clientesApi } from "../../clientes/api/clientesApi";
import type { Cliente } from "../../clientes/tipos";
import { EntityAlert, EntityButton, EntityCard, EntityField, EntityForm, EntityFormGrid, EntityPage } from "../../shared/entity-ui";
import { vendasApi } from "../api/vendasApi";

function textoBuscaCliente(cliente: Cliente): string {
  return [cliente.nome, cliente.documento, cliente.email, cliente.telefone]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function normalizeOptionalText(value: string): string | null {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

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

  useEffect(() => {
    let ativo = true;

    async function carregarClientes() {
      setIsLoadingClientes(true);
      setErroClientes(null);

      try {
        const response = await clientesApi.listar();

        if (ativo) {
          setClientes(response.itens);
        }
      } catch (error) {
        if (ativo) {
          setErroClientes(mapError(error).message);
        }
      } finally {
        if (ativo) {
          setIsLoadingClientes(false);
        }
      }
    }

    void carregarClientes();

    return () => {
      ativo = false;
    };
  }, []);

  const clientesFiltrados = useMemo(() => {
    const termo = buscaCliente.trim().toLowerCase();

    if (!termo) {
      return clientes;
    }

    return clientes.filter((cliente) =>
      textoBuscaCliente(cliente).includes(termo),
    );
  }, [clientes, buscaCliente]);

  const clienteSelecionado = clientes.find(
    (cliente) => cliente.clienteId === clienteId,
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setErro(null);
    setIsSaving(true);

    try {
      const response = await vendasApi.criar({
        clienteId: clienteId || null,
        observacao: normalizeOptionalText(observacao),
      });

      navigate(`/app/transacoes/${response.item.transacaoId}`);
    } catch (error) {
      setErro(mapError(error).message);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <PageGuard
      requiredModule={TRANSACOES_MODULE}
      requiredPermissions={[TRANSACOES_PERMISSIONS.CRIAR]}
    >
      <EntityPage
        actions={
          <EntityButton to="/app/transacoes">
            Voltar para transações
          </EntityButton>
        }
      >
        <EntityForm
          kicker="Vendas"
          title="Nova venda"
          description="Crie uma transação de venda e depois adicione os itens na tela de detalhes."
          error={erro}
          onSubmit={handleSubmit}
          footer={
            <EntityButton type="submit" variant="primary" disabled={isSaving}>
              {isSaving ? "Criando..." : "Criar venda"}
            </EntityButton>
          }
        >
        {erroClientes ? <EntityAlert>{erroClientes}</EntityAlert> : null}

        <EntityCard title="Cliente" description="Selecione o cliente vinculado à venda.">
          <EntityFormGrid>
            <EntityField label="Buscar cliente" wide>
              <input
                value={buscaCliente}
                onChange={(event) => setBuscaCliente(event.target.value)}
                placeholder="Nome, documento, e-mail ou telefone"
              />
            </EntityField>

            <EntityField label="Cliente" wide>
              <select
                value={clienteId}
                onChange={(event) => setClienteId(event.target.value)}
                disabled={isLoadingClientes}
              >
                <option value="">
                  {isLoadingClientes
                    ? "Carregando clientes..."
                    : "Venda sem cliente vinculado"}
                </option>

                {clientesFiltrados.map((cliente) => (
                  <option key={cliente.clienteId} value={cliente.clienteId}>
                    {formatClienteLabel(cliente)}
                  </option>
                ))}
              </select>
            </EntityField>
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
          title="Observação"
          description="Registre condições comerciais ou contexto do atendimento."
        >
          <EntityField label="Observação da venda">
            <textarea
              value={observacao}
              onChange={(event) => setObservacao(event.target.value)}
              placeholder="Ex.: venda balcão, pedido especial, condições combinadas..."
              rows={5}
            />
          </EntityField>
        </EntityCard>
        </EntityForm>
      </EntityPage>
    </PageGuard>
  );
}
