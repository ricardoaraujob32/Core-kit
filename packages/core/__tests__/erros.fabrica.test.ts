import { describe, it, expect } from "vitest";
import {
  createErroApp,
  isErroApp,
  mapCodigoErroToMensagemErro,
  type CodigoErroApp,
} from "../src/erros";

describe("erros - fábrica e mensagens", () => {
  it("deve usar mensagem padrão quando não for passada mensagem customizada", () => {
    const codigo: CodigoErroApp = "NAO_AUTENTICADO";

    const e = createErroApp(codigo);

    expect(e.codigo).toBe(codigo);
    expect(e.mensagem).toBe(mapCodigoErroToMensagemErro(codigo));
  });

  it("deve aceitar mensagem customizada e NÃO sobrescrever com a padrão", () => {
    const codigo: CodigoErroApp = "NAO_AUTORIZADO";
    const mensagemCustom = "Você não pode acessar este recurso.";

    const e = createErroApp(codigo, mensagemCustom);

    expect(e.codigo).toBe(codigo);
    expect(e.mensagem).toBe(mensagemCustom);
  });

  it("deve manter detalhes e causa quando fornecidos", () => {
    const codigo: CodigoErroApp = "INVALIDO";
    const detalhes = { campo: "nome", motivo: "vazio" };
    const causa = new Error("root cause");

    const e = createErroApp(codigo, undefined, detalhes, causa);

    expect(e.detalhes).toEqual(detalhes);
    expect(e.causa).toBe(causa);
  });

  it("isErroApp deve identificar corretamente o formato mínimo", () => {
    const e = createErroApp("ERRO_INTERNO");
    expect(isErroApp(e)).toBe(true);

    expect(isErroApp({})).toBe(false);
    expect(isErroApp({ codigo: "X", mensagem: 123 })).toBe(false);
  });
});
