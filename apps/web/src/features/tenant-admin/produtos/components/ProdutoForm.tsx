// apps/web/src/features/tenant-admin/produtos/components/ProdutoForm.tsx

import { useMemo, useState } from "react";
import type { AtualizarProdutoInput, CriarProdutoInput, Produto, TipoProduto } from "../tipos";

type Props = {
  mode: "create" | "edit";
  initialData?: Produto | null;
  isSaving?: boolean;
  erro?: string | null;
  onSubmit: (input: CriarProdutoInput | AtualizarProdutoInput) => void | Promise<void>;
};

function parsePreco(value: string): number {
  const normalized = value.trim().replace(",", ".");
  const parsed = Number(normalized);

  return Number.isFinite(parsed) ? parsed : 0;
}

export function ProdutoForm({ mode, initialData, isSaving, erro, onSubmit }: Props) {
  const [nome, setNome] = useState(initialData?.nome ?? "");
  const [tipo, setTipo] = useState<TipoProduto>(initialData?.tipo ?? "PRODUTO");
  const [precoVenda, setPrecoVenda] = useState(
    String(initialData?.precoVenda ?? 0),
  );
  const [descricao, setDescricao] = useState(initialData?.descricao ?? "");

  const titulo = useMemo(
    () => (mode === "create" ? "Novo produto/serviço" : "Editar produto/serviço"),
    [mode],
  );

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    await onSubmit({
      nome,
      tipo,
      precoVenda: parsePreco(precoVenda),
      descricao: descricao || null,
    });
  }

  return (
    <form className="grid gap-4 rounded-2xl border bg-white p-6" onSubmit={handleSubmit}>
      <h2 className="text-lg font-semibold">{titulo}</h2>

      {erro ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {erro}
        </div>
      ) : null}

      <input
        className="rounded-xl border px-3 py-2"
        value={nome}
        onChange={(event) => setNome(event.target.value)}
        placeholder="Nome"
        required
      />

      <select
        className="rounded-xl border px-3 py-2"
        value={tipo}
        onChange={(event) => setTipo(event.target.value as TipoProduto)}
      >
        <option value="PRODUTO">Produto</option>
        <option value="SERVICO">Serviço</option>
      </select>

      <input
        className="rounded-xl border px-3 py-2"
        type="text"
        inputMode="decimal"
        value={precoVenda}
        onChange={(event) => setPrecoVenda(event.target.value)}
        placeholder="Preço de venda"
        required
      />

      <textarea
        className="rounded-xl border px-3 py-2"
        value={descricao}
        onChange={(event) => setDescricao(event.target.value)}
        placeholder="Descrição"
      />

      <button
        className="rounded-xl border px-4 py-2"
        type="submit"
        disabled={Boolean(isSaving)}
      >
        {isSaving ? "Salvando..." : "Salvar"}
      </button>
    </form>
  );
}