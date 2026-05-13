// packages/core/__tests__/kernel/result.test.ts

import { describe, expect, it } from "vitest";
import { andThen, andThenAsync, isErr, isOk, map, mapAsync, mapErr, mapErrAsync, match, tap, tapErr, unwrapOr, unwrapOrElse, wrapErr, wrapOk } 
  from "../src/kernel";

describe("#1 - Result básico", () => {
  it("#1.1 - deve criar Ok e Err", () => {
    const ok = wrapOk(1);
    const err = wrapErr("erro");

    expect(ok).toEqual({ ok: true, value: 1 });
    expect(err).toEqual({ ok: false, error: "erro" });

    expect(isOk(ok)).toBe(true);
    expect(isErr(err)).toBe(true);
  });

  it("#1.2 - map deve transformar apenas Ok", () => {
    expect(map(wrapOk(2), (v) => v * 2)).toEqual(wrapOk(4));
    expect(map(wrapErr("erro"), (v: number) => v * 2)).toEqual(wrapErr("erro"));
  });

  it("#1.3 - mapErr deve transformar apenas Err", () => {
    expect(mapErr(wrapErr("erro"), (e) => `x:${e}`)).toEqual(wrapErr("x:erro"));
    expect(mapErr(wrapOk(1), () => "novo")).toEqual(wrapOk(1));
  });

  it("#1.4 - andThen deve encadear Ok e propagar Err", () => {
    const ok = andThen(wrapOk(2), (v) => wrapOk(v + 1));
    const err = andThen(wrapErr("erro"), () => wrapOk(99));

    expect(ok).toEqual(wrapOk(3));
    expect(err).toEqual(wrapErr("erro"));
  });

  it("#1.5 - match deve reduzir Ok e Err", () => {
    expect(match(wrapOk(2), { ok: (v) => v * 3, err: () => 0 })).toBe(6);
    expect(match(wrapErr("erro"), { ok: () => 1, err: () => 0 })).toBe(0);
  });

  it("#1.6 - unwrapOr e unwrapOrElse devem aplicar fallback apenas em Err", () => {
    expect(unwrapOr(wrapOk(10), 99)).toBe(10);
    expect(unwrapOr(wrapErr("erro"), 99)).toBe(99);

    expect(unwrapOrElse(wrapOk(10), () => 99)).toBe(10);
    expect(unwrapOrElse(wrapErr("erro"), () => 99)).toBe(99);
  });

  it("#1.7 - tap e tapErr devem preservar o Result original", () => {
    let valorOk = 0;
    let valorErr = "";

    const ok = wrapOk(5);
    const err = wrapErr("falha");

    expect(tap(ok, (v) => { valorOk = v; })).toBe(ok);
    expect(tapErr(err, (e) => { valorErr = e; })).toBe(err);

    expect(valorOk).toBe(5);
    expect(valorErr).toBe("falha");
  });
});

describe("#2 - Result assíncrono", () => {
  it("#2.1 - mapAsync deve transformar apenas Ok", async () => {
    expect(await mapAsync(wrapOk(2), async (v) => v * 2)).toEqual(wrapOk(4));

    let chamado = false;
    const err = await mapAsync(wrapErr("erro"), async () => {
      chamado = true;
      return 99;
    });

    expect(err).toEqual(wrapErr("erro"));
    expect(chamado).toBe(false);
  });

  it("#2.2 - mapErrAsync deve transformar apenas Err", async () => {
    expect(await mapErrAsync(wrapErr("erro"), async (e) => `x:${e}`)).toEqual(wrapErr("x:erro"));

    let chamado = false;
    const ok = await mapErrAsync(wrapOk(1), async () => {
      chamado = true;
      return "erro";
    });

    expect(ok).toEqual(wrapOk(1));
    expect(chamado).toBe(false);
  });

  it("#2.3 - andThenAsync deve encadear Ok e propagar Err", async () => {
    expect(await andThenAsync(wrapOk(2), async (v) => wrapOk(v + 1))).toEqual(wrapOk(3));

    let chamado = false;
    const err = await andThenAsync(wrapErr("erro"), async () => {
      chamado = true;
      return wrapOk(99);
    });

    expect(err).toEqual(wrapErr("erro"));
    expect(chamado).toBe(false);
  });
});
