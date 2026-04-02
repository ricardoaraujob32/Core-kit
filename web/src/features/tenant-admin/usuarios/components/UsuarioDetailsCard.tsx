
import type { Usuario } from "../types";

type Props = {
  usuario: Usuario;
};

function formatarData(value: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleString("pt-BR");
}

export function UsuarioDetailsCard({ usuario }: Props) {
  return (
    <div className="grid gap-4 rounded-2xl border bg-white p-6">
      <h2 className="text-lg font-semibold">Detalhes do usuário</h2>

      <div className="grid gap-3 md:grid-cols-2">
        <div>
          <div className="text-xs uppercase text-slate-500">Nome</div>
          <div>{usuario.nome}</div>
        </div>

        <div>
          <div className="text-xs uppercase text-slate-500">E-mail</div>
          <div>{usuario.email}</div>
        </div>

        <div>
          <div className="text-xs uppercase text-slate-500">Status</div>
          <div>{usuario.status}</div>
        </div>

        <div>
          <div className="text-xs uppercase text-slate-500">Último login</div>
          <div>{formatarData(usuario.ultimoLoginEm)}</div>
        </div>

        <div>
          <div className="text-xs uppercase text-slate-500">Criado em</div>
          <div>{formatarData(usuario.criadoEm)}</div>
        </div>

        <div>
          <div className="text-xs uppercase text-slate-500">Atualizado em</div>
          <div>{formatarData(usuario.atualizadoEm)}</div>
        </div>
      </div>
    </div>
  );
}
