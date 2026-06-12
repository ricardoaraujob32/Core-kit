// apps/web/src/features/superadmin/locatarios/pages/LocatarioDetailsPage.tsx

import { Link, useParams } from "react-router-dom";
import { LocatarioBrandingResumo } from "../components/LocatarioBrandingResumo";
import { LocatarioModulosResumo } from "../components/LocatarioModulosResumo";
import { useLocatario } from "../hooks/useLocatario";
import { useLocatarioActions } from "../hooks/useLocatarioActions";
import { useLocatarioConfiguracoes } from "../hooks/useLocatarioConfiguracoes";

function formatarData(value?: string | null): string {
  if (!value) return "—";
  return new Date(value).toLocaleString("pt-BR");
}

function normalizarStatus(status?: string | null): string {
  return status?.trim().toUpperCase() ?? "";
}

export default function LocatarioDetailsPage() {
  const params = useParams<{ locatarioId: string }>();
  const locatarioId = params.locatarioId?.trim();

  const { item, isLoading, erro, recarregar } = useLocatario(locatarioId);
  const {
    branding,
    modulos,
    isLoading: isLoadingConfiguracoes,
    erro: erroConfiguracoes,
    recarregar: recarregarConfiguracoes,
  } = useLocatarioConfiguracoes(locatarioId);

  const { erro: erroAcao, isRunning, suspender, reativar, encerrar } =
    useLocatarioActions(async () => {
      await recarregar();
      await recarregarConfiguracoes();
    });

  if (isLoading) {
    return <div className="rounded-2xl border bg-white p-6">Carregando locatário...</div>;
  }

  if (erro) {
    return <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{erro}</div>;
  }

  if (!item || !locatarioId) {
    return <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">Locatário não encontrado.</div>;
  }

  const id = locatarioId;
  const status = normalizarStatus(item.status);
  const estaEncerrado = status === "ENCERRADO" || Boolean(item.excluidoEm);
  const estaSuspenso = !estaEncerrado && status.includes("SUSPENS");
  const estaAtivo = !estaEncerrado && status === "ATIVO";

  async function handleSuspender() {
    const motivoSuspensao = window.prompt("Motivo da suspensão do locatário:")?.trim() || undefined;
    await suspender(id, motivoSuspensao);
  }

  async function handleReativar() {
    const motivoReativacao = window.prompt("Motivo da reativação do locatário:")?.trim() || undefined;
    await reativar(id, motivoReativacao);
  }

  async function handleEncerrar() {
    const confirmado = window.confirm("Encerrar este locatário? Esta operação deve ser usada apenas quando o contrato/conta será finalizado.");
    if (!confirmado) return;
    const motivoExclusao = window.prompt("Motivo do encerramento do locatário:")?.trim() || undefined;
    await encerrar(id, motivoExclusao);
  }

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div><h1 className="text-2xl font-semibold">{item.nome}</h1><p className="text-sm text-slate-600">{item.email}</p></div>
        <div className="flex flex-wrap gap-3">
          <Link className="rounded-xl border px-4 py-2" to={`/plataforma/locatarios/${id}/editar`}>Editar</Link>
          <Link className="rounded-xl border px-4 py-2" to={`/plataforma/locatarios/${id}/usuarios`}>Usuários</Link>
          {!estaEncerrado ? <Link className="rounded-xl border px-4 py-2" to={`/plataforma/locatarios/${id}/usuarios/novo`}>Novo usuário</Link> : null}
        </div>
      </div>

      {erroAcao ? <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{erroAcao}</div> : null}

      <div className="grid gap-2 rounded-2xl border bg-white p-6 text-sm">
        <div><strong>ID:</strong> {item.locatarioId}</div><div><strong>Slug:</strong> {item.slug}</div><div><strong>Status:</strong> {item.status}</div>
        <div><strong>Documento:</strong> {item.documento ?? "—"}</div><div><strong>Fuso horário:</strong> {item.fusoHorario ?? "—"}</div>
        <div><strong>Criado em:</strong> {formatarData(item.criadoEm)}</div><div><strong>Atualizado em:</strong> {formatarData(item.atualizadoEm)}</div><div><strong>Excluído em:</strong> {formatarData(item.excluidoEm)}</div>
      </div>

      {erroConfiguracoes ? <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{erroConfiguracoes}</div> : null}
      {isLoadingConfiguracoes ? <div className="rounded-2xl border bg-white p-6">Carregando configurações...</div> : <><LocatarioBrandingResumo branding={branding} /><LocatarioModulosResumo modulos={modulos} /></>}

      <div className="rounded-2xl border bg-white p-6">
        <h2 className="mb-3 text-lg font-semibold">Operações do locatário</h2>
        {estaAtivo ? <div className="flex flex-wrap gap-3"><button className="rounded-xl border px-4 py-2" type="button" onClick={() => void handleSuspender()} disabled={isRunning !== null}>{isRunning === "suspender" ? "Suspendendo..." : "Suspender"}</button><button className="rounded-xl border px-4 py-2 text-red-700" type="button" onClick={() => void handleEncerrar()} disabled={isRunning !== null}>{isRunning === "encerrar" ? "Encerrando..." : "Encerrar"}</button></div> : null}
        {estaSuspenso ? <div className="flex flex-wrap gap-3"><button className="rounded-xl border px-4 py-2" type="button" onClick={() => void handleReativar()} disabled={isRunning !== null}>{isRunning === "reativar" ? "Reativando..." : "Reativar"}</button><button className="rounded-xl border px-4 py-2 text-red-700" type="button" onClick={() => void handleEncerrar()} disabled={isRunning !== null}>{isRunning === "encerrar" ? "Encerrando..." : "Encerrar"}</button></div> : null}
        {estaEncerrado ? <p className="text-sm text-slate-600">Locatário encerrado. Nenhuma operação operacional disponível.</p> : null}
        {!estaAtivo && !estaSuspenso && !estaEncerrado ? <p className="text-sm text-slate-600">Nenhuma operação disponível para o status atual: {item.status}.</p> : null}
      </div>
    </div>
  );
}
