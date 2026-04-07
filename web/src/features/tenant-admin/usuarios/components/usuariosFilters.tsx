
import type { ChangeEvent } from "react";
import type { FiltroUsuarios, StatusUsuario } from "../tipos";

type Props = {
  filtro: FiltroUsuarios;
  onChange: (next: FiltroUsuarios) => void;
};

const statusOptions: Array<StatusUsuario | "TODOS"> = [
  "TODOS",
  "ATIVO",
  "INATIVO",
  "SUSPENSO",
  "ENCERRADO",
];

export function UsuariosFilters({ filtro, onChange }: Props) {
  function handleBusca(event: ChangeEvent<HTMLInputElement>) {
    onChange({
      ...filtro,
      busca: event.target.value,
    });
  }

  function handleStatus(event: ChangeEvent<HTMLSelectElement>) {
    onChange({
      ...filtro,
      status: event.target.value as FiltroUsuarios["status"],
    });
  }

  return (
    <div className="grid gap-3 md:grid-cols-[1fr_220px]">
      <input
        className="rounded-xl border px-3 py-2"
        placeholder="Buscar por nome ou e-mail"
        value={filtro.busca ?? ""}
        onChange={handleBusca}
      />

      <select
        className="rounded-xl border px-3 py-2"
        value={filtro.status ?? "TODOS"}
        onChange={handleStatus}
      >
        {statusOptions.map((status) => (
          <option key={status} value={status}>
            {status}
          </option>
        ))}
      </select>
    </div>
  );
}
