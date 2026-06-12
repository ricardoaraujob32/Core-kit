// packages/core/src/auth/usecases/emitirSessao.ts

import { executarEmTransacao, IdPorta, RelogioPorta, TransacaoPorta, wrapOk } from "../../kernel";
import { validarLocatarioSlug } from "../../locatarios/validadores";
import { credenciaisInvalidas, locatarioNaoPodeAutenticar, usuarioNaoPodeAutenticar } from "../erros";
import { LocatariosRepositorioAuth, UsuariosRepositorioAuth } from "../portasRepositorio";
import { EventosSegurancaPorta, HashAuthPorta, JwtAuthPorta, TokensAuthPorta } from "../portasServico";
import { EmitirSessaoInput, EmitirSessaoOutput, EmitirSessaoResult, Sessao } from "../tipos";
import { validarEmailAuth, validarSenha } from "../validadores";

/**
 * Cria o caso de uso responsável por autenticar um usuário e emitir uma nova sessão.
 *
 * Este caso de uso:
 * - valida `locatarioId`, e-mail e senha;
 * - opcionalmente valida o locatário via `locatariosPorta`;
 * - busca o usuário por e-mail;
 * - valida o estado do usuário;
 * - compara a senha informada com o hash persistido;
 * - emite access token;
 * - cria refresh token;
 * - registra último login em modo best effort;
 * - registra eventos de segurança, quando a porta estiver disponível;
 * - devolve a sessão materializada.
 *
 * Dependências:
 * - `usuariosPorta`: consulta e atualização do usuário de autenticação;
 * - `locatariosPorta`: validação opcional do locatário;
 * - `tokensPorta`: criação do refresh token;
 * - `hashPorta`: comparação segura de senha;
 * - `jwtPorta`: emissão do access token;
 * - `relogio`: materialização do instante atual;
 * - `idPorta`: geração de `sessionId`;
 * - `eventos`: registro opcional de eventos de segurança;
 * - TTLs e `issuer`: parâmetros opcionais de sessão.
 *
 * @param deps Dependências externas necessárias para a execução.
 * @returns Função `emitirSessao` pronta para receber a entrada do caso de uso.
 */
export function createFnEmitirSessao(deps: {
  usuariosRepositorio: UsuariosRepositorioAuth;
  locatariosRepositorio?: LocatariosRepositorioAuth;
  tokensPorta: TokensAuthPorta;
  hashPorta: HashAuthPorta;
  jwtPorta: JwtAuthPorta;
  relogio: RelogioPorta;
  idPorta: IdPorta;
  transacao?: TransacaoPorta;
  eventos?: EventosSegurancaPorta;
  ttlAccessSegundos?: number;
  ttlRefreshMs?: number;
  issuer?: string;
}) {
  /**
   * Executa o caso de uso de emissão de sessão.
   *
   * Fluxo:
   * 1. valida entrada;
   * 2. valida locatário, quando aplicável;
   * 3. busca usuário por e-mail;
   * 4. verifica estado do usuário;
   * 5. compara senha;
   * 6. gera `sessionId`;
   * 7. emite access token;
   * 8. cria refresh token;
   * 9. atualiza último login em best effort;
   * 10. registra evento de sucesso/falha;
   * 11. devolve a sessão.
   *
   * @param input Credenciais e escopo do login.
   * @returns `Ok(sessao)` em caso de sucesso, ou `Err(ErroApp)` em caso de falha.
   */
  return async function emitirSessao(input: EmitirSessaoInput): EmitirSessaoResult {
     const locatarioSlug = validarLocatarioSlug(input.locatarioSlug);
    if (!locatarioSlug.ok) return locatarioSlug;

    const email = validarEmailAuth(input.email);
    if (!email.ok) return email;

    const senha = validarSenha(input.senha);
    if (!senha.ok) return senha;

    const agora = deps.relogio.agora();

    if (!deps.locatariosRepositorio) {
      return credenciaisInvalidas();
    }

    const locRes = await deps.locatariosRepositorio.buscarPorSlug({
      locatarioSlug: locatarioSlug.value,
    });
    if (!locRes.ok) return locRes;

    const locatario = locRes.value;
    if (!locatario) return credenciaisInvalidas();

    if (locatario.status !== "ATIVO") {
      return locatarioNaoPodeAutenticar(locatario.status);
    }

    const locatarioId = locatario.locatarioId;

    const usuarioRes = await deps.usuariosRepositorio.buscarPorEmail({
      locatarioId,
      email: email.value,
    });
    if (!usuarioRes.ok) return usuarioRes;

    const usuario = usuarioRes.value;
    if (!usuario) {
      await deps.eventos?.registrarEvento?.({
        tipo: "auth.login.falha",
        usuarioId: null,
        locatarioId,
        detalhes: {
          motivo: "usuario_nao_encontrado",
          email: email.value,
          locatarioSlug: locatarioSlug.value,
        },
        quando: agora,
      });

      return credenciaisInvalidas();
    }

    if (usuario.status !== "ATIVO") {
      await deps.eventos?.registrarEvento?.({
        tipo: "auth.login.falha",
        usuarioId: usuario.usuarioId,
        locatarioId,
        detalhes: {
          motivo: "status_invalido",
          status: usuario.status,
          locatarioSlug: locatarioSlug.value,
        },
        quando: agora,
      });

      return usuarioNaoPodeAutenticar(usuario.status);
    }

    const senhaOk = await deps.hashPorta.compararSenha(
      senha.value,
      usuario.senhaHash,
    );
    if (!senhaOk.ok) return senhaOk;

    if (!senhaOk.value) {
      await deps.eventos?.registrarEvento?.({
        tipo: "auth.login.falha",
        usuarioId: usuario.usuarioId,
        locatarioId,
        detalhes: {
          motivo: "senha_incorreta",
          locatarioSlug: locatarioSlug.value,
        },
        quando: agora,
      });

      return credenciaisInvalidas();
    }

    const sessionId = deps.idPorta.gerarId();

    const accessRes = await deps.jwtPorta.emitirAccessToken({
      usuarioId: usuario.usuarioId,
      locatarioId,
      sessionId,
      agora,
      ttlSegundos: deps.ttlAccessSegundos ?? 600,
      issuer: deps.issuer ?? "mini-saas-api",
    });
    if (!accessRes.ok) return accessRes;

    const refreshRes = await executarEmTransacao(deps.transacao, async () => {
      return deps.tokensPorta.criarRefresh({
        locatarioId,
        usuarioId: usuario.usuarioId,
        agora,
        ttlMs: deps.ttlRefreshMs ?? 1000 * 60 * 60 * 24 * 14,
      });
    });
    if (!refreshRes.ok) return refreshRes;

    const ultimoLogin = await deps.usuariosRepositorio.atualizarUltimoLogin({
      usuarioId: usuario.usuarioId,
      quando: agora,
    });
    if (!ultimoLogin.ok) {
      // best effort
    }

    await deps.eventos?.registrarEvento?.({
      tipo: "auth.login.sucesso",
      usuarioId: usuario.usuarioId,
      locatarioId,
      detalhes: {
        sessionId,
        locatarioSlug: locatarioSlug.value,
      },
      quando: agora,
    });

    const sessao: Sessao = {
      accessToken: accessRes.value.token,
      refreshToken: refreshRes.value.tokenBruto,
      accessExpiraEm: new Date(accessRes.value.payload.exp * 1000),
      refreshExpiraEm: refreshRes.value.expiraEm,
    };

    return wrapOk<EmitirSessaoOutput>({
      sessao,
    });
  };
}
