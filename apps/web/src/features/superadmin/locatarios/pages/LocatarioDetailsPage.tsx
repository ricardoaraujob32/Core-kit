// apps/web/src/features/superadmin/locatarios/pages/LocatarioDetailsPage.tsx

import { useState } from "react";
import { useParams } from "react-router-dom";
import { mapError } from "../../../../core/errors/mapError";
import { formatDateTime } from "../../../../shared/formatters";
import { SuperAdminButton, SuperAdminCard, SuperAdminDetailList, SuperAdminPage } from "../../shared";
import { locatariosApi } from "../api/locatariosApi";
import { useLocatario } from "../hooks/useLocatario";
import type { Locatario, StatusLocatario } from "../tipos";

function statusText(status: StatusLocatario): string {
  switch (status) {
    case "ATIVO":
      return "Ativo";
    case "SUSPENSO":
      return "Suspenso";
    case "ENCERRADO":
      return "Encerrado";
    case "INATIVO":
      return "Inativo";
    default:
      return status;
  }
}

export default function LocatarioDetailsPage() {
  const params = useParams<{ locatarioId: string }>();
  const locatarioId = params.locatarioId?.trim();

  const { item, isLoading, erro, recarregar } = useLocatario(locatarioId);
  const [erroAcao, setErroAcao] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState<
    "suspender" | "reativar" | "encerrar" | null
  >(null);

  async function executarAcao(acao: "suspender" | "reativar" | "encerrar") {
    if (!locatarioId) return;

    setIsRunning(acao);
    setErroAcao(null);

    try {
      if (acao === "suspender") {
        await locatariosApi.suspender(locatarioId, {
          motivoSuspensao: "Suspenso pela plataforma.",
        });
      }

      if (acao === "reativar") {
        await locatariosApi.reativar(locatarioId, {
          motivoReativacao: "Reativado pela plataforma.",
        });
      }

      if (acao === "encerrar") {
        await locatariosApi.encerrar(locatarioId, {
          motivoExclusao: "Encerrado pela plataforma.",
        });
      }

      await recarregar();
    } catch (error) {
      setErroAcao(mapError(error).message);
    } finally {
      setIsRunning(null);
    }
  }

  function renderDetails(locatario: Locatario) {
    return (
      <>
        <section className="ck-superadmin-detail-grid">
          <SuperAdminCard
            title="Identificação"
            description="Dados principais do locatário."
          >
            <SuperAdminDetailList
              items={[
                { label: "Nome", value: locatario.nome },
                { label: "Slug", value: locatario.slug },
                {
                  label: "ID técnico",
                  value: locatario.locatarioId,
                  technical: true,
                },
                { label: "Status", value: statusText(locatario.status) },
              ]}
            />
          </SuperAdminCard>

          <SuperAdminCard
            title="Contato e operação"
            description="Dados administrativos usados pela plataforma."
          >
            <SuperAdminDetailList
              items={[
                { label: "E-mail", value: locatario.email },
                { label: "Documento", value: locatario.documento },
                { label: "Fuso horário", value: locatario.fusoHorario },
              ]}
            />
          </SuperAdminCard>
        </section>

        <section className="ck-superadmin-detail-grid">
          <SuperAdminCard title="Datas">
            <SuperAdminDetailList
              items={[
                { label: "Criado em", value: formatDateTime(locatario.criadoEm) },
                {
                  label: "Atualizado em",
                  value: formatDateTime(locatario.atualizadoEm),
                },
                {
                  label: "Excluído em",
                  value: formatDateTime(locatario.excluidoEm),
                },
              ]}
            />
          </SuperAdminCard>

          <SuperAdminCard title="Motivos administrativos">
            <SuperAdminDetailList
              items={[
                {
                  label: "Motivo da suspensão",
                  value: locatario.motivoSuspensao,
                },
                {
                  label: "Motivo do encerramento",
                  value: locatario.motivoExclusao,
                },
              ]}
            />
          </SuperAdminCard>
        </section>

        <SuperAdminCard
          title="Ações administrativas"
          description="Use com cautela. Estas ações alteram o ciclo de vida do locatário."
        >
          {erroAcao ? <p>{erroAcao}</p> : null}

          <div className="ck-superadmin-page__actions">
            <SuperAdminButton
              type="button"
              disabled={Boolean(isRunning)}
              onClick={() => executarAcao("suspender")}
            >
              {isRunning === "suspender" ? "Suspendendo..." : "Suspender"}
            </SuperAdminButton>

            <SuperAdminButton
              type="button"
              disabled={Boolean(isRunning)}
              onClick={() => executarAcao("reativar")}
            >
              {isRunning === "reativar" ? "Reativando..." : "Reativar"}
            </SuperAdminButton>

            <SuperAdminButton
              type="button"
              disabled={Boolean(isRunning)}
              onClick={() => executarAcao("encerrar")}
            >
              {isRunning === "encerrar" ? "Encerrando..." : "Encerrar"}
            </SuperAdminButton>
          </div>
        </SuperAdminCard>
      </>
    );
  }

  return (
    <SuperAdminPage
      kicker="Plataforma"
      title={item?.nome ?? "Locatário"}
      description={
        item
          ? `${item.slug} — ${statusText(item.status)}`
          : "Detalhes administrativos do locatário."
      }
      actions={
        item ? (
          <>
            <SuperAdminButton
              to={`/plataforma/locatarios/${item.locatarioId}/editar`}
              variant="primary"
            >
              Editar
            </SuperAdminButton>

            <SuperAdminButton
              to={`/plataforma/locatarios/${item.locatarioId}/usuarios`}
            >
              Usuários
            </SuperAdminButton>

            <SuperAdminButton to="/plataforma/locatarios">
              Lista de locatários
            </SuperAdminButton>
          </>
        ) : (
          <SuperAdminButton to="/plataforma/locatarios">
            Lista de locatários
          </SuperAdminButton>
        )
      }
    >
      {isLoading ? <SuperAdminCard>Carregando locatário...</SuperAdminCard> : null}

      {erro ? <SuperAdminCard title="Erro">{erro}</SuperAdminCard> : null}

      {!isLoading && !erro && item ? renderDetails(item) : null}

      {!isLoading && !erro && !item ? (
        <SuperAdminCard>Locatário não encontrado.</SuperAdminCard>
      ) : null}
    </SuperAdminPage>
  );
}
