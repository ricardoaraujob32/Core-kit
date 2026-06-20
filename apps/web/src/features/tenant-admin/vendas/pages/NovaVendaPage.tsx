// apps/web/src/features/tenant-admin/vendas/pages/NovaVendaPage.tsx

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { mapError } from "../../../../core/errors/mapError";
import { formatClienteLabel } from "../../../../shared/formatters";
import { clientesApi } from "../../clientes/api/clientesApi";
import type { Cliente } from "../../clientes/tipos";
import { vendasApi } from "../api/vendasApi";
import "../../shared/entityPages.css";

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
    <div className="ck-entity-page">
      <div className="ck-entity-page__actions">
        <Link className="ck-entity-button" to="/app/transacoes">
          Voltar para transações
        </Link>
      </div>

      <form className="ck-entity-form" onSubmit={handleSubmit}>
        <header className="ck-entity-form__header">
          <div>
            <p className="ck-entity-kicker">Vendas</p>
            <h1>Nova venda</h1>
            <p>
              Crie uma transação de venda e depois adicione os itens na tela de
              detalhes.
            </p>
          </div>
        </header>

        {erro ? <div className="ck-entity-alert">{erro}</div> : null}

        {erroClientes ? (
          <div className="ck-entity-alert">{erroClientes}</div>
        ) : null}

        <section className="ck-entity-card">
          <div className="ck-entity-card__title">
            <h2>Cliente</h2>
            <p>Selecione o cliente vinculado à venda.</p>
          </div>

          <div className="ck-entity-form-grid">
            <label className="ck-entity-field ck-entity-field--wide">
              <span>Buscar cliente</span>
              <input
                value={buscaCliente}
                onChange={(event) => setBuscaCliente(event.target.value)}
                placeholder="Nome, documento, e-mail ou telefone"
              />
            </label>

            <label className="ck-entity-field ck-entity-field--wide">
              <span>Cliente</span>
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
            </label>

            {clienteSelecionado ? (
              <div className="ck-entity-card ck-entity-field--wide">
                <div className="ck-entity-card__title">
                  <h2>Cliente selecionado</h2>
                  <p>{formatClienteLabel(clienteSelecionado)}</p>
                </div>
              </div>
            ) : null}
          </div>
        </section>

        <section className="ck-entity-card">
          <div className="ck-entity-card__title">
            <h2>Observação</h2>
            <p>Registre condições comerciais ou contexto do atendimento.</p>
          </div>

          <label className="ck-entity-field">
            <span>Observação da venda</span>
            <textarea
              value={observacao}
              onChange={(event) => setObservacao(event.target.value)}
              placeholder="Ex.: venda balcão, pedido especial, condições combinadas..."
              rows={5}
            />
          </label>
        </section>

        <footer className="ck-entity-form__footer">
          <button
            className="ck-entity-button ck-entity-button--primary"
            disabled={isSaving}
            type="submit"
          >
            {isSaving ? "Criando..." : "Criar venda"}
          </button>
        </footer>
      </form>
    </div>
  );
}
