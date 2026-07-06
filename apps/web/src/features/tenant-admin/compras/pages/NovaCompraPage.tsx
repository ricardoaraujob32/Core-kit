// apps/web/src/features/tenant-admin/compras/pages/NovaCompraPage.tsx

import { useMemo, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import {
  TRANSACOES_MODULE,
  TRANSACOES_PERMISSIONS,
} from "../../../../core/api/permissions";
import { PageGuard } from "../../../../core/routing/pageGuard";
import { formatFornecedorLabel } from "../../../../shared/formatters";
import { OfflineSyncStatus } from "../../../../shared/pwa/OfflineSyncStatus";
import { PwaResourceNotice } from "../../../../shared/pwa/PwaResourceNotice";
import { useFornecedoresCached } from "../../fornecedores/hooks/useFornecedoresCached";
import { InlineFornecedorForm } from "../../fornecedores/components/InlineFornecedorForm";
import type { Fornecedor } from "../../fornecedores/tipos";
import {
  EntityAlert,
  EntityButton,
  EntityCard,
  EntityField,
  EntityForm,
  EntityFormGrid,
  EntityPage,
} from "../../shared/entity-ui";
import { useCreateCompraPwa } from "../hooks/useCreateCompraPwa";

function textoBuscaFornecedor(fornecedor: Fornecedor): string {
  return [
    fornecedor.nome,
    fornecedor.documento,
    fornecedor.email,
    fornecedor.telefone,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function normalizeOptionalText(value: string): string | null {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

export default function NovaCompraPage() {
  const navigate = useNavigate();
  const fornecedoresResource = useFornecedoresCached();
  const createCompra = useCreateCompraPwa();

  const [fornecedoresLocais, setFornecedoresLocais] = useState<Fornecedor[]>(
    [],
  );
  const [fornecedorId, setFornecedorId] = useState("");
  const [buscaFornecedor, setBuscaFornecedor] = useState("");
  const [observacao, setObservacao] = useState("");
  const [inlineFornecedorAberto, setInlineFornecedorAberto] = useState(false);

  const fornecedores = useMemo(() => {
    const ids = new Set<string>();
    const merged: Fornecedor[] = [];

    for (const fornecedor of [
      ...fornecedoresLocais,
      ...fornecedoresResource.data,
    ]) {
      if (!ids.has(fornecedor.fornecedorId)) {
        ids.add(fornecedor.fornecedorId);
        merged.push(fornecedor);
      }
    }

    return merged;
  }, [fornecedoresLocais, fornecedoresResource.data]);

  const fornecedoresFiltrados = useMemo(() => {
    const termo = buscaFornecedor.trim().toLowerCase();

    if (!termo) {
      return fornecedores;
    }

    return fornecedores.filter((fornecedor) =>
      textoBuscaFornecedor(fornecedor).includes(termo),
    );
  }, [fornecedores, buscaFornecedor]);

  const fornecedorSelecionado = fornecedores.find(
    (fornecedor) => fornecedor.fornecedorId === fornecedorId,
  );

  function selecionarFornecedorCriado(fornecedor: Fornecedor) {
    setFornecedoresLocais((current) => [
      fornecedor,
      ...current.filter((item) => item.fornecedorId !== fornecedor.fornecedorId),
    ]);
    setFornecedorId(fornecedor.fornecedorId);
    setBuscaFornecedor("");
    setInlineFornecedorAberto(false);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const compra = await createCompra.criar({
      fornecedorId: fornecedorId || null,
      observacao: normalizeOptionalText(observacao),
    });

    if (!compra) return;

    if (createCompra.isOffline) {
      navigate("/app/transacoes");
      return;
    }

    navigate(`/app/transacoes/${compra.transacaoId}`);
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

        {createCompra.error ? (
          <EntityAlert>{createCompra.error}</EntityAlert>
        ) : null}

        {createCompra.isOffline ? (
          <EntityAlert>
            Você está offline. A compra será salva como pendente e sincronizada quando a conexão voltar.
          </EntityAlert>
        ) : null}

        <EntityForm
          kicker="Compras"
          title="Nova compra"
          description="Crie uma transação de compra e depois adicione os itens na tela de detalhes."
          onSubmit={handleSubmit}
          footer={
            <EntityButton
              type="submit"
              variant="primary"
              disabled={createCompra.isSaving}
            >
              {createCompra.isSaving ? "Criando..." : "Criar compra"}
            </EntityButton>
          }
        >
          <PwaResourceNotice
            isFromCache={fornecedoresResource.isFromCache}
            isRefreshing={fornecedoresResource.isRefreshing}
            updatedAt={fornecedoresResource.updatedAt}
            error={fornecedoresResource.error}
          />

          <EntityCard
            title="Fornecedor"
            description="Selecione o fornecedor vinculado à compra."
          >
            <EntityFormGrid>
              <EntityField label="Buscar fornecedor" wide>
                <input
                  value={buscaFornecedor}
                  onChange={(event) => setBuscaFornecedor(event.target.value)}
                  placeholder="Nome, documento, e-mail ou telefone"
                />
              </EntityField>

              <EntityField label="Fornecedor" wide>
                <div className="ck-entity-actions-row">
                  <EntityButton
                    type="button"
                    disabled={createCompra.isSaving}
                    onClick={() => setInlineFornecedorAberto((value) => !value)}
                  >
                    {inlineFornecedorAberto
                      ? "Fechar cadastro"
                      : "+ Novo fornecedor"}
                  </EntityButton>

                  <EntityButton
                    type="button"
                    disabled={
                      fornecedoresResource.isRefreshing ||
                      createCompra.isSaving
                    }
                    onClick={() => void fornecedoresResource.reload()}
                  >
                    Atualizar fornecedores
                  </EntityButton>
                </div>

                <select
                  value={fornecedorId}
                  onChange={(event) => setFornecedorId(event.target.value)}
                  disabled={fornecedoresResource.isLoading}
                >
                  <option value="">
                    {fornecedoresResource.isLoading
                      ? "Carregando fornecedores..."
                      : "Compra sem fornecedor vinculado"}
                  </option>

                  {fornecedoresFiltrados.map((fornecedor) => (
                    <option
                      key={fornecedor.fornecedorId}
                      value={fornecedor.fornecedorId}
                    >
                      {formatFornecedorLabel(fornecedor)}
                    </option>
                  ))}
                </select>
              </EntityField>

              {inlineFornecedorAberto ? (
                <InlineFornecedorForm
                  onCreated={selecionarFornecedorCriado}
                  onCancel={() => setInlineFornecedorAberto(false)}
                />
              ) : null}

              {fornecedorSelecionado ? (
                <EntityCard
                  className="ck-entity-field--wide"
                  title="Fornecedor selecionado"
                  description={formatFornecedorLabel(fornecedorSelecionado)}
                >
                  <dl className="ck-entity-detail-list">
                    <div>
                      <dt>Telefone</dt>
                      <dd>{fornecedorSelecionado.telefone ?? "—"}</dd>
                    </div>

                    <div>
                      <dt>E-mail</dt>
                      <dd>{fornecedorSelecionado.email ?? "—"}</dd>
                    </div>
                  </dl>
                </EntityCard>
              ) : null}
            </EntityFormGrid>
          </EntityCard>

          <EntityCard
            title="Observação"
            description="Registre condições comerciais ou contexto da compra."
          >
            <EntityField label="Observação da compra">
              <textarea
                value={observacao}
                onChange={(event) => setObservacao(event.target.value)}
                placeholder="Ex.: reposição de estoque, negociação, observações..."
                rows={5}
              />
            </EntityField>
          </EntityCard>
        </EntityForm>
      </EntityPage>
    </PageGuard>
  );
}
