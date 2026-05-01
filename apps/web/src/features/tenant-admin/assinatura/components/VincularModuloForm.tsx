// apps/web/src/features/tenant-admin/assinatura/components/VincularModuloForm.tsx

import { useState } from "react";

type Props = {
  isSaving?: boolean;
  onSubmit: (moduloId: string) => void | Promise<void>;
};

export function VincularModuloForm({ isSaving, onSubmit }: Props) {
  const [moduloId, setModuloId] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    await onSubmit(moduloId);
    setModuloId("");
  }

  return (
    <form
      className="grid gap-4 rounded-2xl border bg-white p-6"
      onSubmit={handleSubmit}
    >
      <div>
        <h2 className="text-lg font-semibold">Vincular módulo</h2>
        <p className="text-sm text-slate-600">
          Informe o ID do módulo a ser habilitado na assinatura.
        </p>
      </div>

      <label className="grid gap-1">
        <span className="text-sm font-medium">ID do módulo</span>
        <input
          className="rounded-xl border px-3 py-2"
          value={moduloId}
          onChange={(event) => setModuloId(event.target.value)}
          required
        />
      </label>

      <div className="flex justify-end">
        <button
          className="rounded-xl border px-4 py-2 font-medium"
          type="submit"
          disabled={Boolean(isSaving)}
        >
          {isSaving ? "Vinculando..." : "Vincular"}
        </button>
      </div>
    </form>
  );
}