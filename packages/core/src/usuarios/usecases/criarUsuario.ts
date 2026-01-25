// packages/core/src/usuarios/usecases/criarUsuario.ts

import type { Result } from "../../result";
import { ok, err } from "../../result";
import { appError } from "../../errors";

import type { ContextoExecucao } from "../../locatario";
import type { UsuariosRepo } from "../repo";
import type { Usuario, NovoUsuario } from "../types";
import { nomeValido, normalizeNome } from "../validators";

type Deps = {
  usuariosRepo: UsuariosRepo;
  gerarId: () => string;
};

export async function criarUsuario(
  ctx: ContextoExecucao,
  deps: Deps,
  input: NovoUsuario,
): Promise<Result<Usuario, ReturnType<typeof appError>>> {
  // Regra: precisa de locatário sempre.
  if (!ctx.locatarioId) {
    return err(appError("UNAUTHORIZED", "Locatário ausente no contexto."));
  }

  const nome = normalizeNome(input.nome);
  if (!nomeValido(nome)) {
    return err(appError("VALIDATION", "Nome inválido."));
  }

  // Regra de negócio: não duplicar por nome no mesmo tenant.
  // (Se futuramente for por e-mail/username, troca aqui.)
  const existente = await deps.usuariosRepo.findByNome(nome);
  if (existente) {
    return err(appError("CONFLICT", "Usuário já existe."));
  }

  const usuario: Usuario = {
    id: deps.gerarId(),
    nome,
    status: "ATIVO",
  };

  await deps.usuariosRepo.create(usuario);
  return ok(usuario);
}
