// apps/web/src/features/tenant-admin/produtos/components/ProdutoForm.tsx

import { useMemo, useState, type FormEvent } from "react";
import type {
  AtualizarProdutoInput,
  CriarProdutoInput,
  Produto,
  TipoProduto,
} from "../tipos";
import "../pages/produtoPages.css";

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
    <form className="ck-product-form" onSubmit={handleSubmit}>
      <header className="ck-product-form__header">
        <div>
          <p className="ck-product-kicker">Catálogo</p>
          <h1>{titulo}</h1>
          <p>{subtitulo}</p>
        </div>
      </header>

      {erro ? <div className="ck-product-alert">{erro}</div> : null}

      <section className="ck-product-card">
        <div className="ck-product-card__title">
          <h2>Identificação</h2>
          <p>Informações usadas para localizar e diferenciar o produto.</p>
        </div>

        <div className="ck-product-form-grid">
          <label className="ck-product-field ck-product-field--wide">
            <span>Nome</span>
            <input
              value={nome}
              onChange={(event) => setNome(event.target.value)}
              placeholder="Ex.: Camiseta básica"
              required
            />
          </label>

          <label className="ck-product-field">
            <span>SKU</span>
            <input
              value={sku}
              onChange={(event) => setSku(event.target.value)}
              placeholder="Ex.: CAM-BAS-001"
            />
          </label>

          <label className="ck-product-field">
            <span>Unidade</span>
            <input
              value={unidade}
              onChange={(event) => setUnidade(event.target.value)}
              placeholder="UN"
              required
            />
          </label>

          <label className="ck-product-field">
            <span>Tipo</span>
            <select
              value={tipo}
              onChange={(event) => setTipo(event.target.value as TipoProduto)}
            >
              <option value="PRODUTO">Produto</option>
              <option value="SERVICO">Serviço</option>
            </select>
          </label>

          <label className="ck-product-field ck-product-field--checkbox">
            <input
              type="checkbox"
              checked={ativo}
              onChange={(event) => setAtivo(event.target.checked)}
            />
            <span>Ativo para uso operacional</span>
          </label>
        </div>
      </section>

      <section className="ck-product-card">
        <div className="ck-product-card__title">
          <h2>Valores</h2>
          <p>Preço de venda e custo de referência para análise comercial.</p>
        </div>

        <div className="ck-product-form-grid">
          <label className="ck-product-field">
            <span>Preço de venda</span>
            <input
              type="text"
              inputMode="decimal"
              value={precoVenda}
              onChange={(event) => setPrecoVenda(event.target.value)}
              placeholder="0,00"
              required
            />
          </label>

          <label className="ck-product-field">
            <span>Custo de referência</span>
            <input
              type="text"
              inputMode="decimal"
              value={custoReferencia}
              onChange={(event) => setCustoReferencia(event.target.value)}
              placeholder="Opcional"
            />
          </label>
        </div>
      </section>

      <section className="ck-product-card">
        <div className="ck-product-card__title">
          <h2>Descrição</h2>
          <p>Use este campo para observações úteis ao atendimento.</p>
        </div>

        <label className="ck-product-field">
          <span>Descrição</span>
          <textarea
            value={descricao}
            onChange={(event) => setDescricao(event.target.value)}
            placeholder="Detalhes do produto, variações, observações comerciais..."
            rows={5}
          />
        </label>
      </section>

      <footer className="ck-product-form__footer">
        <button
          className="ck-product-button ck-product-button--primary"
          type="submit"
          disabled={Boolean(isSaving)}
        >
          {isSaving ? "Salvando..." : "Salvar produto"}
        </button>
      </footer>
    </form>
  );
}
