// apps/web/src/features/tenant-admin/compras/pages/NovaCompraPage.tsx

import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { mapError } from "../../../../core/errors/mapError";
import { fornecedoresApi } from "../../fornecedores/api/fornecedoresApi";
import type { Fornecedor } from "../../fornecedores/tipos";
import { comprasApi } from "../api/comprasApi";

function labelFornecedor(fornecedor: Fornecedor): string {
  return fornecedor.documento
    ? `${fornecedor.nome} — ${fornecedor.documento}`
    : fornecedor.nome;
}

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

        if (ativo) setFornecedores(response.itens);
      } catch (error) {
        if (ativo) setErroFornecedores(mapError(error).message);
      } finally {
        if (ativo) setIsLoadingFornecedores(false);
      }
    }

    void carregarFornecedores();

    return () => {
      ativo = false;
    };
  }, []);

  const fornecedoresFiltrados = useMemo(() => {
    const termo = buscaFornecedor.trim().toLowerCase();

    if (!termo) return fornecedores;

    return fornecedores.filter((fornecedor) =>
      textoBuscaFornecedor(fornecedor).includes(termo),
    );
  }, [fornecedores, buscaFornecedor]);

  const fornecedorSelecionado = fornecedores.find(
    (fornecedor) => fornecedor.fornecedorId === fornecedorId,
  );

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setErro(null);
    setIsSaving(true);

    try {
      const response = await comprasApi.criar({
        fornecedorId: fornecedorId.trim() || null,
        observacao: observacao.trim() || null,
      });

      navigate(`/app/transacoes/${response.item.transacaoId}`);
    } catch (error) {
      setErro(mapError(error).message);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form className="grid gap-6" onSubmit={handleSubmit}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Nova compra</h1>
          <p className="text-sm text-slate-600">
            Primeiro crie a compra. Os produtos serão adicionados na tela de
            detalhes.
          </p>
        </div>

        <Link className="rounded-xl border px-4 py-2" to="/app/transacoes">
          Voltar
        </Link>
      </div>

      {erro ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {erro}
        </div>
      ) : null}

      {erroFornecedores ? (
        <div className="rounded-xl border border-yellow-200 bg-yellow-50 px-3 py-2 text-sm text-yellow-800">
          Não foi possível carregar fornecedores: {erroFornecedores}
        </div>
      ) : null}

      <section className="grid gap-4 rounded-2xl border bg-white p-6">
        <div>
          <h2 className="text-lg font-semibold">Fornecedor</h2>
          <p className="text-sm text-slate-600">
            Busque por nome, documento, e-mail ou telefone.
          </p>
        </div>

        <label className="grid gap-1">
          <span className="text-sm font-medium">Buscar fornecedor</span>
          <input
            className="rounded-xl border px-3 py-2"
            placeholder="Ex.: Distribuidora, CNPJ, e-mail..."
            value={buscaFornecedor}
            onChange={(event) => setBuscaFornecedor(event.target.value)}
          />
        </label>

        <label className="grid gap-1">
          <span className="text-sm font-medium">Fornecedor selecionado</span>
          <select
            className="rounded-xl border px-3 py-2"
            value={fornecedorId}
            onChange={(event) => setFornecedorId(event.target.value)}
            disabled={isLoadingFornecedores}
          >
            <option value="">
              {isLoadingFornecedores
                ? "Carregando fornecedores..."
                : "Compra sem fornecedor"}
            </option>

            {fornecedoresFiltrados.map((fornecedor) => (
              <option
                key={fornecedor.fornecedorId}
                value={fornecedor.fornecedorId}
              >
                {labelFornecedor(fornecedor)}
              </option>
            ))}
          </select>
        </label>

        {fornecedorSelecionado ? (
          <div className="grid gap-2 rounded-xl border bg-slate-50 p-4 text-sm md:grid-cols-2">
            <div>
              <div className="text-xs text-slate-500">Nome</div>
              <div>{fornecedorSelecionado.nome}</div>
            </div>

            <div>
              <div className="text-xs text-slate-500">Documento</div>
              <div>{fornecedorSelecionado.documento ?? "—"}</div>
            </div>

            <div>
              <div className="text-xs text-slate-500">E-mail</div>
              <div>{fornecedorSelecionado.email ?? "—"}</div>
            </div>

            <div>
              <div className="text-xs text-slate-500">Telefone</div>
              <div>{fornecedorSelecionado.telefone ?? "—"}</div>
            </div>
          </div>
        ) : null}
      </section>

      <section className="grid gap-4 rounded-2xl border bg-white p-6">
        <label className="grid gap-1">
          <span className="text-sm font-medium">Observação</span>
          <textarea
            className="rounded-xl border px-3 py-2"
            value={observacao}
            onChange={(event) => setObservacao(event.target.value)}
            placeholder="Observação da compra"
            rows={3}
          />
        </label>
      </section>

      <div className="flex justify-end">
        <button
          className="rounded-xl border px-4 py-2"
          type="submit"
          disabled={isSaving}
        >
          {isSaving ? "Criando..." : "Criar compra e adicionar itens"}
        </button>
      </div>
    </form>
  );
}
