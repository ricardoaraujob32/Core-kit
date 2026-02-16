import { describe, it, expect } from "vitest";
import { wrapOk, wrapErr, map, mapErr, andThen, match, unwrapOr } from "../src/result";

describe("Result (ROP) – operações fundamentais", () => {
  it("map deve transformar value quando Ok", () => {
    const r = wrapOk(2);
    const r2 = map(r, (v) => v * 3);

    expect(r2.ok).toBe(true);
    if (r2.ok) expect(r2.value).toBe(6);
  });

  it("map NÃO deve executar quando Err", () => {
    const r = wrapErr("falha");
    const r2 = map(r, (v: number) => v * 3);

    expect(r2.ok).toBe(false);
  });

  it("mapErr deve transformar erro quando Err", () => {
    const r = wrapErr("erro");
    const r2 = mapErr(r, (e) => `prefixo:${e}`);

    expect(r2.ok).toBe(false);
    if (!r2.ok) expect(r2.error).toBe("prefixo:erro");
  });

  it("mapErr NÃO deve executar quando Ok", () => {
    const r = wrapOk(10);
    const r2 = mapErr(r, () => "nunca");

    expect(r2.ok).toBe(true);
    if (r2.ok) expect(r2.value).toBe(10);
  });

  it("andThen deve encadear operações quando Ok", () => {
    const r = wrapOk(5);

    const r2 = andThen(r, (v) => wrapOk(v + 1));
    const r3 = andThen(r2, (v) => wrapOk(v * 2));

    expect(r3.ok).toBe(true);
    if (r3.ok) expect(r3.value).toBe(12);
  });

  it("andThen deve propagar Err sem executar funções", () => {
    const r = wrapErr("quebrou");

    const r2 = andThen(r, () => wrapOk(999));

    expect(r2.ok).toBe(false);
  });

  it("match deve reduzir Ok corretamente", () => {
    const r = wrapOk(7);

    const value = match(r, {
      ok: (v) => v * 10,
      err: () => 0,
    });

    expect(value).toBe(70);
  });

  it("match deve reduzir Err corretamente", () => {
    const r = wrapErr("falha");

    const value = match(r, {
      ok: () => 1,
      err: () => 0,
    });

    expect(value).toBe(0);
  });

  it("unwrapOr deve devolver fallback em Err", () => {
    const r = wrapErr("erro");
    const v = unwrapOr(r, 123);

    expect(v).toBe(123);
  });

  it("unwrapOr deve devolver value em Ok", () => {
    const r = wrapOk(55);
    const v = unwrapOr(r, 123);

    expect(v).toBe(55);
  });
});
