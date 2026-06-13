// apps/web/src/features/tenant-admin/vendas/pages/NovaVendaPage.tsx

import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { mapError } from "../../../../core/errors/mapError";
import { clientesApi } from "../../clientes/api/clientesApi";
import type { Cliente } from "../../clientes/tipos";
import { vendasApi } from "../api/vendasApi";
import "../../transacoes/pages/transacoes.css";

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

        if (ativo) setClientes(response.itens);
      } catch (error) {
        if (ativo) setErroClientes(mapError(error).message);
      } finally {
        if (ativo) setIsLoadingClientes(false);
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
    <form className="ck-page" onSubmit={handleSubmit}>
      <section className="ck-page-hero">
        <div className="ck-page-hero-inner">
          <div>
            <div className="ck-page-kicker">Vendas</div>
            <h1 className="ck-page-title">Nova venda</h1>
            <p className="ck-page-description">
              Crie a venda e depois adicione os produtos na tela de detalhes.
            </p>
          </div>

          <div className="ck-page-actions">
            <Link className="ck-action-secondary" to="/app/transacoes">
              Voltar
            </Link>
          </div>
        </div>
      </section>

      {erro ? <div className="ck-alert">{erro}</div> : null}

      {erroClientes ? (
        <div className="ck-alert ck-alert-warning">
          Não foi possível carregar clientes: {erroClientes}
        </div>
      ) : null}

      <section className="ck-form-card">
        <div className="ck-form-card-header">
          <div className="ck-form-card-title">Cliente</div>
          <p className="ck-form-card-desc">
            Busque por nome, documento, e-mail ou telefone.
          </p>
        </div>

        <div className="ck-form-card-body">
          <label className="ck-field">
            <span>Buscar cliente</span>
            <input
              className="ck-input"
              placeholder="Ex.: Maria, CPF/CNPJ, e-mail..."
              value={buscaCliente}
              onChange={(event) => setBuscaCliente(event.target.value)}
            />
          </label>

          <label className="ck-field">
            <span>Cliente selecionado</span>
            <select
              className="ck-select"
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
            <div className="ck-selected-box">
              <div className="ck-selected-grid">
                <div>
                  <div className="ck-selected-label">Nome</div>
                  <div className="ck-selected-value">{clienteSelecionado.nome}</div>
                </div>

                <div>
                  <div className="ck-selected-label">Documento</div>
                  <div className="ck-selected-value">{clienteSelecionado.documento ?? "—"}</div>
                </div>

                <div>
                  <div className="ck-selected-label">E-mail</div>
                  <div className="ck-selected-value">{clienteSelecionado.email ?? "—"}</div>
                </div>

                <div>
                  <div className="ck-selected-label">Telefone</div>
                  <div className="ck-selected-value">{clienteSelecionado.telefone ?? "—"}</div>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </section>

      <section className="ck-form-card">
        <div className="ck-form-card-header">
          <div className="ck-form-card-title">Observação</div>
          <p className="ck-form-card-desc">
            Informação opcional para facilitar o histórico.
          </p>
        </div>

        <div className="ck-form-card-body">
          <label className="ck-field">
            <span>Observação da venda</span>
            <textarea
              className="ck-input ck-textarea"
              value={observacao}
              onChange={(event) => setObservacao(event.target.value)}
              placeholder="Ex.: venda balcão, pedido especial, condições combinadas..."
            />
          </label>
        </div>
      </section>

      <div className="flex justify-end">
        <button className="ck-action-primary" disabled={isSaving} type="submit">
          {isSaving ? "Criando..." : "Criar venda e adicionar itens"}
        </button>
      </div>
    </form>
  );
}
