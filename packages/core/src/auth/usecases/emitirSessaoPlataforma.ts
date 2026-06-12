// packages/core/src/auth/usecases/emitirSessaoPlataforma.ts

// packages/core/src/auth/usecases/emitirSessaoPlataforma.ts

import type {
  ErroApp,
  Result,
  IdPorta,
  RelogioPorta,
} from "../../kernel";
import { createErroApp, wrapOk } from "../../kernel";

import type {
  EventosSegurancaPorta,
  HashAuthPorta,
  JwtAuthPorta,
} from "../portasServico";

import type {
  UsuariosRepositorioAuth,
} from "../portasRepositorio";

export type EmitirSessaoPlataformaInput = {
  email: string;
  senha: string;
};

export type EmitirSessaoPlataformaOutput = {
  accessToken: string;
  accessExpiraEm: Date;
  usuarioId: string;
};

export type EmitirSessaoPlataformaDeps = {
  usuariosRepositorio: UsuariosRepositorioAuth;
  hashPorta: HashAuthPorta;
  jwtPorta: JwtAuthPorta;
  relogio: RelogioPorta;
  idPorta: IdPorta;
  eventos?: EventosSegurancaPorta;
  issuer: string;
};

export function createFnEmitirSessaoPlataforma(
  deps: EmitirSessaoPlataformaDeps,
) {
  return async function emitirSessaoPlataforma(
    input: EmitirSessaoPlataformaInput,
  ): Promise<Result<EmitirSessaoPlataformaOutput, ErroApp>> {
    const email = input.email?.trim().toLowerCase();
    const agora = deps.relogio.agora();

    if (!email || !input.senha) {
      return createErroApp({
        codigo: "INVALIDO",
        mensagem: "E-mail e senha são obrigatórios.",
        detalhes: {
          operacao: "auth.plataforma.emitirSessao.validarEntrada",
        },
      });
    }

    const usuarioResult =
      await deps.usuariosRepositorio.buscarUsuarioPlataformaPorEmail({
        email,
      });

    if (!usuarioResult.ok) return usuarioResult;

    const usuario = usuarioResult.value;

    if (!usuario) {
      await deps.eventos?.registrarEvento?.({
        tipo: "auth.login.falha",
        usuarioId: null,
        locatarioId: null,
        quando: agora,
        detalhes: {
          perfil: "PLATAFORMA",
          motivo: "usuario_plataforma_nao_encontrado",
          email,
        },
      });

      return createErroApp({
        codigo: "NAO_AUTENTICADO",
        mensagem: "Credenciais inválidas.",
        detalhes: {
          operacao: "auth.plataforma.emitirSessao.credenciais",
        },
      });
    }

    if (usuario.locatarioId !== null) {
      return createErroApp({
        codigo: "NAO_AUTORIZADO",
        mensagem: "Usuário informado não é usuário de plataforma.",
        detalhes: {
          operacao: "auth.plataforma.emitirSessao.usuarioNaoPlataforma",
          usuarioId: usuario.usuarioId,
        },
      });
    }

    if (usuario.status !== "ATIVO") {
      return createErroApp({
        codigo: "NAO_AUTENTICADO",
        mensagem: "Usuário de plataforma não está ativo.",
        detalhes: {
          operacao: "auth.plataforma.emitirSessao.status",
          usuarioId: usuario.usuarioId,
          status: usuario.status,
        },
      });
    }

    const senhaOk = await deps.hashPorta.compararSenha(
      input.senha,
      usuario.senhaHash,
    );

    if (!senhaOk.ok) return senhaOk;

    if (!senhaOk.value) {
      await deps.eventos?.registrarEvento?.({
        tipo: "auth.login.falha",
        usuarioId: usuario.usuarioId,
        locatarioId: null,
        quando: agora,
        detalhes: {
          perfil: "PLATAFORMA",
          motivo: "senha_invalida",
        },
      });

      return createErroApp({
        codigo: "NAO_AUTENTICADO",
        mensagem: "Credenciais inválidas.",
        detalhes: {
          operacao: "auth.plataforma.emitirSessao.credenciais",
        },
      });
    }

    const sessionId = deps.idPorta.gerarId();
    const ttlSegundos = 10 * 60;

    const accessTokenResult = await deps.jwtPorta.emitirAccessToken({
      usuarioId: usuario.usuarioId,
      locatarioId: null,
      sessionId,
      agora,
      ttlSegundos,
      issuer: deps.issuer,
    });

    if (!accessTokenResult.ok) return accessTokenResult;

    await deps.eventos?.registrarEvento?.({
      tipo: "auth.login.sucesso",
      usuarioId: usuario.usuarioId,
      locatarioId: null,
      quando: agora,
      detalhes: {
        perfil: "PLATAFORMA",
      },
    });

    return wrapOk({
      accessToken: accessTokenResult.value.token,
      accessExpiraEm: new Date(agora.getTime() + ttlSegundos * 1000),
      usuarioId: usuario.usuarioId,
    });
  };
}