// apps/web/src/features/tenant-admin/locatario/pages/MeuLocatarioPage.tsx

import { useAuth } from "../../../../core/auth/useAuth";
import { useMeuLocatario } from "../hooks/useMeuLocatario";

export default function MeuLocatarioPage() {
  const { user } = useAuth();
  const { item, isLoading, erro } = useMeuLocatario(user?.locatarioId ?? null);

  if (isLoading) {
    return <div className="rounded-2xl border bg-white p-6">Carregando locatário...</div>;
  }

  if (erro) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
        {erro}
      </div>
    );
  }

  if (!item) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
        Locatário não encontrado.
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Meu locatário</h1>
        <p className="text-sm text-slate-600">
          Informações cadastrais do locatário atual.
        </p>
      </div>

      <div className="grid gap-3 rounded-2xl border bg-white p-6 text-sm">
        <div><strong>Nome:</strong> {item.nome}</div>
        <div><strong>Slug:</strong> {item.slug}</div>
        <div><strong>E-mail:</strong> {item.email}</div>
        <div><strong>Status:</strong> {item.status}</div>
        <div><strong>Documento:</strong> {item.documento ?? "-"}</div>
        <div><strong>Fuso horário:</strong> {item.fusoHorario ?? "-"}</div>
        <div><strong>Criado em:</strong> {item.criadoEm ?? "-"}</div>
        <div><strong>Atualizado em:</strong> {item.atualizadoEm ?? "-"}</div>
      </div>
    </div>
  );
}
