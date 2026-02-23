import { describe, it, expect } from "vitest";
import { isErr, isOk, wrapOk, wrapErr, map, mapAsync, mapErr, mapErrAsync, andThen, andThenAsync, match, unwrapOr, unwrapOrElse, tap, tapErr  } from "../src/result";

describe("#1 - operações fundamentais", () => {
  it("#1.1 - isOk/isErr devem funcionar como type guards", () => {
    const ok = wrapOk(1);
    const err = wrapErr("x");

    expect(isOk(ok)).toBe(true);
    expect(isErr(ok)).toBe(false);

    expect(isOk(err)).toBe(false);
    expect(isErr(err)).toBe(true);
  });

  it("#1.2 - map deve transformar value quando Ok", () => {
    const r = wrapOk(2);
    const r2 = map(r, (v) => v * 3);

    expect(r2.ok).toBe(true);
    if (r2.ok) expect(r2.value).toBe(6);
  });

  it("#1.3 - map NÃO deve executar quando Err", () => {
    const r = wrapErr("falha");
    const r2 = map(r, (v: number) => v * 3);

    expect(r2.ok).toBe(false);
  });

  it("#1.4 - mapErr deve transformar erro quando Err", () => {
    const r = wrapErr("erro");
    const r2 = mapErr(r, (e) => `prefixo:${e}`);

    expect(r2.ok).toBe(false);
    if (!r2.ok) expect(r2.error).toBe("prefixo:erro");
  });

  it("#1.5 - mapErr NÃO deve executar quando Ok", () => {
    const r = wrapOk(10);
    const r2 = mapErr(r, () => "nunca");

    expect(r2.ok).toBe(true);
    if (r2.ok) expect(r2.value).toBe(10);
  });

  it("#1.6 - andThen deve encadear operações quando Ok", () => {
    const r = wrapOk(5);

    const r2 = andThen(r, (v) => wrapOk(v + 1));
    const r3 = andThen(r2, (v) => wrapOk(v * 2));

    expect(r3.ok).toBe(true);
    if (r3.ok) expect(r3.value).toBe(12);
  });

  it("#1.7 - andThen deve propagar Err sem executar funções", () => {
    const r = wrapErr("quebrou");

    const r2 = andThen(r, () => wrapOk(999));

    expect(r2.ok).toBe(false);
  });

  it("#1.8 - match deve reduzir Ok corretamente", () => {
    const r = wrapOk(7);

    const value = match(r, {
      ok: (v) => v * 10,
      err: () => 0,
    });

    expect(value).toBe(70);
  });

  it("#1.9 - match deve reduzir Err corretamente", () => {
    const r = wrapErr("falha");

    const value = match(r, {
      ok: () => 1,
      err: () => 0,
    });

    expect(value).toBe(0);
  });

  it("#1.10 - unwrapOr deve devolver fallback em Err", () => {
    const r = wrapErr("erro");
    const v = unwrapOr(r, 123);

    expect(v).toBe(123);
  });

  it("#1.11 - unwrapOr deve devolver value em Ok", () => {
    const r = wrapOk(55);
    const v = unwrapOr(r, 123);

    expect(v).toBe(55);
  });

  it("#1.12 - unwrapOrElse deve executar fallback apenas em Err", () => {
    const rOk = wrapOk(10);
    const rErr = wrapErr("ops");

    let called = 0;

    const v1 = unwrapOrElse(rOk, () => {
      called += 1;
      return 999;
    });
    expect(v1).toBe(10);
    expect(called).toBe(0);

    const v2 = unwrapOrElse(rErr, (e) => {
      called += 1;
      return e === "ops" ? 123 : 0;
    });
    expect(v2).toBe(123);
    expect(called).toBe(1);
  });

  it("#1.13 - tap deve executar side-effect apenas em Ok", () => {
    const rOk = wrapOk(2);
    const rErr = wrapErr("falha");

    let seen: number | null = null;
    let calledErr = 0;

    const out1 = tap(rOk, (v) => {
      seen = v;
    });
    const out2 = tap(rErr, () => {
      calledErr += 1;
    });

    expect(out1).toStrictEqual(rOk);
    expect(out2).toStrictEqual(rErr);
    expect(seen).toBe(2);
    expect(calledErr).toBe(0);
  });

  it("#1.14 - tapErr deve executar side-effect apenas em Err", () => {
    const rOk = wrapOk(2);
    const rErr = wrapErr("falha");

    let seen: string | null = null;
    let calledOk = 0;

    const out1 = tapErr(rOk, () => {
      calledOk += 1;
    });
    const out2 = tapErr(rErr, (e) => {
      seen = e;
    });

    expect(out1).toStrictEqual(rOk);
    expect(out2).toStrictEqual(rErr);
    expect(seen).toBe("falha");
    expect(calledOk).toBe(0);
  });
});

describe("#2 - Operações assíncronas", () => {
  it("#2.1 - mapAsync deve transformar value quando Ok e não executar em Err", async () => {
    const rOk = wrapOk(3);
    const rErr = wrapErr("falha");

    const out1 = await mapAsync(rOk, async (v) => v * 2);
    expect(out1.ok).toBe(true);
    if (out1.ok) expect(out1.value).toBe(6);

    let called = 0;
    const out2 = await mapAsync(rErr, async () => {
      called += 1;
      return 999;
    });
    expect(out2.ok).toBe(false);
    expect(called).toBe(0);
  });

  it("#2.2 - mapErrAsync deve transformar erro quando Err e não executar em Ok", async () => {
    const rOk = wrapOk(3);
    const rErr = wrapErr("falha");

    const out1 = await mapErrAsync(rErr, async (e) => `x:${e}`);
    expect(out1.ok).toBe(false);
    if (!out1.ok) expect(out1.error).toBe("x:falha");

    let called = 0;
    const out2 = await mapErrAsync(rOk, async () => {
      called += 1;
      return "nunca";
    });
    expect(out2.ok).toBe(true);
    if (out2.ok) expect(out2.value).toBe(3);
    expect(called).toBe(0);
  });

  it("#2.3 - andThenAsync deve encadear operações quando Ok e propagar Err", async () => {
    const rOk = wrapOk(5);
    const rErr = wrapErr("quebrou");

    const r2 = await andThenAsync(rOk, async (v) => wrapOk(v + 1));
    const r3 = await andThenAsync(r2, async (v) => wrapOk(v * 2));
    expect(r3.ok).toBe(true);
    if (r3.ok) expect(r3.value).toBe(12);

    let called = 0;
    const r4 = await andThenAsync(rErr, async () => {
      called += 1;
      return wrapOk(999);
    });
    expect(r4.ok).toBe(false);
    expect(called).toBe(0);
  });
});
