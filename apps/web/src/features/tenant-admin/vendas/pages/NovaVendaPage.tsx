// apps/web/src/features/tenant-admin/vendas/pages/NovaVendaPage.tsx

import { useMemo, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import {
  TRANSACOES_MODULE,
  TRANSACOES_PERMISSIONS,
} from "../../../../core/api/permissions";
import { PageGuard } from "../../../../core/routing/pageGuard";
import { formatClienteLabel } from "../../../../shared/formatters";
import { OfflineSyncStatus } from "../../../../shared/pwa/OfflineSyncStatus";
import { PwaResourceNotice } from "../../../../shared/pwa/PwaResourceNotice";
import { useClientesCached } from "../../clientes/hooks/useClientesCached";
import { InlineClienteForm } from "../../clientes/components/InlineClienteForm";
import type { Cliente } from "../../clientes/tipos";
import { EntityAlert, EntityButton, EntityCard, EntityField, EntityForm, EntityFormGrid, EntityPage } from "../../shared/entity-ui";
import { useCreateVendaPwa } from "../hooks/useCreateVendaPwa";

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
  const clientesResource = useClientesCached();
  const createVenda = useCreateVendaPwa();

  const [clientesLocais, setClientesLocais] = useState<Cliente[]>([]);
  const [clienteId, setClienteId] = useState("");
  const [buscaCliente, setBuscaCliente] = useState("");
  const [observacao, setObservacao] = useState("");
  const [inlineClienteAberto, setInlineClienteAberto] = useState(false);

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

  function selecionarClienteCriado(cliente: Cliente) {
    setClientesLocais((current) => [
      cliente,
      ...current.filter((item) => item.clienteId !== cliente.clienteId),
    ]);
    setClienteId(cliente.clienteId);
    setBuscaCliente("");
    setInlineClienteAberto(false);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const venda = await createVenda.criar({
      clienteId: clienteId || null,
      observacao: normalizeOptionalText(observacao),
    });

    if (!venda) return;

    if (createVenda.isOffline) {
      navigate("/app/transacoes");
      return;
    }

    navigate(`/app/transacoes/${venda.transacaoId}`);
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
        <OfflineSyncStatus />

        {createVenda.error ? (
          <EntityAlert>{createVenda.error}</EntityAlert>
        ) : null}

        {createVenda.isOffline ? (
          <EntityAlert>
            Você está offline. A venda será salva como pendente e sincronizada quando a conexão voltar.
          </EntityAlert>
        ) : null}

        <EntityForm
          kicker="Vendas"
          title="Nova venda"
          description="Crie uma transação de venda e depois adicione os itens na tela de detalhes."
          onSubmit={handleSubmit}
          footer={
            <EntityButton
              type="submit"
              variant="primary"
              disabled={createVenda.isSaving}
            >
              {createVenda.isSaving ? "Criando..." : "Criar venda"}
            </EntityButton>
          }
        >
          <PwaResourceNotice
            isFromCache={clientesResource.isFromCache}
            isRefreshing={clientesResource.isRefreshing}
            updatedAt={clientesResource.updatedAt}
            error={clientesResource.error}
          />

          <EntityCard
            title="Cliente"
            description="Selecione o cliente vinculado à venda."
          >
            <EntityFormGrid>
              <EntityField label="Buscar cliente" wide>
                <input
                  value={buscaCliente}
                  onChange={(event) => setBuscaCliente(event.target.value)}
                  placeholder="Nome, documento, e-mail ou telefone"
                />
              </EntityField>

              <EntityField label="Cliente" wide>
                <div className="ck-entity-actions-row">
                  <EntityButton
                    type="button"
                    disabled={createVenda.isSaving}
                    onClick={() => setInlineClienteAberto((value) => !value)}
                  >
                    {inlineClienteAberto ? "Fechar cadastro" : "+ Novo cliente"}
                  </EntityButton>

                  <EntityButton
                    type="button"
                    disabled={
                      clientesResource.isRefreshing || createVenda.isSaving
                    }
                    onClick={() => void clientesResource.reload()}
                  >
                    Atualizar clientes
                  </EntityButton>
                </div>

                <select
                  value={clienteId}
                  onChange={(event) => setClienteId(event.target.value)}
                  disabled={clientesResource.isLoading}
                >
                  <option value="">
                    {clientesResource.isLoading
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
