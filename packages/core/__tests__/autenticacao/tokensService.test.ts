// packages/core/__tests__/autenticacao/tokensService.test.ts
import { describe, it, expect } from "vitest";
import { wrapOk, wrapErr } from "../../src/result";
import type { Permissao } from "../../src/autorizacao/permissoes";

// A SER IMPLEMENTADO
import { criarTokensService } from "../../src/autenticacao/tokensService";

type UsuarioId = string;
type LocatarioId = string;

type TipoToken = "ACESSO" | "REFRESH" | "RECUPERACAO_SENHA" | "CONFIRMACAO_EMAIL";

type TokenRow = {
  token_id: string;
  usuario_id: UsuarioId;
  locatario_id: LocatarioId;
  tipo: TipoToken;
  hash_token: string;
  emitido_em: Date;
  expira_em: Date;
  revogado_em: Date | null;
  proximo_token_id: string | null;
  proximo_usuario_id: UsuarioId | null;
};

describe("Tokens - tokensService", () => {
  it("emitirSessao gera access (JWT) com ttl 10min e refresh com ttl 14d", async () => {
    const agora = new Date("2026-03-01T12:00:00.000Z");

    const tokenRepo = criarRepoEmMemoria();
    const jwt = criarJwtFake();
    const crypto = criarCryptoFake();

    const tokens = criarTokensService({
      tokenRepo,
      jwt,
      crypto,
      agora: () => agora,
      ttlMinutos: { acesso: 10, senha: 60 },
      ttlDias: { refresh: 14, email: 72 / 24 },
    });

    const r = await tokens.emitirSessao({
      locatarioId: "loc-1",
      usuarioId: "usr-1",
      ip: "127.0.0.1",
      userAgent: "vitest",
    });

    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(typeof r.value.accessToken).toBe("string");
      expect(typeof r.value.refreshToken).toBe("string");

      // JWT fake registra TTL
      expect(jwt.ultimoTtlSegundos).toBe(10 * 60);

      // refresh persistido como hash-only
      const rows = tokenRepo.dump();
      expect(rows.length).toBe(1);
      expect(rows[0].tipo).toBe("REFRESH");
      expect(rows[0].hash_token).toBe(crypto.hash(r.value.refreshToken));
      expect(rows[0].expira_em.toISOString()).toBe(new Date(agora.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString());
    }
  });

  it("renovarSessao rotaciona refresh: token antigo aponta para próximo; uso do antigo depois falha (replay)", async () => {
    const agora0 = new Date("2026-03-01T12:00:00.000Z");
    const tokenRepo = criarRepoEmMemoria();
    const jwt = criarJwtFake();
    const crypto = criarCryptoFake();

    const tokens = criarTokensService({
      tokenRepo,
      jwt,
      crypto,
      agora: () => agora0,
      ttlMinutos: { acesso: 10, senha: 60 },
      ttlDias: { refresh: 14, email: 72 / 24 },
    });

    // 1) cria sessão
    const login = await tokens.emitirSessao({
      locatarioId: "loc-1",
      usuarioId: "usr-1",
      ip: "127.0.0.1",
      userAgent: "vitest",
    });
    expect(login.ok).toBe(true);
    if (!login.ok) return;

    const refreshAntigo = login.value.refreshToken;

    // 2) renova (rotaciona)
    const renova = await tokens.renovarSessao({
      refreshToken: refreshAntigo,
      ip: "127.0.0.1",
      userAgent: "vitest",
    });

    expect(renova.ok).toBe(true);
    if (!renova.ok) return;

    const refreshNovo = renova.value.refreshToken;
    expect(refreshNovo).not.toBe(refreshAntigo);

    // 3) token antigo deve ter proximo preenchido
    const rows = tokenRepo.dump();
    expect(rows.length).toBe(2);

    const antigoRow = rows.find((x) => x.hash_token === crypto.hash(refreshAntigo))!;
    expect(antigoRow.proximo_token_id).toBeTruthy();
    expect(antigoRow.proximo_usuario_id).toBe("usr-1");

    // 4) tentar usar o antigo de novo => replay
    const reuse = await tokens.renovarSessao({
      refreshToken: refreshAntigo,
      ip: "127.0.0.1",
      userAgent: "vitest",
    });

    expect(reuse.ok).toBe(false);
    if (!reuse.ok) {
      expect(reuse.error.codigo).toBe("NAO_AUTENTICADO");
    }
  });

  it("token one-time de RECUPERACAO_SENHA expira em 60min e só pode ser usado 1 vez", async () => {
    const agora = new Date("2026-03-01T12:00:00.000Z");
    const tokenRepo = criarRepoEmMemoria();
    const jwt = criarJwtFake();
    const crypto = criarCryptoFake();

    // relógio “mutável” pra simular passagem de tempo
    let clock = agora;

    const tokens = criarTokensService({
      tokenRepo,
      jwt,
      crypto,
      agora: () => clock,
      ttlMinutos: { acesso: 10, senha: 60 },
      ttlDias: { refresh: 14, email: 72 / 24 },
    });

    const gera = await tokens.gerarTokenRecuperacaoSenha({
      locatarioId: "loc-1",
      usuarioId: "usr-1",
    });

    expect(gera.ok).toBe(true);
    if (!gera.ok) return;

    // 1º uso ok (revoga ao consumir)
    const usa1 = await tokens.consumirTokenRecuperacaoSenha({
      token: gera.value.token,
    });
    expect(usa1.ok).toBe(true);

    // 2º uso falha
    const usa2 = await tokens.consumirTokenRecuperacaoSenha({
      token: gera.value.token,
    });
    expect(usa2.ok).toBe(false);
    if (!usa2.ok) expect(usa2.error.codigo).toBe("NAO_AUTENTICADO");

    // expirado (após 60 min) também falha
    const gera2 = await tokens.gerarTokenRecuperacaoSenha({ locatarioId: "loc-1", usuarioId: "usr-1" });
    expect(gera2.ok).toBe(true);
    if (!gera2.ok) return;

    clock = new Date(agora.getTime() + 61 * 60 * 1000);

    const exp = await tokens.consumirTokenRecuperacaoSenha({ token: gera2.value.token });
    expect(exp.ok).toBe(false);
    if (!exp.ok) expect(exp.error.codigo).toBe("NAO_AUTENTICADO");
  });

  it("token one-time de CONFIRMACAO_EMAIL expira em 72h e só pode ser usado 1 vez", async () => {
    const agora = new Date("2026-03-01T12:00:00.000Z");
    const tokenRepo = criarRepoEmMemoria();
    const jwt = criarJwtFake();
    const crypto = criarCryptoFake();

    let clock = agora;

    const tokens = criarTokensService({
      tokenRepo,
      jwt,
      crypto,
      agora: () => clock,
      ttlMinutos: { acesso: 10, senha: 60 },
      ttlDias: { refresh: 14, email: 3 }, // 72h = 3 dias
    });

    const gera = await tokens.gerarTokenConfirmacaoEmail({
      locatarioId: "loc-1",
      usuarioId: "usr-1",
    });

    expect(gera.ok).toBe(true);
    if (!gera.ok) return;

    const usa1 = await tokens.consumirTokenConfirmacaoEmail({ token: gera.value.token });
    expect(usa1.ok).toBe(true);

    const usa2 = await tokens.consumirTokenConfirmacaoEmail({ token: gera.value.token });
    expect(usa2.ok).toBe(false);
    if (!usa2.ok) expect(usa2.error.codigo).toBe("NAO_AUTENTICADO");

    const gera2 = await tokens.gerarTokenConfirmacaoEmail({ locatarioId: "loc-1", usuarioId: "usr-1" });
    expect(gera2.ok).toBe(true);
    if (!gera2.ok) return;

    clock = new Date(agora.getTime() + (72 * 60 * 60 * 1000) + (1 * 60 * 1000));

    const exp = await tokens.consumirTokenConfirmacaoEmail({ token: gera2.value.token });
    expect(exp.ok).toBe(false);
    if (!exp.ok) expect(exp.error.codigo).toBe("NAO_AUTENTICADO");
  });
});

