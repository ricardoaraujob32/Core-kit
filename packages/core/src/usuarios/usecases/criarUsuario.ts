import { wrapOk } from "../../result";
import type { CriarUsuarioInput, CriarUsuarioOutput, ResultadoCriarUsuario } from "../tipos";
import type { UsuariosRepositorio } from "../portasRepositorio";
import type { IdPorta, RelogioPorta } from "../../utils";
import { validarEmailUsuario, validarNomeUsuario, validarSenhaHash } from "../validadores";
import { emailUsuarioJaExiste } from "../erros";
import { validarLocatarioId } from "../../locatarios";

export function createCriarUsuario(deps: {
  usuariosRepo: UsuariosRepositorio;
  idPorta: IdPorta;
  relogio: RelogioPorta;
}) {
  return async function criarUsuario(
    input: CriarUsuarioInput,
  ): ResultadoCriarUsuario {
    const locatarioId = validarLocatarioId(input.locatarioId);
    if (!locatarioId.ok) return locatarioId;

    const email = validarEmailUsuario(input.email);
    if (!email.ok) return email;

    const nome = validarNomeUsuario(input.nome);
    if (!nome.ok) return nome;

    const senhaHash = validarSenhaHash(input.senhaHash);
    if (!senhaHash.ok) return senhaHash;

    const existente = await deps.usuariosRepo.buscarPorEmailNoLocatario({
      locatarioId: locatarioId.value,
      emailNormalizado: email.value,
    });
    if (!existente.ok) return existente;
    if (existente.value) {
      return emailUsuarioJaExiste(email.value, locatarioId.value);
    }

    const usuarioId = deps.idPorta.gerarId();
    const agora = deps.relogio.agora();

    const criado = await deps.usuariosRepo.criar({
      usuarioId,
      locatarioId: locatarioId.value,
      email: email.value,
      nome: nome.value,
      senhaHash: senhaHash.value,
      status: "ATIVO",
      ultimoLoginEm: null,
      criadoEm: agora,
      atualizadoEm: agora,
      excluidoEm: null,
    });
    if (!criado.ok) return criado;

    return wrapOk<CriarUsuarioOutput>({
      usuarioId: criado.value.usuarioId,
    });
  };
}