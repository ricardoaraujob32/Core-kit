import { wrapOk } from "../../result";
import type {
  CriarUsuarioInput,
  CriarUsuarioOutput,
  ResultadoCriarUsuario,
  UsuarioStatus,
} from "../tipos";
import type { UsuariosRepositorio } from "../portasRepositorio";
import {
  validarEmail,
  validarLocatarioId,
  validarSenhaHash,
} from "../validadores";
import { emailJaEmUso, usuarioInvalido } from "../erros";

export function criarCriarUsuario(deps: {
  usuariosRepo: UsuariosRepositorio;
}) {
  return async function criarUsuario(
    input: CriarUsuarioInput
  ): ResultadoCriarUsuario {
    const loc = validarLocatarioId(input.locatarioId);
    if (!loc.ok) return loc;

    const email = validarEmail(input.email);
    if (!email.ok) return email;

    const senhaHash = validarSenhaHash(input.senhaHash);
    if (!senhaHash.ok) return senhaHash;

    const status: UsuarioStatus = input.status ?? "ATIVO";

    if (!["ATIVO", "INATIVO", "BLOQUEADO"].includes(status)) {
      return usuarioInvalido({ campo: "status", valor: input.status });
    }

    const existenteRes = await deps.usuariosRepo.buscarPorEmail({
      locatarioId: loc.value,
      email: email.value,
    });
    if (!existenteRes.ok) return existenteRes;

    if (existenteRes.value) {
      return emailJaEmUso(email.value);
    }

    const criarRes = await deps.usuariosRepo.criar({
      locatarioId: loc.value,
      email: email.value,
      senhaHash: senhaHash.value,
      status,
    });
    if (!criarRes.ok) return criarRes;

    return wrapOk<CriarUsuarioOutput>({
      usuarioId: criarRes.value.usuarioId,
    });
  };
}