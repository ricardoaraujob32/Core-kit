// apps/web/src/features/tenant-admin/compras/pages/NovaCompraPage.tsx

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { mapError } from "../../../../core/errors/mapError";
import { formatFornecedorLabel } from "../../../../shared/formatters";
import { fornecedoresApi } from "../../fornecedores/api/fornecedoresApi";
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
import { comprasApi } from "../api/comprasApi";

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

  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
  const [fornecedorId, setFornecedorId] = useState("");
  const [buscaFornecedor, setBuscaFornecedor] = useState("");
  const [observacao, setObservacao] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [erroFornecedores, setErroFornecedores] = useState<string | null>(null);
  const [isLoadingFornecedores, setIsLoadingFornecedores] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let ativo = true;

    async function carregarFornecedores() {
      setIsLoadingFornecedores(true);
      setErroFornecedores(null);

      try {
        const response = await fornecedoresApi.listar();

        if (ativo) {
          setFornecedores(response.itens);
        }
      } catch (error) {
        if (ativo) {
          setErroFornecedores(mapError(error).message);
        }
      } finally {
        if (ativo) {
          setIsLoadingFornecedores(false);
        }
      }
    }

    void carregarFornecedores();

    return () => {
      ativo = false;
    };
  }, []);

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

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setErro(null);
    setIsSaving(true);

    try {
      const response = await comprasApi.criar({
        fornecedorId: fornecedorId || null,
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
    <EntityPage
      actions={
        <EntityButton to="/app/transacoes">
          Voltar para transações
        </EntityButton>
      }
    >
      <EntityForm
        kicker="Compras"
        title="Nova compra"
        description="Crie uma transação de compra e depois adicione os itens na tela de detalhes."
        error={erro}
        onSubmit={handleSubmit}
        footer={
          <EntityButton type="submit" variant="primary" disabled={isSaving}>
            {isSaving ? "Criando..." : "Criar compra"}
          </EntityButton>
        }
      >
        {erroFornecedores ? (
          <EntityAlert>{erroFornecedores}</EntityAlert>
        ) : null}

        <EntityCard title="Fornecedor" description="Selecione o fornecedor vinculado à compra.">
          <EntityFormGrid>
            <EntityField label="Buscar fornecedor" wide>
              <input
                value={buscaFornecedor}
                onChange={(event) => setBuscaFornecedor(event.target.value)}
                placeholder="Nome, documento, e-mail ou telefone"
              />
            </EntityField>

            <EntityField label="Fornecedor" wide>
              <select
                value={fornecedorId}
                onChange={(event) => setFornecedorId(event.target.value)}
                disabled={isLoadingFornecedores}
              >
                <option value="">
                  {isLoadingFornecedores
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
              placeholder="Ex.: reposição de estoque, compra direta, fornecedor preferencial..."
              rows={5}
            />
          </EntityField>
        </EntityCard>
      </EntityForm>
    </EntityPage>
  );
}