/** --------------------------
 * Fakes de teste (in-memory)
 * -------------------------- */

function criarRepoEmMemoria() {
  const rows: TokenRow[] = [];

  return {
    async inserir(row: TokenRow) {
      rows.push(row);
      return wrapOk(undefined);
    },
    async buscarPorHash(hash: string) {
      const found = rows.find((r) => r.hash_token === hash) ?? null;
      return wrapOk(found);
    },
    async setProximo(params: { tokenId: string; usuarioId: string; proximoTokenId: string; proximoUsuarioId: string }) {
      const { tokenId, usuarioId, proximoTokenId, proximoUsuarioId } = params;
      const row = rows.find((r) => r.token_id === tokenId && r.usuario_id === usuarioId);
      if (!row) return wrapErr({ codigo: "NAO_ENCONTRADO", mensagem: "Token não encontrado." });
      row.proximo_token_id = proximoTokenId;
      row.proximo_usuario_id = proximoUsuarioId;
      return wrapOk(undefined);
    },
    async revogar(params: { tokenId: string; usuarioId: string; quando: Date }) {
      const row = rows.find((r) => r.token_id === params.tokenId && r.usuario_id === params.usuarioId);
      if (!row) return wrapErr({ codigo: "NAO_ENCONTRADO", mensagem: "Token não encontrado." });
      row.revogado_em = params.quando;
      return wrapOk(undefined);
    },
    dump() {
      return rows.map((r) => ({ ...r }));
    },
  };
}

function criarJwtFake() {
  return {
    ultimoTtlSegundos: 0 as number,
    emitirAccessToken(payload: { usuarioId: string; locatarioId: string; permissoes?: Permissao[] }, ttlSegundos: number) {
      this.ultimoTtlSegundos = ttlSegundos;
      // token fake só pra teste
      return `jwt.fake.${payload.locatarioId}.${payload.usuarioId}.${ttlSegundos}`;
    },
  };
}

function criarCryptoFake() {
  return {
    hash(token: string) {
      return `hash:${token}`;
    },
    gerarTokenBruto() {
      // deterministic pra testes
      return `t_${Math.random().toString(16).slice(2)}`;
    },
    gerarId() {
      return `id_${Math.random().toString(16).slice(2)}`;
    },
  };
}