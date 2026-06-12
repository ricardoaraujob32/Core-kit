// packages/core/src/usuarios/usecases/criarUsuario.ts

import { executarEmTransacao, IdPorta, RelogioPorta, TransacaoPorta, wrapOk } from "../../kernel/index.js";
import type { CriarUsuarioInput, CriarUsuarioOutput, CriarUsuarioResult } from "../tipos.js";
import type { UsuariosRepositorio } from "../portasRepositorio.js";
import { validarEmailUsuario, validarNomeUsuario, validarSenhaHash } from "../validadores.js";
import { emailUsuarioJaExiste } from "../erros.js";
import { validarLocatarioId } from "../../locatarios/index.js";
import { autorizarUsuario, PoliticaSegurancaUsuariosPorta } from "../politicas.js";

/**
 * Cria a função de caso de uso responsável por registrar um novo usuário.
 *
 * Este caso de uso:
 * - valida `locatarioId`, e-mail, nome e hash de senha;
 * - verifica unicidade de e-mail dentro do escopo do locatário;
 * - gera um novo `usuarioId`;
 * - materializa timestamps por meio da `RelogioPorta`;
 * - persiste o usuário com estado inicial `"ATIVO"`;
 * - devolve apenas o identificador criado no output.
 *
 * Dependências:
 * - `usuariosRepo`: persistência e consulta de usuários;
 * - `idPorta`: geração de identidade estável;
 * - `relogio`: materialização do tempo corrente.
 *
 * @param deps Dependências externas necessárias para a execução do caso de uso.
 * @returns Função `criarUsuario` pronta para receber a entrada do caso de uso.
 */
export function createFnCriarUsuario(deps: {
  usuariosRepositorio: UsuariosRepositorio;
  idPorta: IdPorta;
  relogio: RelogioPorta;
  transacao?: TransacaoPorta;
  politicaSeguranca?: PoliticaSegurancaUsuariosPorta;
}) {
  /**
   * Executa o caso de uso de criação de usuário.
   *
   * Fluxo:
   * 1. valida os campos de entrada;
   * 2. verifica se já existe usuário com o mesmo e-mail no locatário;
   * 3. gera `usuarioId`;
   * 4. materializa timestamps de criação/atualização;
   * 5. persiste o usuário;
   * 6. retorna o identificador criado.
   *
   * @param input Dados necessários para criar o usuário.
   * @returns `Ok({ usuarioId })` em caso de sucesso, ou `Err(ErroApp)` em caso de falha.
   */
  return async function criarUsuario(input: CriarUsuarioInput): CriarUsuarioResult {
    const locatarioId = validarLocatarioId(input.locatarioId);
    if (!locatarioId.ok) return locatarioId;

    const email = validarEmailUsuario(input.email);
    if (!email.ok) return email;

    const nome = validarNomeUsuario(input.nome);
    if (!nome.ok) return nome;

    const senhaHash = validarSenhaHash(input.senhaHash);
    if (!senhaHash.ok) return senhaHash;

    return executarEmTransacao(deps.transacao, async () => {
      const autorizacao = await autorizarUsuario(deps, {
        operacao: "USUARIO_CRIAR",
        locatarioId: locatarioId.value,
        dados: {
          email: email.value,
          nome: nome.value,
        },
      });
      if (autorizacao && !autorizacao.ok) return autorizacao;

      const existente = await deps.usuariosRepositorio.buscarPorEmailNoLocatario({
        locatarioId: locatarioId.value,
        emailNormalizado: email.value,
      });
      if (!existente.ok) return existente;

      if (existente.value) {
        return emailUsuarioJaExiste(email.value, locatarioId.value);
      }

      const usuarioId = deps.idPorta.gerarId();
      const agora = deps.relogio.agora();

      const criado = await deps.usuariosRepositorio.criar({
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
    });
  };
}
