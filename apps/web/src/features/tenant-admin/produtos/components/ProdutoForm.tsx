// apps/web/src/features/tenant-admin/produtos/components/ProdutoForm.tsx

import { useMemo, useState, type FormEvent } from "react";
import {
  EntityButton,
  EntityCard,
  EntityField,
  EntityForm,
  EntityFormGrid,
} from "../../shared/entity-ui";
import type {
  AtualizarProdutoInput,
  CriarProdutoInput,
  Produto,
  TipoProduto,
} from "../tipos";

type Props = {
  mode: "create" | "edit";
  initialData?: Produto | null;
  isSaving?: boolean;
  erro?: string | null;
  onSubmit: (
    input: CriarProdutoInput | AtualizarProdutoInput,
  ) => void | Promise<void>;
};

function parseDecimal(value: string): number {
  const normalized = value.trim().replace(",", ".");
  const parsed = Number(normalized);

  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
}

function parseNullableDecimal(value: string): number | null {
  const trimmed = value.trim();

  if (!trimmed) {
    return null;
  }

  return parseDecimal(trimmed);
}

function normalizeOptionalText(value: string): string | null {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

export function ProdutoForm({
  mode,
  initialData,
  isSaving,
  erro,
  onSubmit,
}: Props) {
  const [sku, setSku] = useState(initialData?.sku ?? "");
  const [nome, setNome] = useState(initialData?.nome ?? "");
  const [unidade, setUnidade] = useState(initialData?.unidade ?? "UN");
  const [tipo, setTipo] = useState<TipoProduto>(
    initialData?.tipo ?? "PRODUTO",
  );
  const [precoVenda, setPrecoVenda] = useState(
    String(initialData?.precoVenda ?? 0),
  );
  const [custoReferencia, setCustoReferencia] = useState(
    initialData?.custoReferencia !== null &&
      initialData?.custoReferencia !== undefined
      ? String(initialData.custoReferencia)
      : "",
  );
  const [ativo, setAtivo] = useState(initialData?.ativo !== false);
  const [descricao, setDescricao] = useState(initialData?.descricao ?? "");

  const titulo = useMemo(
    () => (mode === "create" ? "Novo produto" : "Editar produto"),
    [mode],
  );

  const subtitulo = useMemo(
    () =>
      mode === "create"
        ? "Cadastre os dados principais para usar o item em vendas e compras."
        : "Atualize os dados comerciais e operacionais deste produto.",
    [mode],
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    await onSubmit({
      sku: normalizeOptionalText(sku),
      nome: nome.trim(),
      unidade: unidade.trim() || "UN",
      tipo,
      precoVenda: parseDecimal(precoVenda),
      custoReferencia: parseNullableDecimal(custoReferencia),
      ativo,
      descricao: normalizeOptionalText(descricao),
    });
  }

  return (
    <EntityForm
      kicker="Catálogo"
      title={titulo}
      description={subtitulo}
      error={erro}
      onSubmit={handleSubmit}
      footer={
        <EntityButton type="submit" variant="primary" disabled={Boolean(isSaving)}>
          {isSaving ? "Salvando..." : "Salvar produto"}
        </EntityButton>
      }
    >
      <EntityCard
        title="Identificação"
        description="Informações usadas para localizar e diferenciar o produto."
      >
        <EntityFormGrid>
          <EntityField label="Nome" wide>
            <input
              value={nome}
              onChange={(event) => setNome(event.target.value)}
              placeholder="Ex.: Camiseta básica"
              required
            />
          </EntityField>

          <EntityField label="SKU">
            <input
              value={sku}
              onChange={(event) => setSku(event.target.value)}
              placeholder="Ex.: CAM-BAS-001"
            />
          </EntityField>

          <EntityField label="Unidade">
            <input
              value={unidade}
              onChange={(event) => setUnidade(event.target.value)}
              placeholder="UN"
              required
            />
          </EntityField>

          <EntityField label="Tipo">
            <select
              value={tipo}
              onChange={(event) => setTipo(event.target.value as TipoProduto)}
            >
              <option value="PRODUTO">Produto</option>
              <option value="SERVICO">Serviço</option>
            </select>
          </EntityField>

          <label className="ck-entity-field ck-entity-field--checkbox">
            <input
              type="checkbox"
              checked={ativo}
              onChange={(event) => setAtivo(event.target.checked)}
            />
            <span>Ativo para uso operacional</span>
          </label>
        </EntityFormGrid>
      </EntityCard>

      <EntityCard
        title="Valores"
        description="Preço de venda e custo de referência para análise comercial."
      >
        <EntityFormGrid>
          <EntityField label="Preço de venda">
            <input
              type="text"
              inputMode="decimal"
              value={precoVenda}
              onChange={(event) => setPrecoVenda(event.target.value)}
              placeholder="0,00"
              required
            />
          </EntityField>

          <EntityField label="Custo de referência">
            <input
              type="text"
              inputMode="decimal"
              value={custoReferencia}
              onChange={(event) => setCustoReferencia(event.target.value)}
              placeholder="Opcional"
            />
          </EntityField>
        </EntityFormGrid>
      </EntityCard>

      <EntityCard
        title="Descrição"
        description="Use este campo para observações úteis ao atendimento."
      >
        <EntityField label="Descrição">
          <textarea
            value={descricao}
            onChange={(event) => setDescricao(event.target.value)}
            placeholder="Detalhes do produto, variações, observações comerciais..."
            rows={5}
          />
        </EntityField>
      </EntityCard>
    </EntityForm>
  );
}
