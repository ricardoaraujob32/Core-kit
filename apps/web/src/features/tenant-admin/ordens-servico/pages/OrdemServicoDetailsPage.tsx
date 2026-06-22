// apps/web/src/features/tenant-admin/ordens-servico/pages/OrdemServicoDetailsPage.tsx

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { mapError } from "../../../../core/errors/mapError";
import {
  formatClienteLabel,
  formatDateTime,
  formatMoney,
} from "../../../../shared/formatters";
import { clientesApi } from "../../clientes/api/clientesApi";
import type { Cliente } from "../../clientes/tipos";
import {
  EntityActions,
  EntityAlert,
  EntityButton,
  EntityCard,
  EntityDetailGrid,
  EntityDetailList,
  EntityField,
  EntityFormGrid,
  EntityHero,
  EntityPage,
} from "../../shared/entity-ui";
import { ordensServicoApi } from "../api/ordensServicoApi";
import { toOrdemServicoViewModel } from "../ordemServico.viewModel";
import type { OrdemServico } from "../tipos";

type AcaoOs = "iniciar" | "aguardar" | "concluir" | "cancelar";

function statusClass(status: OrdemServico["status"]): string {
  if (status === "CONCLUIDA") return "ck-status ck-status-success";
  if (status === "CANCELADA") return "ck-status ck-status-danger";
  if (status === "AGUARDANDO" || status === "ABERTA") {
    return "ck-status ck-status-warning";
  }

  return "ck-status";
}

export default function OrdemServicoDetailsPage() {
  const { ordemServicoId } = useParams();
  const navigate = useNavigate();

  const [item, setItem] = useState<OrdemServico | null>(null);
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [erroAcao, setErroAcao] = useState<string | null>(null);
  const [valorTotal, setValorTotal] = useState("0");
  const [isRunning, setIsRunning] = useState<AcaoOs | "gerar-venda" | null>(
    null,
  );

  async function carregar() {
    if (!ordemServicoId) return;

    setErro(null);

    try {
      const response = await ordensServicoApi.obter(ordemServicoId);
      setItem(response.item);

      if (response.item.clienteId) {
        const clienteResponse = await clientesApi.obter(response.item.clienteId);
        setCliente(clienteResponse.item);
      } else {
        setCliente(null);
      }
    } catch (error) {
      setErro(mapError(error).message);
    }
  }

  useEffect(() => {
    void carregar();
  }, [ordemServicoId]);

  async function executarAcao(acao: AcaoOs) {
    if (!ordemServicoId) return;

    setIsRunning(acao);
    setErroAcao(null);

    try {
      if (acao === "iniciar") await ordensServicoApi.iniciar(ordemServicoId);
      if (acao === "aguardar") await ordensServicoApi.aguardar(ordemServicoId);
      if (acao === "concluir") await ordensServicoApi.concluir(ordemServicoId);
      if (acao === "cancelar") await ordensServicoApi.cancelar(ordemServicoId);

      await carregar();
    } catch (error) {
      setErroAcao(mapError(error).message);
    } finally {
      setIsRunning(null);
    }
  }

  async function gerarVenda() {
    if (!ordemServicoId) return;

    setIsRunning("gerar-venda");
    setErroAcao(null);

    try {
      const response = await ordensServicoApi.gerarVenda(ordemServicoId, {
        valorTotal: Number(valorTotal) || 0,
        vencimentoEm: new Date().toISOString(),
      });

      navigate(`/app/transacoes/${response.transacaoId}`);
    } catch (error) {
      setErroAcao(mapError(error).message);
    } finally {
      setIsRunning(null);
    }
  }

  if (erro) {
    return (
      <EntityPage>
        <EntityAlert>{erro}</EntityAlert>
      </EntityPage>
    );
  }

  if (!item) {
    return (
      <EntityPage>
        <EntityCard>Carregando ordem de serviço...</EntityCard>
      </EntityPage>
    );
  }

  const clienteLabel = cliente
    ? formatClienteLabel(cliente)
    : "Cliente não vinculado";

  const vm = toOrdemServicoViewModel({
    ...item,
    clienteNome: clienteLabel,
  });

  return (
    <EntityPage>
      <EntityHero
        kicker="Ordem de serviço"
        title={vm.titulo}
        description={[vm.subtitulo, vm.contexto, vm.status]
          .filter(Boolean)
          .join(" — ")}
        actions={
          <EntityButton to="/app/ordens-servico">
            Lista de ordens
          </EntityButton>
        }
      />

      {erroAcao ? <EntityAlert>{erroAcao}</EntityAlert> : null}

      <EntityDetailGrid columns={3}>
        <EntityCard title="Resumo" description="Informações principais da ordem.">
          <EntityDetailList
            items={[
              { label: "Título", value: item.titulo },
              { label: "Cliente", value: clienteLabel },
              {
                label: "Status",
                value: <span className={statusClass(item.status)}>{item.status}</span>,
              },
            ]}
          />
        </EntityCard>

        <EntityCard title="Datas" description="Referências de abertura e registro.">
          <EntityDetailList
            items={[
              { label: "Aberta em", value: formatDateTime(item.abertaEm) },
              { label: "Fechada em", value: formatDateTime(item.fechadaEm) },
              { label: "Criada em", value: formatDateTime(item.criadoEm) },
              {
                label: "Atualizada em",
                value: formatDateTime(item.atualizadoEm),
              },
            ]}
          />
        </EntityCard>

        <EntityCard title="Ações" description="Atualize o andamento da ordem.">
          <EntityActions>
            <EntityButton
              type="button"
              disabled={Boolean(isRunning)}
              onClick={() => executarAcao("iniciar")}
            >
              Iniciar
            </EntityButton>

            <EntityButton
              type="button"
              disabled={Boolean(isRunning)}
              onClick={() => executarAcao("aguardar")}
            >
              Aguardar
            </EntityButton>

            <EntityButton
              type="button"
              disabled={Boolean(isRunning)}
              onClick={() => executarAcao("concluir")}
            >
              Concluir
            </EntityButton>

            <EntityButton
              type="button"
              disabled={Boolean(isRunning)}
              onClick={() => executarAcao("cancelar")}
            >
              Cancelar
            </EntityButton>
          </EntityActions>
        </EntityCard>
      </EntityDetailGrid>

      <EntityCard title="Descrição">
        <p className="ck-entity-description">
          {item.descricao ?? "Nenhuma descrição cadastrada."}
        </p>
      </EntityCard>

      <EntityCard
        title="Gerar venda"
        description="Converta a ordem em transação financeira quando o serviço for cobrado."
      >
        <EntityFormGrid>
          <EntityField label="Valor total">
            <input
              inputMode="decimal"
              value={valorTotal}
              onChange={(event) => setValorTotal(event.target.value)}
              placeholder={formatMoney(0)}
            />
          </EntityField>
        </EntityFormGrid>

        <EntityActions>
          <EntityButton
            type="button"
            variant="primary"
            disabled={isRunning === "gerar-venda"}
            onClick={gerarVenda}
          >
            {isRunning === "gerar-venda" ? "Gerando..." : "Gerar venda"}
          </EntityButton>
        </EntityActions>
      </EntityCard>
    </EntityPage>
  );
}
