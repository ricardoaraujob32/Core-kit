// apps/web/src/features/tenant-admin/vendas/pages/NovaVendaPage.tsx

import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { mapError } from "../../../../core/errors/mapError";
import { clientesApi } from "../../clientes/api/clientesApi";
import type { Cliente } from "../../clientes/tipos";
import { vendasApi } from "../api/vendasApi";

function labelCliente(cliente: Cliente): string {
  return cliente.documento ? `${cliente.nome} — ${cliente.documento}` : cliente.nome;
}

function textoBuscaCliente(cliente: Cliente): string {
  return [cliente.nome, cliente.documento, cliente.email, cliente.telefone]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
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

    if (!termo) return clientes;

    return clientes.filter((cliente) => textoBuscaCliente(cliente).includes(termo));
  }, [clientes, buscaCliente]);

  const clienteSelecionado = clientes.find(
    (cliente) => cliente.clienteId === clienteId,
  );

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setErro(null);
    setIsSaving(true);

    try {
      const response = await vendasApi.criar({
        clienteId: clienteId.trim() || null,
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
    <form
      className="grid gap-6 rounded-2xl border bg-white p-6"
      onSubmit={handleSubmit}
    >
      <div>
        <h1 className="text-2xl font-semibold">Nova venda</h1>
        <p className="text-sm text-slate-600">
          Selecione o cliente usando nome, documento, e-mail ou telefone. Os
          itens serão adicionados na próxima etapa.
        </p>
      </div>

      {erro ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {erro}
        </div>
      ) : null}

      {erroClientes ? (
        <div className="rounded-xl border border-yellow-200 bg-yellow-50 px-3 py-2 text-sm text-yellow-800">
          Não foi possível carregar a lista de clientes: {erroClientes}
        </div>
      ) : null}

      <section className="grid gap-4 rounded-2xl border p-4">
        <h2 className="text-lg font-semibold">Cliente</h2>

        <label className="grid gap-1">
          <span className="text-sm font-medium">Buscar cliente</span>
          <input
            className="rounded-xl border px-3 py-2"
            placeholder="Nome, documento, e-mail ou telefone"
            value={buscaCliente}
            onChange={(event) => setBuscaCliente(event.target.value)}
          />
        </label>

        <label className="grid gap-1">
          <span className="text-sm font-medium">Cliente selecionado</span>
          <select
            className="rounded-xl border px-3 py-2"
            value={clienteId}
            onChange={(event) => setClienteId(event.target.value)}
            disabled={isLoadingClientes}
          >
            <option value="">
              {isLoadingClientes ? "Carregando clientes..." : "Venda sem cliente"}
            </option>

            {clientesFiltrados.map((cliente) => (
              <option key={cliente.clienteId} value={cliente.clienteId}>
                {labelCliente(cliente)}
              </option>
            ))}
          </select>
        </label>

        {clienteSelecionado ? (
          <div className="grid gap-2 rounded-xl border bg-slate-50 p-4 text-sm">
            <div><strong>Nome:</strong> {clienteSelecionado.nome}</div>
            <div><strong>Documento:</strong> {clienteSelecionado.documento ?? "—"}</div>
            <div><strong>E-mail:</strong> {clienteSelecionado.email ?? "—"}</div>
            <div><strong>Telefone:</strong> {clienteSelecionado.telefone ?? "—"}</div>
          </div>
        ) : null}
      </section>

      <label className="grid gap-1">
        <span className="text-sm font-medium">Observação</span>
        <textarea
          className="rounded-xl border px-3 py-2"
          value={observacao}
          onChange={(event) => setObservacao(event.target.value)}
          placeholder="Observação da venda"
          rows={3}
        />
      </label>

      <div className="flex justify-end">
        <button
          className="rounded-xl border px-4 py-2"
          type="submit"
          disabled={isSaving}
        >
          {isSaving ? "Criando..." : "Criar venda"}
        </button>
      </div>
    </form>
  );
}
