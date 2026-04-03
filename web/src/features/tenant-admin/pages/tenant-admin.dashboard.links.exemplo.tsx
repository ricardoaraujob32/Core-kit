import { Link } from "react-router-dom";

export default function TenantDashboard() {
  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Dashboard do locatário</h1>
        <p className="text-sm text-slate-600">
          Área administrativa do locatário autenticado.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Link
          to="/tenant/usuarios"
          className="rounded-2xl border bg-white p-6 transition hover:shadow-sm"
        >
          <div className="text-lg font-medium">Usuários</div>
          <div className="mt-2 text-sm text-slate-600">
            Gerenciar usuários, ativação, edição e consulta.
          </div>
        </Link>
      </div>
    </div>
  );
}
